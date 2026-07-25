import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const paymentsRouter = Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payments/create-order
// Creates a Razorpay order and returns the order_id to the frontend
paymentsRouter.post("/create-order", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { amount, currency = "INR", orderId } = z.object({
      amount: z.number().positive(),
      currency: z.string().optional(),
      orderId: z.string(),
    }).parse(req.body);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: orderId,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify
// Verifies Razorpay payment signature and marks order as paid
paymentsRouter.post("/verify", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, internalOrderId } = z.object({
      razorpayOrderId: z.string(),
      razorpayPaymentId: z.string(),
      razorpaySignature: z.string(),
      internalOrderId: z.string(),
    }).parse(req.body);

    // Signature verification
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body).digest("hex");
    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ error: "Payment signature invalid" });
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: internalOrderId, userId: req.userId },
      data: { status: "PROCESSING", razorpayOrderId, razorpayPayId: razorpayPaymentId, paymentMethod: "razorpay" },
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/webhook — Razorpay webhook handler
paymentsRouter.post("/webhook", express_raw(), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const body = (req as any).rawBody;
  const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(body).digest("hex");

  if (signature !== expectedSig) return res.status(400).send("Invalid signature");

  const event = JSON.parse(body);
  if (event.event === "payment.captured") {
    const orderId = event.payload.payment.entity.receipt;
    await prisma.order.updateMany({ where: { id: orderId }, data: { status: "PROCESSING" } });
  }

  res.json({ received: true });
});

function express_raw() {
  return (req: any, _res: any, next: any) => {
    let data = "";
    req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
    req.on("end", () => { req.rawBody = data; next(); });
  };
}
