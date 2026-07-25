import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const ordersRouter = Router();
const prisma = new PrismaClient();

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive(), size: z.string().optional(), color: z.string().optional() })),
  addressId: z.string(),
  couponCode: z.string().optional(),
});

// POST /api/orders
ordersRouter.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { items, addressId, couponCode } = createOrderSchema.parse(req.body);

    // Fetch products and validate stock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw Object.assign(new Error(`Product ${item.productId} not found`), { status: 400 });
      if (product.stock < item.quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}`), { status: 400 });
      const price = product.price;
      total += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price, size: item.size, color: item.color };
    });

    // Apply coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({ where: { code: couponCode.toUpperCase(), active: true } });
      if (coupon) {
        discount = coupon.type === "percentage" ? total * (coupon.discount / 100) : coupon.discount;
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const shipping = total >= 999 ? 0 : 99;
    const finalTotal = total - discount + shipping;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.userId!,
          addressId,
          total: finalTotal,
          shipping,
          discount,
          couponCode,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } }, address: true },
      });

      // Decrement stock
      await Promise.all(items.map((item) => tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })));

      return created;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — user's orders
ordersRouter.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { product: { select: { name: true, images: true } } } }, address: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
ordersRouter.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: { include: { product: true } }, address: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});
