import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import Razorpay from "razorpay";
import { supabase } from "../lib/supabase.js";
import { ApiError } from "../lib/errors.js";
import { incrementCouponUses, validateCouponForCart } from "../lib/couponsStore.js";
import { getStoreSettings } from "../lib/settingsStore.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";
import {
  notifyNewOrder,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyStatusChange,
  notifyCancellation,
  notifyRefundUpdate,
} from "../lib/email.js";

export const ordersRouter = Router();

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

let razorpay: Razorpay | null = null;
if (
  razorpayKeyId &&
  razorpayKeySecret &&
  razorpayKeyId !== "rzp_test_your_key_id" &&
  razorpayKeySecret !== "your_razorpay_key_secret" &&
  !razorpayKeySecret.includes("*")
) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

const orderItemSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  productImage: z.string().optional().nullable().or(z.literal("")),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  line1: z.string().min(3),
  line2: z.string().optional().nullable().or(z.literal("")),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
});

const customerSchema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["customer", "admin"]).default("customer"),
  avatar: z.string().optional().nullable().or(z.literal("")),
});

const createOrderSchema = z.object({
  customer: customerSchema,
  address: addressSchema,
  items: z.array(orderItemSchema).min(1),
  shipping: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  couponCode: z.string().optional().nullable().or(z.literal("")),
  paymentMethod: z.string().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable().or(z.literal("")),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const paymentFailedSchema = z.object({
  orderId: z.string().min(1),
  error: z.string().optional(),
});

const orderStatusSchema = z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]);

function toOrderNumber() {
  return `AVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function upsertUser(customer: z.infer<typeof customerSchema>) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        external_id: customer.id || null,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        avatar: customer.avatar || null,
      },
      { onConflict: "email" }
    )
    .select("id, external_id, name, email, role, avatar")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to save customer");
  }

  return data;
}

async function syncInventoryAndDeductStock(orderId: string) {
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items) return;

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
}

async function restoreStock(orderId: string) {
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items) return;

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({ stock: (product.stock || 0) + item.quantity, updated_at: new Date().toISOString() })
        .eq("id", item.product_id);
    }
  }
}

async function syncOrderRefundStatus(order: any) {
  if (!order || !order.razorpayRefundId) return order;
  if (order.paymentStatus === "refunded" || order.paymentStatus === "refund_failed") return order;
  if (order.paymentStatus !== "refund_initiated" && order.paymentStatus !== "refund_processing") return order;

  let rzpStatus: string | null = null;

  if (razorpay) {
    try {
      const refund = await razorpay.refunds.fetch(order.razorpayRefundId);
      rzpStatus = refund.status; // 'pending', 'processed', 'failed'
    } catch (err) {
      console.error("Failed to fetch Razorpay refund status:", err);
    }
  } else {
    // In test/mock mode, simulate realistic stage progression over time
    const refundTime = new Date(order.updatedAt || order.createdAt).getTime();
    const elapsedSec = (Date.now() - refundTime) / 1000;
    if (elapsedSec > 15) {
      rzpStatus = "processed";
    } else if (elapsedSec > 5) {
      rzpStatus = "pending";
    } else {
      rzpStatus = "initiated";
    }
  }

  let newPaymentStatus = order.paymentStatus;
  if (rzpStatus === "processed") {
    newPaymentStatus = "refunded";
  } else if (rzpStatus === "pending") {
    newPaymentStatus = "refund_processing";
  } else if (rzpStatus === "failed") {
    newPaymentStatus = "refund_failed";
  } else if (rzpStatus === "initiated") {
    newPaymentStatus = "refund_initiated";
  }

  if (newPaymentStatus !== order.paymentStatus) {
    await supabase
      .from("orders")
      .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    order.paymentStatus = newPaymentStatus;
  }

  return order;
}

async function getOrderById(orderId: string) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Order not found");
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const { data: customer, error: customerError } = await supabase
    .from("users")
    .select("id, external_id, name, email, role, avatar")
    .eq("id", order.user_id)
    .single();

  if (customerError || !customer) {
    throw new Error(customerError?.message || "Customer not found");
  }

  const orderObj = {
    id: order.id,
    orderNumber: order.order_number,
    customer,
    status: order.status,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    discount: Number(order.discount),
    total: Number(order.total),
    couponCode: order.coupon_code,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    razorpayRefundId: order.razorpay_refund_id || null,
    notes: order.notes,
    trackingNumber: order.tracking_number,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    address: {
      name: order.shipping_name,
      phone: order.shipping_phone,
      line1: order.shipping_line1,
      line2: order.shipping_line2,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
    },
    items: (items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productSlug: item.product_slug,
      productName: item.product_name,
      productImage: item.product_image,
      price: Number(item.price),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),
  };

  return await syncOrderRefundStatus(orderObj);
}

ordersRouter.post("/", optionalAuth, async (req, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);

    // If user is authenticated, guarantee consistent customer identity
    if (req.user) {
      body.customer.id = req.user.external_id || req.user.id;
      body.customer.email = req.user.email;
      if (req.user.name && (!body.customer.name || body.customer.name.trim() === "")) {
        body.customer.name = req.user.name;
      }
    }

    const customer = await upsertUser(body.customer);

    // SECURITY: Look up true product prices and info directly from database
    const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
    const { data: dbProducts, error: dbProductsError } = await supabase
      .from("products")
      .select("id, slug, name, price, stock, images")
      .in("id", productIds);

    if (dbProductsError || !dbProducts || dbProducts.length === 0) {
      throw new ApiError(400, "Unable to verify product details in cart.");
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Construct verified items with server-side authoritative pricing
    const verifiedItems = body.items.map((item) => {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        throw new ApiError(400, `Product not found or currently unavailable: ${item.productName}`);
      }
      return {
        ...item,
        productSlug: dbProduct.slug || item.productSlug,
        productName: dbProduct.name || item.productName,
        productImage: item.productImage || (dbProduct.images && dbProduct.images[0]) || null,
        price: Number(dbProduct.price), // Authoritative price from DB
      };
    });

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate authoritative shipping based on store settings
    const settings = await getStoreSettings();
    const calculatedShipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const shippingFee = body.shipping !== undefined ? Math.max(0, calculatedShipping) : calculatedShipping;

    let discount = 0;
    let validCouponCode: string | null = null;

    // SECURITY: Discount is ONLY calculated through server-side coupon validation
    if (body.couponCode && body.couponCode.trim()) {
      const couponRes = await validateCouponForCart(body.couponCode, subtotal);
      if (couponRes.valid && couponRes.discountAmount) {
        discount = Math.min(couponRes.discountAmount, subtotal + shippingFee);
        validCouponCode = couponRes.code || body.couponCode.toUpperCase().trim();
      } else {
        throw new ApiError(400, couponRes.message || "The entered coupon code is invalid or expired.");
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discount);

    const isRazorpay = body.paymentMethod === "razorpay";
    const paymentStatus = isRazorpay ? "pending" : "cod";
    const orderNumber = toOrderNumber();

    let razorpayOrderId: string | null = null;

    if (isRazorpay) {
      if (razorpay) {
        try {
          const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(total * 100), // Amount in paise
            currency: "INR",
            receipt: orderNumber,
            notes: {
              customer_email: customer.email,
              customer_name: customer.name,
            },
          });
          razorpayOrderId = razorpayOrder.id;
        } catch (rzpErr: any) {
          console.error("Razorpay order creation failed:", rzpErr);
          const isAuthError = rzpErr?.statusCode === 401 || rzpErr?.error?.description === "Authentication failed";
          if (isAuthError) {
            throw new ApiError(
              400,
              `Razorpay Authentication Failed: Invalid Key Secret in backend/.env. Please replace RAZORPAY_KEY_SECRET with your real secret key from https://dashboard.razorpay.com/app/keys.`
            );
          }
          const rzpMsg = rzpErr?.error?.description || rzpErr?.message || "Razorpay API error";
          throw new ApiError(400, `Razorpay Order Error: ${rzpMsg}`);
        }
      } else {
        // Fallback for development/testing when keys are placeholders
        razorpayOrderId = `order_mock_${Math.random().toString(36).slice(2, 12)}`;
      }
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_role: customer.role,
        status: "processing",
        subtotal,
        shipping: shippingFee,
        discount,
        total,
        coupon_code: validCouponCode || null,
        payment_method: body.paymentMethod || null,
        payment_status: paymentStatus,
        razorpay_order_id: razorpayOrderId,
        notes: body.notes || null,
        shipping_name: body.address.name,
        shipping_phone: body.address.phone,
        shipping_line1: body.address.line1,
        shipping_line2: body.address.line2 || null,
        shipping_city: body.address.city,
        shipping_state: body.address.state,
        shipping_pincode: body.address.pincode,
      })
      .select("id")
      .single();

    if (validCouponCode) {
      incrementCouponUses(validCouponCode).catch(() => {});
    }

    if (error || !order) {
      throw new Error(error?.message || "Failed to create order");
    }

    const itemsPayload = verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_slug: item.productSlug,
      product_name: item.productName,
      product_image: item.productImage || null,
      price: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // If Cash on Delivery, deduct stock immediately
    if (body.paymentMethod === "cod") {
      await syncInventoryAndDeductStock(order.id);
    }

    const createdOrder = await getOrderById(order.id);

    // Send order confirmation emails (fire-and-forget)
    notifyNewOrder({
      orderNumber: createdOrder.orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      total: createdOrder.total,
      items: createdOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
      address: createdOrder.address,
      paymentMethod: body.paymentMethod,
    });

    res.status(201).json({
      ...createdOrder,
      razorpayKeyId: razorpayKeyId || "rzp_test_your_key_id",
      razorpayAmount: Math.round(total * 100),
      currency: "INR",
    });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/verify-payment", async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentSchema.parse(req.body);

    let isValid = false;

    if (razorpayKeySecret && razorpayKeySecret !== "your_razorpay_key_secret") {
      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(generatedSignature),
          Buffer.from(razorpaySignature)
        );
      } catch {
        isValid = false;
      }
    } else {
      // Mock / Dev verification fallback for test credentials
      isValid = true;
    }

    if (!isValid) {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return res.status(400).json({ error: "Invalid payment signature verification failed." });
    }

    // Mark as successful & paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "successful",
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Sync inventory and reduce product stock
    await syncInventoryAndDeductStock(orderId);

    const updatedOrder = await getOrderById(orderId);

    // Send payment success email (fire-and-forget)
    notifyPaymentSuccess({
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.customer.name,
      customerEmail: updatedOrder.customer.email,
      total: updatedOrder.total,
      items: updatedOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
      address: updatedOrder.address,
      paymentMethod: updatedOrder.paymentMethod,
    });

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/payment-failed", async (req, res, next) => {
  try {
    const { orderId } = paymentFailedSchema.parse(req.body);

    await supabase
      .from("orders")
      .update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Send payment failed email (fire-and-forget)
    try {
      const failedOrder = await getOrderById(orderId);
      notifyPaymentFailed({
        orderNumber: failedOrder.orderNumber,
        customerName: failedOrder.customer.name,
        customerEmail: failedOrder.customer.email,
        total: failedOrder.total,
        items: failedOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
        address: failedOrder.address,
        paymentMethod: failedOrder.paymentMethod,
      });
    } catch (emailErr) {
      console.error("Failed to send payment failed notification:", emailErr);
    }

    res.json({ success: true, message: "Order payment marked as failed" });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/:id/retry-payment", optionalAuth, async (req, res, next) => {
  try {
    const orderId = String(req.params.id);
    const order = await getOrderById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // IDOR Check: If user is authenticated, ensure they own the order or are admin
    if (req.user && req.user.role !== "admin") {
      const isOwner =
        (order.customer.email && order.customer.email.toLowerCase() === req.user.email.toLowerCase()) ||
        order.customer.id === req.user.id ||
        (order.customer.external_id && order.customer.external_id === req.user.external_id);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied. You do not have permission to retry payment for this order." });
      }
    }

    if (order.paymentStatus === "successful") {
      throw new ApiError(400, "Order payment is already successful");
    }

    const total = order.total;
    let razorpayOrderId: string | null = order.razorpayOrderId || null;

    if (razorpay) {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(total * 100), // Amount in paise
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            customer_email: order.customer.email,
            customer_name: order.customer.name,
            retry: "true",
          },
        });
        razorpayOrderId = razorpayOrder.id;

        await supabase
          .from("orders")
          .update({
            razorpay_order_id: razorpayOrderId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      } catch (rzpErr: any) {
        console.error("Razorpay retry order creation failed:", rzpErr);
        const rzpMsg = rzpErr?.error?.description || rzpErr?.message || "Razorpay API error";
        throw new ApiError(400, `Razorpay Order Error: ${rzpMsg}`);
      }
    } else {
      if (!razorpayOrderId) {
        razorpayOrderId = `order_mock_${Math.random().toString(36).slice(2, 12)}`;
        await supabase
          .from("orders")
          .update({
            razorpay_order_id: razorpayOrderId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
    }

    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      razorpayOrderId,
      razorpayKeyId: razorpayKeyId || "rzp_test_your_key_id",
      razorpayAmount: Math.round(total * 100),
      currency: "INR",
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.address.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

// List orders with strict authorization
ordersRouter.get("/", optionalAuth, async (req, res, next) => {
  try {
    const scope = String(req.query.scope || "user");

    // Admin scope requires admin privileges
    if (scope === "all") {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin access required to view all orders." });
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      const orders = await Promise.all((data || []).map((row) => getOrderById(row.id)));
      return res.json(orders);
    }

    // Customer scope: Only return orders belonging to authenticated user
    if (!req.user) {
      return res.json([]);
    }

    const cleanEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .or(`user_id.eq.${userId},customer_email.ilike.${cleanEmail}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const orders = await Promise.all((data || []).map((row) => getOrderById(row.id)));
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Get single order with strict IDOR ownership check
ordersRouter.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const orderId = String(req.params.id);
    const order = await getOrderById(orderId);

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required to view order details." });
    }

    // Admin can view any order, otherwise verify owner
    if (req.user.role !== "admin") {
      const isOwner =
        (order.customer.email && order.customer.email.toLowerCase() === req.user.email.toLowerCase()) ||
        order.customer.id === req.user.id ||
        (order.customer.external_id && order.customer.external_id === req.user.external_id);

      if (!isOwner) {
        return res.status(403).json({ error: "Access denied. You do not have permission to view this order." });
      }
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Admin status update
ordersRouter.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const orderId = String(req.params.id);
    const newStatus = orderStatusSchema.parse(req.body.status);
    const order = await getOrderById(orderId);

    // Block status changes to cancelled if shipped or delivered
    if (newStatus === "cancelled" && (order.status === "shipped" || order.status === "delivered")) {
      throw new ApiError(400, `Cannot cancel order that has already been ${order.status}.`);
    }

    if (newStatus === "cancelled" && order.status !== "cancelled") {
      let refundId: string | null = null;
      let newPaymentStatus = order.paymentStatus;

      if (order.paymentStatus === "successful") {
        if (razorpay && order.razorpayPaymentId) {
          try {
            const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
              amount: Math.round(order.total * 100),
              notes: { reason: "Order cancelled by admin" },
            });
            refundId = refund.id;
          } catch (rzpErr: any) {
            console.error("Razorpay admin cancellation refund error:", rzpErr);
          }
        } else {
          refundId = `rfnd_mock_${Math.random().toString(36).slice(2, 12)}`;
        }
        newPaymentStatus = "refunded";
      }

      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          payment_status: newPaymentStatus,
          razorpay_refund_id: refundId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      await restoreStock(orderId);
      const cancelledOrder = await getOrderById(orderId);

      // Send cancellation email (admin cancelled it)
      notifyCancellation({
        orderNumber: cancelledOrder.orderNumber,
        customerName: cancelledOrder.customer.name,
        customerEmail: cancelledOrder.customer.email,
        total: cancelledOrder.total,
        items: cancelledOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
        address: cancelledOrder.address,
        paymentMethod: cancelledOrder.paymentMethod,
      }, "admin");

      // If refund was initiated, also send refund notification
      if (newPaymentStatus === "refunded" || newPaymentStatus === "refund_initiated") {
        notifyRefundUpdate({
          orderNumber: cancelledOrder.orderNumber,
          customerName: cancelledOrder.customer.name,
          customerEmail: cancelledOrder.customer.email,
          total: cancelledOrder.total,
          items: cancelledOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
          address: cancelledOrder.address,
          paymentMethod: cancelledOrder.paymentMethod,
        }, newPaymentStatus);
      }

      return res.json(cancelledOrder);
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update order");
    }

    const updatedOrder = await getOrderById(data.id);

    // Send status change email (shipped/delivered)
    notifyStatusChange({
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.customer.name,
      customerEmail: updatedOrder.customer.email,
      total: updatedOrder.total,
      items: updatedOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
      address: updatedOrder.address,
      paymentMethod: updatedOrder.paymentMethod,
      trackingNumber: updatedOrder.trackingNumber,
    }, newStatus);

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

// User cancellation / refund request with ownership verification
ordersRouter.post("/:id/refund", requireAuth, async (req, res, next) => {
  try {
    const orderId = String(req.params.id);
    const order = await getOrderById(orderId);

    // IDOR Check: Caller must own the order or be an admin
    if (req.user!.role !== "admin") {
      const isOwner =
        (order.customer.email && order.customer.email.toLowerCase() === req.user!.email.toLowerCase()) ||
        order.customer.id === req.user!.id ||
        (order.customer.external_id && order.customer.external_id === req.user!.external_id);

      if (!isOwner) {
        return res.status(403).json({ error: "Access denied. You do not have permission to cancel this order." });
      }
    }

    // Block refund if shipped or delivered
    if (order.status === "shipped" || order.status === "delivered") {
      throw new ApiError(400, `Cannot cancel or refund order that has already been ${order.status}.`);
    }

    if (order.status === "cancelled") {
      throw new ApiError(400, "Order is already cancelled.");
    }

    // Enforce 8 hour limit for user cancellation (if not admin)
    if (req.user!.role !== "admin") {
      const createdAt = new Date(order.createdAt).getTime();
      const hoursSinceOrder = (Date.now() - createdAt) / (1000 * 60 * 60);
      if (!isNaN(createdAt) && hoursSinceOrder > 8) {
        throw new ApiError(400, "Cancellation window of 8 hours has expired for this order.");
      }
    }

    let refundId: string | null = null;
    let newPaymentStatus = order.paymentStatus;

    if (order.paymentStatus === "successful") {
      let rzpStatus: string | null = null;
      if (razorpay && order.razorpayPaymentId) {
        try {
          const refund: any = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.total * 100),
            notes: { reason: "Customer cancellation within 8 hours" },
          });
          refundId = refund.id;
          rzpStatus = refund.status; // 'pending', 'processed', 'failed'
        } catch (rzpErr: any) {
          console.error("Razorpay refund error:", rzpErr);
          const rzpMsg = rzpErr?.error?.description || rzpErr?.message || "Razorpay API refund error";
          throw new ApiError(400, `Razorpay Refund Failed: ${rzpMsg}`);
        }
      } else {
        refundId = `rfnd_mock_${Math.random().toString(36).slice(2, 12)}`;
        rzpStatus = "initiated";
      }

      if (rzpStatus === "processed") {
        newPaymentStatus = "refunded";
      } else if (rzpStatus === "pending") {
        newPaymentStatus = "refund_processing";
      } else {
        newPaymentStatus = "refund_initiated";
      }
    }

    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        payment_status: newPaymentStatus,
        razorpay_refund_id: refundId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await restoreStock(orderId);

    const updatedOrder = await getOrderById(orderId);

    // Send cancellation email (user cancelled it)
    const emailData = {
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.customer.name,
      customerEmail: updatedOrder.customer.email,
      total: updatedOrder.total,
      items: updatedOrder.items.map((i: any) => ({ productName: i.productName, quantity: i.quantity, price: i.price })),
      address: updatedOrder.address,
      paymentMethod: updatedOrder.paymentMethod,
    };
    notifyCancellation(emailData, "user");

    // If refund was initiated, also send refund notification
    if (newPaymentStatus !== order.paymentStatus && (newPaymentStatus === "refund_initiated" || newPaymentStatus === "refund_processing" || newPaymentStatus === "refunded")) {
      notifyRefundUpdate(emailData, newPaymentStatus);
    }

    res.json({
      success: true,
      message: order.paymentStatus === "successful" ? "Order cancelled and refund initiated successfully." : "Order cancelled successfully.",
      order: updatedOrder,
      refundId,
    });
  } catch (err) {
    next(err);
  }
});

// Sync refund status from payment provider
ordersRouter.post("/:id/sync-refund", requireAuth, async (req, res, next) => {
  try {
    const orderId = String(req.params.id);
    let order = await getOrderById(orderId);

    // Ownership check
    if (req.user!.role !== "admin") {
      const isOwner =
        (order.customer.email && order.customer.email.toLowerCase() === req.user!.email.toLowerCase()) ||
        order.customer.id === req.user!.id ||
        (order.customer.external_id && order.customer.external_id === req.user!.external_id);

      if (!isOwner) {
        return res.status(403).json({ error: "Access denied." });
      }
    }

    order = await syncOrderRefundStatus(order);
    res.json({
      success: true,
      message: `Refund status checked with Razorpay: ${order.paymentStatus}`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

