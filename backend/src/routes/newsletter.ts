import { Router } from "express";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { notifyNewsletterSubscription } from "../lib/email.js";

export const newsletterRouter = Router();

const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const supabase = createClient(supabaseUrl, supabaseKey);

const subscribeSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

newsletterRouter.post("/subscribe", async (req, res, next) => {
  try {
    const parsed = subscribeSchema.parse(req.body);
    const email = parsed.email.trim().toLowerCase();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      res.json({
        success: true,
        message: "You're already subscribed to our newsletter!",
        alreadySubscribed: true,
      });
      return;
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email });

    if (insertError) {
      console.error("[Newsletter] Insert error:", insertError);
      res.status(500).json({ error: "Failed to subscribe. Please try again later." });
      return;
    }

    // Send confirmation email in background
    notifyNewsletterSubscription(email).catch((err) => {
      console.error("[Newsletter] Email notification error:", err);
    });

    res.json({
      success: true,
      message: "Welcome to the Inner Circle! You've been subscribed successfully.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      res.status(400).json({
        error: issue ? issue.message : "Validation failed",
        issues: error.issues,
      });
      return;
    }
    next(error);
  }
});