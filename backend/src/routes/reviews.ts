import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { ApiError } from "../lib/errors.js";

export const reviewsRouter = Router();

const reviewBodySchema = z.object({
  customer: z.object({
    id: z.string().optional().nullable(),
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Valid email is required"),
    role: z.enum(["customer", "admin"]).default("customer"),
    avatar: z.string().optional().nullable().or(z.literal("")),
  }),
  product: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
  }),
  rating: z.number().int().min(1, "Please select a star rating").max(5),
  comment: z.string().min(3, "Review comment must be at least 3 characters long"),
});

async function upsertReviewUser(customer: z.infer<typeof reviewBodySchema>["customer"]) {
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
    .select("id, name, email, role, avatar")
    .single();

  if (error || !data) {
    throw new ApiError(400, error?.message || "Failed to save reviewer profile");
  }

  return data;
}

async function updateProductRatingStats(productId: string) {
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error || !reviews || reviews.length === 0) return;

  const count = reviews.length;
  const avgRating = Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1));

  await supabase
    .from("products")
    .update({ rating: avgRating, review_count: count, updated_at: new Date().toISOString() })
    .eq("id", productId);
}

reviewsRouter.get("/", async (req, res, next) => {
  try {
    const productId = typeof req.query.productId === "string" ? req.query.productId : undefined;
    const productSlug = typeof req.query.productSlug === "string" ? req.query.productSlug : undefined;

    if (!productId && !productSlug) {
      return res.json([]);
    }

    let query = supabase
      .from("reviews")
      .select("id, product_id, product_slug, product_name, rating, comment, created_at, user_id, users(id, name, avatar)")
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (productSlug) {
      query = query.eq("product_slug", productSlug);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    res.json((data || []).map((row) => ({
      id: row.id,
      productId: row.product_id,
      productSlug: row.product_slug,
      productName: row.product_name,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      user: row.users || { id: row.user_id, name: "Anonymous", avatar: null },
    })));
  } catch (err) {
    next(err);
  }
});

reviewsRouter.post("/", async (req, res, next) => {
  try {
    const parseResult = reviewBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      const errorMessage = firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid review data";
      throw new ApiError(400, errorMessage);
    }

    const body = parseResult.data;
    const customer = await upsertReviewUser(body.customer);

    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        {
          user_id: customer.id,
          product_id: body.product.id,
          product_slug: body.product.slug,
          product_name: body.product.name,
          rating: body.rating,
          comment: body.comment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" }
      )
      .select("id, product_id, product_slug, product_name, rating, comment, created_at, user_id")
      .single();

    if (error || !data) {
      throw new ApiError(400, error?.message || "Failed to save review");
    }

    // Automatically recalculate product rating & review_count in DB
    await updateProductRatingStats(body.product.id);

    res.status(201).json({
      id: data.id,
      productId: data.product_id,
      productSlug: data.product_slug,
      productName: data.product_name,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.created_at,
      user: customer,
    });
  } catch (err) {
    next(err);
  }
});

