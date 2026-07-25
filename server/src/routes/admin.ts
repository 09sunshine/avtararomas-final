import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();
const prisma = new PrismaClient();

// All admin routes require auth + admin role
adminRouter.use(authenticate, requireAdmin);

// GET /api/admin/stats
adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [totalRevenue, totalOrders, totalCustomers, totalProducts, recentOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
      }),
    ]);

    res.json({
      revenue: totalRevenue._sum.total ?? 0,
      orders: totalOrders,
      customers: totalCustomers,
      products: totalProducts,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/revenue — monthly breakdown for charts
adminRouter.get("/revenue", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } },
      select: { total: true, createdAt: true },
    });

    const byMonth: Record<string, number> = {};
    orders.forEach(({ total, createdAt }) => {
      const key = createdAt.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] ?? 0) + total;
    });

    res.json(Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue })));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/status
adminRouter.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(order);
  } catch (err) {
    next(err);
  }
});
