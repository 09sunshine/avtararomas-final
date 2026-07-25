import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../stores/authStore";
import { motion } from "motion/react";


// Incense smoke canvas — organic bezier tendrils rising upward
function SmokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let frame = 0;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Each tendril: a column of particles chained as a bezier spine
    type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number };

    const STREAMS = 6;
    const streams: Particle[][] = Array.from({ length: STREAMS }, (_, si) => {
      const baseX = 0.15 + (si / (STREAMS - 1)) * 0.7;
      return Array.from({ length: 18 }, (__, pi) => ({
        x: baseX + (Math.random() - 0.5) * 0.04,
        y: 1.0 - pi * 0.06,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -(0.0018 + Math.random() * 0.001),
        age: pi * 8,
        life: 120 + Math.random() * 60,
      }));
    });

    const draw = () => {
      frame++;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      streams.forEach((stream, si) => {
        // Update each particle
        stream.forEach((p) => {
          p.age++;
          if (p.age > p.life) {
            // Reset to bottom
            p.x = 0.15 + (si / (STREAMS - 1)) * 0.7 + (Math.random() - 0.5) * 0.06;
            p.y = 1.02;
            p.vx = (Math.random() - 0.5) * 0.0006;
            p.vy = -(0.0018 + Math.random() * 0.001);
            p.age = 0;
            p.life = 120 + Math.random() * 60;
          }
          // Sinuous drift
          p.vx += Math.sin(frame * 0.008 + si * 1.2 + p.y * 8) * 0.00012;
          p.vx *= 0.97;
          p.x += p.vx;
          p.y += p.vy;
        });

        // Draw smooth bezier spine through particles
        const alive = stream.filter((p) => p.y < 1.05 && p.y > -0.05);
        if (alive.length < 3) return;

        ctx.beginPath();
        const pts = alive.map((p) => ({ x: p.x * W, y: p.y * H }));
        ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }

        // Opacity based on height — fades as it rises
        const topY = alive[alive.length - 1].y;
        const alpha = Math.max(0, Math.min(0.55, topY * 0.9));

        const grad = ctx.createLinearGradient(0, H * 0.95, 0, H * (topY - 0.05));
        grad.addColorStop(0, `rgba(201,169,110,0)`);
        grad.addColorStop(0.15, `rgba(201,169,110,${alpha * 0.7})`);
        grad.addColorStop(0.5, `rgba(220,185,130,${alpha})`);
        grad.addColorStop(1, `rgba(201,169,110,0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2 + Math.sin(frame * 0.02 + si) * 0.4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glow pass (wider, lower opacity)
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.strokeStyle = `rgba(201,169,110,${alpha * 0.18})`;
        ctx.lineWidth = 6;
        ctx.filter = "blur(4px)";
        ctx.stroke();
        ctx.filter = "none";
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.3, y: 0.25, r: 0.45, hue: 38,  sat: 60, speed: 0.0004 },
      { x: 0.7, y: 0.65, r: 0.38, hue: 28,  sat: 50, speed: 0.0006 },
      { x: 0.5, y: 0.5,  r: 0.55, hue: 45,  sat: 40, speed: 0.0003 },
      { x: 0.15,y: 0.75, r: 0.3,  hue: 20,  sat: 55, speed: 0.0007 },
      { x: 0.8, y: 0.2,  r: 0.32, hue: 50,  sat: 45, speed: 0.0005 },
    ];

    const draw = () => {
      frame++;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#080807";
      ctx.fillRect(0, 0, W, H);

      blobs.forEach((b) => {
        const t = frame * b.speed;
        const bx = (b.x + Math.sin(t * 1.3) * 0.15) * W;
        const by = (b.y + Math.cos(t * 1.1) * 0.12) * H;
        const br = b.r * Math.min(W, H);

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, 42%, 0.28)`);
        grad.addColorStop(0.5, `hsla(${b.hue}, ${b.sat}%, 35%, 0.10)`);
        grad.addColorStop(1, `hsla(${b.hue}, ${b.sat}%, 30%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(bx, by, br, br * 0.7, t * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: "screen" }} />;
}

function ScentPanel() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#080807]">
      {/* Aurora background blobs */}
      <AuroraCanvas />

      {/* Incense smoke tendrils — centred in lower half */}
      <div className="absolute inset-x-0 bottom-0 h-[75%]">
        <SmokeCanvas />
      </div>

      {/* Soft vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 70%, transparent 25%, rgba(8,8,7,0.6) 100%)",
      }} />

      {/* Right-edge fade into form panel */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, transparent 62%, #080807 100%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(8,8,7,0.5) 0%, transparent 20%)" }} />

      {/* Bottom brand copy — restored */}
      <motion.div
        className="absolute bottom-14 left-12 z-10 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1 }}
      >
        <p className="text-[10px] tracking-[0.55em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Avtar Aromas
        </p>
        <h2 className="text-[2.8rem] text-foreground leading-[1.08] mb-5" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
          The Art of<br />Remembrance
        </h2>
        <div className="w-10 h-px bg-primary/50 mb-5" />
        <p className="text-sm text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.85 }}>
          Sign in to access exclusive drops, track your orders, and curate your personal fragrance wardrobe.
        </p>
      </motion.div>
    </div>
  );
}


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/");
    } else {
      setError("Invalid email or password. Try user@demo.com / demo1234");
    }
  };

  return (
    <div className="min-h-screen bg-[#080807] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <ScentPanel />
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

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 border border-red-500/30 bg-red-500/5 text-red-400 text-xs mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              <AlertCircle size={14} strokeWidth={1.5} />
              {error}
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
                <button type="button" className="text-[10px] text-primary hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
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

          <div className="mt-10 pt-8 border-t border-[rgba(201,169,110,0.08)]">
            <p className="text-[10px] text-muted-foreground/50 text-center" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              Demo: user@demo.com / demo1234 · admin@demo.com / admin1234
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
