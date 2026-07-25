import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, type AuthRequest } from "../middleware/auth.js";

export const productsRouter = Router();
const prisma = new PrismaClient();

// GET /api/products — list with filters, sort, pagination
productsRouter.get("/", async (req, res, next) => {
  try {
    const { category, q, sort = "featured", page = "1", limit = "20", minPrice, maxPrice } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
    if (category) where.category = { slug: category };
    if (minPrice || maxPrice) where.price = { gte: minPrice ? parseFloat(minPrice) : undefined, lte: maxPrice ? parseFloat(maxPrice) : undefined };

    const orderBy: any = sort === "price-asc" ? { price: "asc" } : sort === "price-desc" ? { price: "desc" } : sort === "rating" ? [{ reviews: { _count: "desc" } }] : { featured: "desc" };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, orderBy, skip, take: parseInt(limit), include: { category: true, colors: true, _count: { select: { reviews: true } } } }),
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, colors: true, reviews: { include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/reviews
productsRouter.post("/:id/reviews", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rating, comment } = z.object({ rating: z.number().min(1).max(5), comment: z.string().min(10) }).parse(req.body);
    const review = await prisma.review.create({
      data: { rating, comment, userId: req.userId!, productId: req.params.id },
      include: { user: { select: { name: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// POST /api/products — admin only
productsRouter.post("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id — admin only
productsRouter.patch("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id — admin only
productsRouter.delete("/:id", authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
