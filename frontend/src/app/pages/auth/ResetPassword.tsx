import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "../../stores/authStore";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "motion/react";
import { toast } from "sonner";
import PerfumeArtPanel from "../../components/auth/PerfumeArtPanel";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Check if Supabase session is established from recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setEmail(session.user.email);
        setHasSession(true);
      }
    });

    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      const msg = "Please enter your email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const result = await updatePassword(trimmedEmail, newPassword);
    setLoading(false);

    if (result.ok) {
      const successMsg = "Your password has been successfully updated! Redirecting to login...";
      setSuccess(successMsg);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      const errMsg = result.message || "Failed to update password. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#080807] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <PerfumeArtPanel
          subtitle="AVTAR AROMAS"
          title={<>Security &<br />Sanctuary</>}
          description="Update your credentials to protect your bespoke fragrance preferences and private account data."
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

          <h1 className="text-3xl sm:text-4xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Set New Password
          </h1>
          <p className="text-sm text-muted-foreground mb-8" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Create a secure password for your account.
          </p>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 border border-red-500/30 bg-red-500/5 text-red-400 text-xs mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 px-4 py-3 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              <CheckCircle2 size={14} strokeWidth={1.5} className="shrink-0" />
              <span>{success}</span>
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
                disabled={hasSession}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400 disabled:opacity-60"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPwd ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="mt-2 flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 disabled:opacity-60"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#080807]/30 border-t-[#080807] rounded-full animate-spin" />
              ) : (
                <>Update Password <Lock size={14} strokeWidth={1.5} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-xs text-primary hover:text-[#E8D5B0] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              <ArrowRight size={12} className="rotate-180" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
