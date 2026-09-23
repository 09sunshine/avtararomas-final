import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

export const productsRouter = Router();

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  images: z.array(z.string().url()),
  description: z.string().min(1),
  stock: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  sizes: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  topNotes: z.string().optional().nullable().or(z.literal("")),
  heartNotes: z.string().optional().nullable().or(z.literal("")),
  baseNotes: z.string().optional().nullable().or(z.literal("")),
  ingredients: z.string().optional().nullable().or(z.literal("")),
  longevity: z.string().optional().nullable().or(z.literal("")),
  sillage: z.string().optional().nullable().or(z.literal("")),
  season: z.string().optional().nullable().or(z.literal("")),
  origin: z.string().optional().nullable().or(z.literal("")),
  concentration: z.string().optional().nullable().or(z.literal("")),
});

productsRouter.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

productsRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug,
        price: body.price,
        original_price: body.originalPrice,
        category: body.category,
        subcategory: body.subcategory,
        images: body.images,
        description: body.description,
        stock: body.stock,
        tags: body.tags,
        sizes: body.sizes,
        featured: body.featured,
        is_new: body.isNew,
        top_notes: body.topNotes || null,
        heart_notes: body.heartNotes || null,
        base_notes: body.baseNotes || null,
        ingredients: body.ingredients || null,
        longevity: body.longevity || null,
        sillage: body.sillage || null,
        season: body.season || null,
        origin: body.origin || null,
        concentration: body.concentration || null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

productsRouter.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const body = productSchema.parse(req.body);
    const { data, error } = await supabase
      .from("products")
      .update({
        name: body.name,
        slug: body.slug,
        price: body.price,
        original_price: body.originalPrice,
        category: body.category,
        subcategory: body.subcategory,
        images: body.images,
        description: body.description,
        stock: body.stock,
        tags: body.tags,
        sizes: body.sizes,
        featured: body.featured,
        is_new: body.isNew,
        top_notes: body.topNotes || null,
        heart_notes: body.heartNotes || null,
        base_notes: body.baseNotes || null,
        ingredients: body.ingredients || null,
        longevity: body.longevity || null,
        sillage: body.sillage || null,
        season: body.season || null,
        origin: body.origin || null,
        concentration: body.concentration || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

productsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
