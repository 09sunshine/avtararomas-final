import { Router } from "express";
import crypto from "crypto";
import { supabase } from "../lib/supabase.js";
import { notifyRefundUpdate } from "../lib/email.js";

export const webhooksRouter = Router();

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
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload?.refund?.entity;

    if (!payload || !payload.id) {
      return res.json({ status: "ignored" });
    }

    const refundId = payload.id;
    const refundStatus = payload.status; // 'processed', 'failed', 'pending'

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
        .or(`razorpay_refund_id.eq.${refundId},razorpay_payment_id.eq.${payload.payment_id}`)
        .select("id, order_number, customer_name, customer_email, total, payment_method, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_pincode");

      // Send refund status email for each affected order
      if (updatedOrders && updatedOrders.length > 0) {
        for (const order of updatedOrders) {
          // Fetch order items for the email
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
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
});
