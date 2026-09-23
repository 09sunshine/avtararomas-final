import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { supabase } from "../lib/supabaseClient";
import { syncAuthUser, resetPasswordBackend } from "../lib/api";

type AuthResult = {
  ok: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (email: string, newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "auth_user";

async function syncCurrentUser() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const authUser = userData.user;

    if (!authUser || !authUser.email) {
      return null;
    }

    const provider = authUser.app_metadata?.provider || authUser.identities?.[0]?.provider;
    const synced = await syncAuthUser({
      supabaseUserId: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
      avatar: authUser.user_metadata?.avatar_url || null,
      provider,
    });

    return {
      id: synced.user.id,
      name: synced.user.name,
      email: synced.user.email,
      role: synced.user.role,
      avatar: synced.user.avatar || undefined,
    } satisfies User;
  } catch (error) {
    console.error("Failed to sync user:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const synced = await syncCurrentUser();
      if (synced) {
        setUser(synced);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
      } else {
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          role: "customer",
          avatar: session.user.user_metadata?.avatar_url || undefined,
        };
        setUser(fallbackUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("rate limit") || msg.includes("too many")) {
        return { ok: false, message: "Too many login attempts. Please wait a minute and try again." };
      }
      if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
        return { ok: false, message: "Please confirm your email address before signing in. Check your inbox (and spam folder)." };
      }
      if (msg.includes("invalid login credentials") || msg.includes("invalid email or password")) {
        return { ok: false, message: "Invalid email or password. If you signed up with Google, use the 'Continue with Google' button." };
      }
      return { ok: false, message: error.message || "Invalid email or password" };
    }
    const synced = await syncCurrentUser();
    if (synced) {
      setUser(synced);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData.user;
      if (authUser) {
        const fallbackUser: User = {
          id: authUser.id,
          email: authUser.email || email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split("@")[0],
          role: "customer",
          avatar: authUser.user_metadata?.avatar_url || undefined,
        };
        setUser(fallbackUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
      }
    }
    return { ok: true };
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("rate limit") || msg.includes("too many")) {
        return { ok: false, message: "Too many sign-up attempts. Please wait a minute and try again." };
      }
      if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
        return { ok: false, message: "An account with this email already exists. Please sign in instead." };
      }
      return { ok: false, message: error.message || "Could not create account" };
    }

    if (data.session) {
      const synced = await syncCurrentUser();
      if (synced) setUser(synced);
      return { ok: true, message: "Account created successfully." };
    }

    return {
      ok: true,
      needsEmailConfirmation: true,
      message: "Account created! We've sent a confirmation link to your email. Please check your inbox (and spam folder) to activate your account.",
    };
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        console.error("Google sign-in error:", error.message);
        return false;
      }
      // OAuth redirect will happen; on return, onAuthStateChange will handle sync
      return true;
    } catch (err) {
      console.error("Google sign-in exception:", err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        return { ok: false, message: error.message || "Failed to send reset instructions" };
      }
      return { ok: true, message: "Password reset link sent! Please check your email inbox (and spam folder)." };
    } catch (err: any) {
      return { ok: false, message: err.message || "An unexpected error occurred" };
    }
  };

  const updatePassword = async (email: string, newPassword: string): Promise<AuthResult> => {
    try {
      let sbError: any = null;
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        sbError = error;
      } catch (err) {
        sbError = err;
      }

      let backendOk = false;
      let backendMsg = "";
      if (email) {
        try {
          const res = await resetPasswordBackend({ email, newPassword });
          backendOk = res.success;
          backendMsg = res.message;
        } catch (err: any) {
          backendMsg = err.message || "Failed to update password in backend";
        }
      }

      if (sbError && !backendOk) {
        return { ok: false, message: sbError?.message || backendMsg || "Failed to update password" };
      }

      return { ok: true, message: "Password updated successfully!" };
    } catch (err: any) {
      return { ok: false, message: err.message || "Failed to update password" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, loginWithGoogle, logout, forgotPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
