import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

export interface AuthenticatedUser {
  id: string;
  external_id: string | null;
  email: string;
  name: string;
  role: "customer" | "admin";
  avatar?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies the Supabase access token from Authorization header,
 * then resolves the user from public.users table.
 */
async function resolveUserFromToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }

    const authUser = data.user;
    const email = authUser.email?.trim().toLowerCase() || "";

    // Query user profile and role from public.users
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("id, external_id, name, email, role, avatar")
      .or(`external_id.eq.${authUser.id},email.ilike.${email}`)
      .maybeSingle();

    if (dbError) {
      console.error("[Auth] Database user query error:", dbError);
    }

    const role = (dbUser?.role as "customer" | "admin") || "customer";

    return {
      id: dbUser?.id || authUser.id,
      external_id: authUser.id,
      email: dbUser?.email || email,
      name: dbUser?.name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split("@")[0] || "User",
      role,
      avatar: dbUser?.avatar || authUser.user_metadata?.avatar_url || null,
    };
  } catch (err) {
    console.error("[Auth] Exception verifying token:", err);
    return null;
  }
}

/**
 * Middleware: Requires a valid Supabase JWT Bearer token.
 * Rejects with 401 if missing or invalid.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required. Please sign in." });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({ error: "Invalid authorization token format." });
    }

    const user = await resolveUserFromToken(token);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: Optional authentication.
 * Attaches req.user if a valid token is provided, but continues without error if not.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const user = await resolveUserFromToken(token);
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch {
    next();
  }
}

/**
 * Middleware: Requires the requesting user to be authenticated AND have the 'admin' role.
 * Rejects with 401 if not logged in, or 403 if not an admin.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    next();
  });
}
