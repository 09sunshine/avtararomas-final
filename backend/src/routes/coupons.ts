import { Router } from "express";
import { z } from "zod";
import {
  getAllCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  validateCouponForCart,
} from "../lib/couponsStore.js";
import { ApiError } from "../lib/errors.js";
import { requireAdmin } from "../middleware/auth.js";

export const couponsRouter = Router();

const couponSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  discount: z.number().int().min(1).max(90),
  limit: z.number().int().min(1).default(100),
  active: z.boolean().default(true),
  expiry: z.string().optional().nullable(),
  minOrder: z.number().nonnegative().default(0),
});

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

// Validate coupon for user cart checkout
couponsRouter.post("/validate", async (req, res, next) => {
  try {
    const { code, subtotal } = validateSchema.parse(req.body);
    const result = await validateCouponForCart(code, subtotal);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Admin: List all coupons
couponsRouter.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const coupons = await getAllCoupons();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
});

// Admin: Create new coupon
couponsRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const body = couponSchema.parse(req.body);
    const created = await createCoupon({
      code: body.code,
      discount: body.discount,
      limit: body.limit,
      active: body.active,
      expiry: body.expiry || undefined,
      minOrder: body.minOrder,
    });
    res.status(201).json(created);
  } catch (err: any) {
    if (err.message && err.message.includes("already exists")) {
      next(new ApiError(400, err.message));
    } else {
      next(err);
    }
  }
});

// Admin: Update coupon
couponsRouter.put("/:code", requireAdmin, async (req, res, next) => {
  try {
    const code = String(req.params.code);
    const body = couponSchema.partial().parse(req.body);
    const updated = await updateCoupon(code, {
      code: body.code,
      discount: body.discount,
      limit: body.limit,
      active: body.active,
      expiry: body.expiry || undefined,
      minOrder: body.minOrder,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Admin: Toggle active state
couponsRouter.patch("/:code/toggle", requireAdmin, async (req, res, next) => {
  try {
    const code = String(req.params.code);
    const updated = await toggleCouponActive(code);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Admin: Delete coupon
couponsRouter.delete("/:code", requireAdmin, async (req, res, next) => {
  try {
    const code = String(req.params.code);
    const ok = await deleteCoupon(code);
    res.json({ success: ok, message: `Coupon ${code} deleted.` });
  } catch (err) {
    next(err);
  }
});
