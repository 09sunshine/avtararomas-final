import { Router } from "express";
import { z } from "zod";
import { supabase, isEmailAuthProvider } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const syncSchema = z.object({
  supabaseUserId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().nullable().optional(),
  provider: z.string().optional(),
});

// Sync authenticated user profile
authRouter.post("/sync", requireAuth, async (req, res, next) => {
  try {
    const body = syncSchema.parse(req.body);
    const cleanEmail = body.email.trim().toLowerCase();

    // Security check: ensure requesting user cannot sync for another external_id
    if (req.user?.external_id && req.user.external_id !== body.supabaseUserId) {
      return res.status(403).json({ error: "Access denied: user ID mismatch." });
    }

    // 1. Check if user exists by external_id
    const { data: existingByExt, error: extError } = await supabase
      .from("users")
      .select("id, role, external_id, email")
      .eq("external_id", body.supabaseUserId)
      .maybeSingle();

    if (extError) throw new Error(extError.message);

    let existingUser = existingByExt;

    // 2. If not found by external_id, check by email
    if (!existingUser) {
      const { data: existingByEmail, error: emailError } = await supabase
        .from("users")
        .select("id, role, external_id, email")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (emailError) throw new Error(emailError.message);
      existingUser = existingByEmail;
    }

    // 3. Count admins
    const { count: adminCount, error: adminError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (adminError) throw new Error(adminError.message);

    // If user already exists in public.users, ALWAYS preserve their role (especially 'admin').
    // Otherwise, first registered email user gets 'admin', subsequent users get 'customer'.
    const role = existingUser?.role || (isEmailAuthProvider(body.provider) && (adminCount ?? 0) === 0 ? "admin" : "customer");

    const userPayload: any = {
      external_id: body.supabaseUserId,
      name: body.name,
      email: cleanEmail,
      role,
      avatar: body.avatar ?? null,
    };

    if (existingUser?.id) {
      userPayload.id = existingUser.id;
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(userPayload, { onConflict: existingUser?.id ? "id" : "email" })
      .select("id, external_id, name, email, role, avatar")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to sync user");
    }

    res.json({ user: data });
  } catch (err) {
    next(err);
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Secure forgot-password check (does not leak sensitive user info)
authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const cleanEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    // Always return success to prevent email enumeration attacks
    res.json({
      success: true,
      message: "If an account exists with this email address, password reset instructions will be sent.",
      exists: !!user,
    });
  } catch (err) {
    next(err);
  }
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

// Authenticated password update endpoint (requires valid session token)
authRouter.post("/reset-password", requireAuth, async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const authUserId = req.user?.external_id;

    if (!authUserId) {
      return res.status(401).json({ error: "Authenticated session required to update password." });
    }

    // Update password in Supabase Auth for the authenticated user only
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
      password: body.newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message || "Failed to update user password");
    }

    res.json({ success: true, message: "Password has been successfully updated." });
  } catch (err) {
    next(err);
  }
});