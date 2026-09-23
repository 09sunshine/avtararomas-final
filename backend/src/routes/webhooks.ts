import { Router } from "express";
import crypto from "crypto";
import { supabase } from "../lib/supabase.js";
import { notifyRefundUpdate, notifyPaymentSuccess, notifyPaymentFailed } from "../lib/email.js";

export const webhooksRouter = Router();

async function deductStockForOrder(orderId: string) {
  try {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (!items) return;

    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock, updated_at: new Date().toISOString() })
          .eq("id", item.product_id);
      }
    }
  } catch (err) {
    console.error("[Webhooks] Failed to deduct stock:", err);
  }
}

webhooksRouter.post("/razorpay", async (req, res) => {
  try {
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
    const signature = (req.headers["x-razorpay-signature"] as string) || "";

    if (!webhookSecret && process.env.NODE_ENV === "production") {
      console.error("[Webhooks] RAZORPAY_WEBHOOK_SECRET is not configured in production!");
      return res.status(500).json({ error: "Webhook secret is not configured on server" });
    }

    if (webhookSecret) {
      if (!signature) {
        return res.status(400).json({ error: "Missing x-razorpay-signature header" });
      }

      // Razorpay signs the exact raw payload, so prefer the captured raw body
      const rawBody =
        (req as typeof req & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      let isSigValid = false;
      try {
        isSigValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(signature)
        );
      } catch {
        isSigValid = false;
      }

      if (!isSigValid) {
        console.warn("[Webhooks] Invalid webhook signature detected");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body?.event;
    console.log(`[Webhooks] Processing Razorpay event: ${event}`);

    // ─── 1. Payment Captured / Order Paid ──────────────────────────────────
    if (event === "payment.captured" || event === "order.paid") {
      const payment = req.body?.payload?.payment?.entity;
      const orderEntity = req.body?.payload?.order?.entity;
      const razorpayOrderId = payment?.order_id || orderEntity?.id;
      const razorpayPaymentId = payment?.id;

      if (!razorpayOrderId) {
        return res.json({ status: "ignored", reason: "No order_id in payment payload" });
      }

      const { data: order } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email, total, payment_status, payment_method, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_pincode")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (!order) {
        return res.json({ status: "ignored", reason: "Order not found" });
      }

      // If order was already marked successful by frontend checkout, skip duplicate notification
      if (order.payment_status === "successful") {
        return res.json({ status: "already_processed", orderId: order.id });
      }

      await supabase
        .from("orders")
        .update({
          payment_status: "successful",
          razorpay_payment_id: razorpayPaymentId || undefined,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      await deductStockForOrder(order.id);

      // Fetch items and send confirmation email
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity, price")
        .eq("order_id", order.id);

      notifyPaymentSuccess({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        total: Number(order.total),
        items: (items || []).map((i: any) => ({
          productName: i.product_name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        address: {
          name: order.shipping_name,
          line1: order.shipping_line1,
          line2: order.shipping_line2,
          city: order.shipping_city,
          state: order.shipping_state,
          pincode: order.shipping_pincode,
        },
        paymentMethod: order.payment_method || "Razorpay",
      });

      return res.json({ status: "ok", event, orderId: order.id });
    }

    // ─── 2. Payment Failed ─────────────────────────────────────────────────
    if (event === "payment.failed") {
      const payment = req.body?.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;

      if (razorpayOrderId) {
        const { data: order } = await supabase
          .from("orders")
          .select("id, order_number, customer_name, customer_email, total, payment_status, payment_method, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_pincode")
          .eq("razorpay_order_id", razorpayOrderId)
          .single();

        if (order && order.payment_status !== "successful") {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          const { data: items } = await supabase
            .from("order_items")
            .select("product_name, quantity, price")
            .eq("order_id", order.id);

          notifyPaymentFailed({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            total: Number(order.total),
            items: (items || []).map((i: any) => ({
              productName: i.product_name,
              quantity: i.quantity,
              price: Number(i.price),
            })),
            address: {
              name: order.shipping_name,
              line1: order.shipping_line1,
              line2: order.shipping_line2,
              city: order.shipping_city,
              state: order.shipping_state,
              pincode: order.shipping_pincode,
            },
            paymentMethod: order.payment_method || "Razorpay",
          });
        }
      }

      return res.json({ status: "ok", event });
    }

    // ─── 3. Refund Events ──────────────────────────────────────────────────
    const refundPayload = req.body?.payload?.refund?.entity;

    if (refundPayload && refundPayload.id) {
      const refundId = refundPayload.id;
      const refundStatus = refundPayload.status; // 'processed', 'failed', 'pending'

      let newPaymentStatus: string | null = null;

      if (event === "refund.processed" || refundStatus === "processed") {
        newPaymentStatus = "refunded";
      } else if (event === "refund.failed" || refundStatus === "failed") {
        newPaymentStatus = "refund_failed";
      } else if (event === "refund.created" || refundStatus === "pending") {
        newPaymentStatus = "refund_processing";
      }

      if (newPaymentStatus) {
        const { data: updatedOrders } = await supabase
          .from("orders")
          .update({
            payment_status: newPaymentStatus,
            updated_at: new Date().toISOString(),
          })
          .or(`razorpay_refund_id.eq.${refundId},razorpay_payment_id.eq.${refundPayload.payment_id}`)
          .select("id, order_number, customer_name, customer_email, total, payment_method, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_pincode");

        if (updatedOrders && updatedOrders.length > 0) {
          for (const order of updatedOrders) {
            const { data: items } = await supabase
              .from("order_items")
              .select("product_name, quantity, price")
              .eq("order_id", order.id);

            notifyRefundUpdate({
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              total: Number(order.total),
              items: (items || []).map((i: any) => ({
                productName: i.product_name,
                quantity: i.quantity,
                price: Number(i.price),
              })),
              address: {
                name: order.shipping_name,
                line1: order.shipping_line1,
                line2: order.shipping_line2,
                city: order.shipping_city,
                state: order.shipping_state,
                pincode: order.shipping_pincode,
              },
              paymentMethod: order.payment_method,
            }, newPaymentStatus);
          }
        }
      }

      return res.json({ status: "ok", event, paymentStatus: newPaymentStatus });
    }

    return res.json({ status: "ignored", event });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
});
