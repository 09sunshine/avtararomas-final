import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, ArrowRight, AlertCircle, Globe, Mail, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../stores/authStore";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "motion/react";
import { toast } from "sonner";
import PerfumeArtPanel from "../../components/auth/PerfumeArtPanel";

export default function Login() {
  const { login, loginWithGoogle, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!password || password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const result = await login(emailTrimmed, password);
    setLoading(false);
    if (result.ok) {
      navigate("/");
    } else {
      setError(result.message || "Invalid email or password");
      toast.error(result.message || "Invalid email or password");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    const ok = await loginWithGoogle();
    setLoading(false);
    if (!ok) {
      setError("Google sign-in failed");
      toast.error("Google sign-in failed");
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    setResending(true);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (resendError) {
      toast.error(resendError.message || "Failed to resend confirmation email");
    } else {
      toast.success("Confirmation email resent! Check your inbox (and spam folder).");
    }
  };

  const handleOpenForgotModal = () => {
    setForgotEmail(email);
    setForgotError("");
    setForgotMessage("");
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    const trimmedEmail = forgotEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      const msg = "Please enter a valid email address.";
      setForgotError(msg);
      toast.error(msg);
      return;
    }

    setForgotLoading(true);
    const result = await forgotPassword(trimmedEmail);
    setForgotLoading(false);

    if (result.ok) {
      setForgotMessage(result.message || "Password reset instructions have been sent to your email.");
      toast.success("Reset link sent to your email!");
    } else {
      setForgotError(result.message || "Could not send password reset email. Please try again.");
      toast.error(result.message || "Failed to send reset link");
    }
  };

  return (
    <div className="min-h-screen bg-[#080807] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <PerfumeArtPanel
          subtitle="AVTAR AROMAS"
          title={<>The Art of<br />Remembrance</>}
          description="Sign in to access exclusive drops, track your orders, and curate your personal fragrance wardrobe."
        />
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] px-5 sm:px-10 py-10 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Logo */}
          <div className="mb-12 lg:mb-14">
            <p className="text-[10px] tracking-[0.5em] text-primary uppercase mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>artisan perfumes</p>
            <p className="text-2xl tracking-[0.12em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>AVTAR AROMAS</p>
          </div>

          <h1 className="text-4xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mb-10" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary hover:text-[#E8D5B0] transition-colors">Create one</Link>
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full mb-5 flex items-center justify-center gap-2.5 py-4 border border-[rgba(201,169,110,0.2)] text-xs tracking-[0.3em] uppercase hover:border-primary/50 hover:text-primary transition-all duration-400"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            <Globe size={14} strokeWidth={1.5} />
            Continue with Google
          </button>

          {error && (
            <div className="flex flex-col gap-2 px-4 py-3 border border-red-500/30 bg-red-500/5 text-red-400 text-xs mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              <div className="flex items-center gap-3">
                <AlertCircle size={14} strokeWidth={1.5} />
                {error}
              </div>
              {error.toLowerCase().includes("confirm") && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="flex items-center gap-2 text-[#C9A96E] hover:text-[#E8D5B0] transition-colors mt-1 ml-1"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  <Mail size={12} strokeWidth={1.5} />
                  {resending ? "Sending..." : "Resend confirmation email"}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-[10px] text-primary hover:text-[#E8D5B0] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 disabled:opacity-60"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#080807]/30 border-t-[#080807] rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={14} strokeWidth={1.5} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-[#0F0E0C] border border-[rgba(201,169,110,0.3)] p-6 sm:p-8 rounded-none shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotError("");
                setForgotMessage("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <h2 className="text-2xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              Reset Password
            </h2>
            <p className="text-xs text-muted-foreground mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Enter the email address registered with your account and we&apos;ll send you instructions to reset your password.
            </p>

            {forgotError && (
              <div className="flex items-center gap-2.5 px-4 py-3 border border-red-500/30 bg-red-500/5 text-red-400 text-xs mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                <CheckCircle2 size={14} strokeWidth={1.5} className="shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="mt-2 flex items-center justify-center gap-2.5 py-3.5 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 disabled:opacity-60 cursor-pointer"
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              >
                {forgotLoading ? (
                  <span className="w-4 h-4 border-2 border-[#080807]/30 border-t-[#080807] rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight size={14} strokeWidth={1.5} /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
