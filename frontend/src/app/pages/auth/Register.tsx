import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Globe } from "lucide-react";
import { useAuth } from "../../stores/authStore";
import { motion } from "motion/react";
import { toast } from "sonner";
import PerfumeArtPanel from "../../components/auth/PerfumeArtPanel";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const pwdStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = pwdStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#84cc16", "#22c55e"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameTrimmed = form.name.trim();
    if (!nameTrimmed || nameTrimmed.length < 2 || !/^[a-zA-Z\s\.\'-]+$/.test(nameTrimmed)) {
      const msg = "Please enter a valid full name (at least 2 characters, letters only).";
      setError(msg);
      toast.error(msg);
      return;
    }

    const emailTrimmed = form.email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.password || form.password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (form.password !== form.confirm) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const result = await register(nameTrimmed, emailTrimmed, form.password);
    setLoading(false);
    if (result.ok) {
      toast.success(result.message || "Account created successfully.");
      if (result.needsEmailConfirmation) {
        navigate("/login");
      } else {
        navigate("/");
      }
      return;
    }

    const message = result.message || "Could not create account";
    setError(message);
    toast.error(message);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    const ok = await loginWithGoogle();
    setLoading(false);
    if (!ok) {
      setError("Google sign-up failed");
      toast.error("Google sign-up failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#080807] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <PerfumeArtPanel
          subtitle="JOIN AVTAR AROMAS"
          title={<>Begin Your<br />Olfactory Journey</>}
          bullets={[
            "Access exclusive pre-launch drops",
            "Curate your personal scent wardrobe",
            "Earn loyalty points with every order",
          ]}
        />
      </div>

      {/* Form */}
      <div className="flex flex-col justify-center w-full lg:w-[480px] px-5 sm:px-10 py-10 sm:py-16 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.5em] text-primary uppercase mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>artisan perfumes</p>
            <p className="text-2xl tracking-[0.12em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>AVTAR AROMAS</p>
          </div>

          <h1 className="text-4xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Create account
          </h1>
          <p className="text-sm text-muted-foreground mb-8" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Already a member?{" "}
            <Link to="/login" className="text-primary hover:text-[#E8D5B0] transition-colors">Sign in</Link>
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
            <div className="px-4 py-3 border border-red-500/30 bg-red-500/5 text-red-400 text-xs mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { field: "name" as const, label: "Full Name", type: "text", placeholder: "Your name" },
              { field: "email" as const, label: "Email Address", type: "email", placeholder: "your@email.com" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{label}</label>
                <input
                  type={type}
                  required
                  value={form[field]}
                  onChange={update(field)}
                  placeholder={placeholder}
                  className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                />
              </div>
            ))}

            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min. 6 characters"
                  className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPwd ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-0.5 flex-1 transition-all duration-400" style={{ backgroundColor: i <= strength ? strengthColor : "rgba(201,169,110,0.1)" }} />
                    ))}
                  </div>
                  <span className="text-[10px] transition-colors" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={form.confirm}
                  onChange={update("confirm")}
                  placeholder="Repeat password"
                  className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-5 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle2 size={14} strokeWidth={1.5} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 disabled:opacity-60"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#080807]/30 border-t-[#080807] rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={14} strokeWidth={1.5} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-[10px] text-muted-foreground/50 text-center leading-relaxed" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
