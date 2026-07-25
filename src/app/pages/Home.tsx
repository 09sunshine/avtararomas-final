import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { ArrowRight, ArrowLeft, Play, Star, Instagram, Leaf, Award, Droplets, FlameKindling, X, Volume2, VolumeX } from "lucide-react";
import { getFeaturedProducts, getBestSellers, testimonials, fragranceFamilies } from "../data/products";
import ProductCard from "../components/ui/ProductCard";
import { useCart } from "../stores/cartStore";

const ease = [0.25, 0.46, 0.45, 0.94];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GoldDivider({ text }: { text?: string }) {
  if (text) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,169,110,0.4)]" />
        <span className="text-[10px] tracking-[0.5em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          {text}
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,169,110,0.4)]" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 justify-center text-primary">
      <div className="w-16 h-px bg-primary/40" />
      <span className="text-primary">✦</span>
      <div className="w-16 h-px bg-primary/40" />
    </div>
  );
}

function StoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border border-b-0 border-[rgba(201,169,110,0.2)] bg-[#080807]">
          <div className="flex items-center gap-4">
            <div className="w-px h-6 bg-primary/40" />
            <div>
              <p className="text-[9px] tracking-[0.5em] uppercase text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                Avtar Aromas
              </p>
              <p className="text-base text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                A Message from Our Founder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="p-2 text-muted-foreground hover:text-primary transition-colors">
              {muted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="relative border border-[rgba(201,169,110,0.2)] bg-black overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
          />
          {/* Vignette overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,8,7,0.5) 100%)" }} />
          {/* Corner ornaments */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-primary/40 pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-primary/40 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-primary/40 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-primary/40 pointer-events-none" />
        </div>

        {/* Founder message */}
        <div className="border border-t-0 border-[rgba(201,169,110,0.2)] bg-[#080807] px-8 py-7">
          <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 flex-shrink-0 mt-1">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format"
                alt="Founder"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p
                className="text-lg text-foreground leading-relaxed mb-3"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
              >
                "Fragrance is memory made tangible. Every bottle we craft carries the soul of a place, a moment, a feeling that words alone cannot hold."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary/50" />
                <div>
                  <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>Avtar Singh</p>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    Founder &amp; Master Perfumer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const featured = getFeaturedProducts().slice(0, 4);
  const bestSellers = getBestSellers();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const { dispatch: cartDispatch } = useCart();
  const heroRef = useRef<HTMLDivElement>(null);

  const visibleBestSellers = bestSellers.slice(carouselIndex, carouselIndex + 3);
  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex + 3 < bestSellers.length;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="bg-[#080807] overflow-x-hidden grain-overlay">
      <StoryModal open={storyOpen} onClose={() => setStoryOpen(false)} />
      {/* ========== HERO ========== */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-[#080807]" />
        <div
          className="absolute inset-0 glow-pulse"
          style={{ background: "radial-gradient(ellipse 60% 50% at 65% 50%, rgba(201,169,110,0.07) 0%, transparent 70%)" }}
        />
        {/* Background perfume image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1617897903246-719242758050?w=1800&h=1200&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #080807 40%, transparent 80%, #080807 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,7,0.6) 0%, transparent 30%, transparent 70%, #080807 100%)" }} />
        </div>

        {/* Gold horizontal lines */}
        <div className="absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-[rgba(201,169,110,0.15)] via-transparent to-transparent" />
        <div className="absolute left-0 right-0 bottom-1/3 h-px bg-gradient-to-r from-[rgba(201,169,110,0.08)] via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-[80vh]">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-px bg-primary/60" />
                <span className="text-[10px] tracking-[0.55em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Artisan Perfumes · Est. 2019
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7rem] leading-[0.9] text-foreground mb-8 lg:mb-10"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
              >
                Crafted<br />
                By Hand.<br />
                <em className="gold-shimmer" style={{ fontStyle: "italic" }}>Remembered</em><br />
                Forever.
              </h1>

              <p
                className="text-base text-[#9A9388] leading-relaxed mb-12 max-w-md"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.8 }}
              >
                AVTAR AROMAS is an Indian artisan perfume house. We craft each fragrance by hand using the world&apos;s rarest natural ingredients — small batches, no compromises.
              </p>

              <div className="flex items-center gap-5">
                <Link
                  to="/shop"
                  className="group flex items-center gap-3 px-8 py-4 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-all duration-500"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  Shop Collection
                  <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-400" />
                </Link>
                <button
                  onClick={() => setStoryOpen(true)}
                  className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#9A9388] hover:text-primary transition-colors duration-400 border-b border-transparent hover:border-primary/40 pb-0.5"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  <Play size={11} strokeWidth={1.5} />
                  Discover Our Story
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Editorial collage */}
          <div className="hidden lg:block relative h-full">
            {/* Large primary image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.5, ease }}
              className="absolute top-0 right-0 w-[58%] h-[72%] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1780943004195-3bd30f748872?w=700&h=900&fit=crop&auto=format"
                alt="Avtar Aromas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(8,8,7,0.7) 100%)" }} />
              {/* Label on primary */}
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[9px] tracking-[0.4em] uppercase text-primary mb-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                  Signature Collection
                </p>
                <p className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                  Midnight Oud
                </p>
              </div>
            </motion.div>

            {/* Secondary image — bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.75, ease }}
              className="absolute bottom-0 left-0 w-[48%] h-[50%] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1771762013405-ad64577dfc55?w=500&h=650&fit=crop&auto=format"
                alt="Avtar Aromas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 45%, rgba(8,8,7,0.75) 100%)" }} />
            </motion.div>

            {/* Third accent image — middle overlap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 1, ease }}
              className="absolute bottom-[22%] left-[32%] w-[36%] h-[34%] overflow-hidden border border-[rgba(201,169,110,0.25)] z-10"
            >
              <img
                src="https://images.unsplash.com/photo-1774682060997-f8959850a7d4?w=400&h=500&fit=crop&auto=format"
                alt="Avtar Aromas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#080807]/20" />
            </motion.div>

            {/* Gold accent line top-right */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.9, ease }}
              className="absolute top-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent origin-top"
              style={{ height: "72%" }}
            />

            {/* Stats badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.2, ease }}
              className="absolute top-[15%] left-0 bg-[#0A0908]/90 backdrop-blur-sm border border-[rgba(201,169,110,0.2)] px-5 py-4 z-20"
            >
              <p className="text-3xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>12K+</p>
              <p className="text-[9px] tracking-[0.35em] uppercase text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                devotees worldwide
              </p>
            </motion.div>

            {/* Corner ornament */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-primary/20 pointer-events-none z-30" />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-primary/40 to-primary/60 animate-pulse" />
          <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>scroll</span>
        </motion.div>
      </section>

      {/* ========== MARQUEE STRIP ========== */}
      <div className="border-y border-[rgba(201,169,110,0.12)] py-4 overflow-hidden bg-[#050504]">
        <div className="flex gap-16 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {Array.from({ length: 6 }).flatMap((_, copy) =>
            ["Handcrafted in India", "Natural Ingredients", "Small Batch", "Cruelty Free", "Premium Oud", "Rare Absolutes", "Long Lasting"].map((t, i) => (
              <span key={`${copy}-${i}`} className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/60 flex items-center gap-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                {t} <span className="text-primary">✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ========== BRAND STORY ========== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left: Image */}
          <FadeIn delay={0}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop&auto=format"
                alt="Avtar Aromas craftsmanship"
                className="w-full h-[360px] sm:h-[480px] lg:h-[600px] object-cover"
              />
              {/* Gold frame accent */}
              <div className="absolute -bottom-5 -right-5 w-40 h-40 border border-primary/20 pointer-events-none" />
              <div className="absolute -top-5 -left-5 w-40 h-40 border border-primary/10 pointer-events-none" />
              {/* Floating label */}
              <div className="absolute bottom-8 left-8 bg-[#080807]/90 backdrop-blur-sm border border-[rgba(201,169,110,0.2)] px-6 py-4">
                <p className="text-xs tracking-[0.3em] uppercase text-primary mb-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Founded</p>
                <p className="text-3xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>2019</p>
              </div>
            </div>
          </FadeIn>

          {/* Right: Text */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-8">
              <GoldDivider text="Our Story" />
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
              >
                Born from a love of <em style={{ fontStyle: "italic" }}>rare things</em>
              </h2>
              <div className="flex flex-col gap-5 text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
                <p className="text-base">
                  Every bottle of Avtar Aromas begins with a journey — to the oud forests of Assam, the rose fields of Bulgaria, the sandalwood groves of Mysore. We source only what we would use ourselves.
                </p>
                <p className="text-base">
                  Our perfumers work in small batches, never scaling beyond what hands and eyes can properly care for. This is not mass production. This is craft.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[rgba(201,169,110,0.1)]">
                {[
                  { value: "6+", label: "Years Crafting" },
                  { value: "40+", label: "Natural Ingredients" },
                  { value: "12K+", label: "Devotees Worldwide" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{stat.value}</p>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="group inline-flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-primary hover:gap-5 transition-all duration-400"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                Read Our Full Story <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ========== FEATURED COLLECTION ========== */}
      <section className="bg-[#050504] py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
              <div>
                <GoldDivider text="Featured" />
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-5"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
                >
                  The Collection
                </h2>
              </div>
              <Link
                to="/shop"
                className="group flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-primary hover:gap-5 transition-all duration-400 pb-1 border-b border-primary/30 hover:border-primary"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                Explore All <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== FRAGRANCE FAMILIES ========== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-20 lg:py-28">
        <FadeIn>
          <div className="text-center mb-16">
            <GoldDivider text="Explore" />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-5 mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
            >
              Fragrance Families
            </h2>
            <p className="text-[#9A9388] text-base max-w-md mx-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Every great perfume belongs to a family. Find the one that speaks to you.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {fragranceFamilies.map((family, i) => (
            <FadeIn key={family.id} delay={i * 0.07}>
              <Link
                to={`/shop?subcategory=${family.name}`}
                className="group relative flex flex-col items-center gap-4 p-7 bg-[#0A0908] border border-[rgba(201,169,110,0.1)] hover:border-primary/40 transition-all duration-600 text-center overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${family.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <span className="relative z-10 text-4xl">{family.icon}</span>
                <div className="relative z-10">
                  <p
                    className="text-sm text-foreground group-hover:text-primary transition-colors duration-400 mb-1"
                    style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
                  >
                    {family.name}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {family.description}
                  </p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========== BEST SELLERS ========== */}
      <section className="bg-[#050504] py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-14">
              <div>
                <GoldDivider text="Most Loved" />
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-5"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
                >
                  Best Sellers
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => canPrev && setCarouselIndex((i) => i - 1)}
                  disabled={!canPrev}
                  className="w-11 h-11 border border-[rgba(201,169,110,0.2)] flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => canNext && setCarouselIndex((i) => i + 1)}
                  disabled={!canNext}
                  className="w-11 h-11 border border-[rgba(201,169,110,0.2)] flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleBestSellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== LUXURY EXPERIENCE ========== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-20 lg:py-28">
        <FadeIn>
          <div className="text-center mb-20">
            <GoldDivider text="Why Us" />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-5"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
            >
              The Avtar Promise
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              Icon: Droplets,
              title: "Rare Ingredients",
              text: "We source directly from origin — Bulgarian rose, Mysore sandalwood, Assam oud. The finest, always.",
            },
            {
              Icon: FlameKindling,
              title: "Handmade Always",
              text: "Every bottle filled by hand. Every batch small enough to inspect, smell, and sign off personally.",
            },
            {
              Icon: Leaf,
              title: "Eco-Conscious",
              text: "Natural formulations. Responsible sourcing. FSC-certified packaging. Cruelty-free, always.",
            },
            {
              Icon: Award,
              title: "Long-Lasting",
              text: "Our Parfum Extrait concentrations last 12–24 hours. We don&apos;t dilute. We don&apos;t compromise.",
            },
          ].map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.1}>
              <div className="group flex flex-col gap-5 p-8 border border-[rgba(201,169,110,0.1)] hover:border-primary/30 transition-all duration-600 bg-[#0A0908]">
                <div className="w-12 h-12 border border-primary/20 flex items-center justify-center text-primary group-hover:border-primary/50 transition-colors duration-400">
                  <feature.Icon size={20} strokeWidth={1} />
                </div>
                <h3
                  className="text-xl text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.8 }}
                >
                  {feature.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="bg-[#050504] py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <GoldDivider text="Reviews" />
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-5"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
              >
                Voices of Our Devotees
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <div className="flex flex-col gap-5 p-8 bg-[#0A0908] border border-[rgba(201,169,110,0.1)] hover:border-primary/25 transition-all duration-600 h-full">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={12} className="fill-primary text-primary" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p
                    className="text-sm text-[#9A9388] leading-relaxed flex-1"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}
                  >
                    &ldquo;{t.text}&rdquo;
                  </p>
                  {/* Meta */}
                  <div className="border-t border-[rgba(201,169,110,0.08)] pt-5">
                    <p className="text-sm text-foreground mb-0.5" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{t.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground tracking-wider uppercase" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{t.location}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-[10px] text-primary tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{t.product}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ========== INSTAGRAM GALLERY ========== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-20 lg:py-28">
        <FadeIn>
          <div className="text-center mb-14">
            <GoldDivider text="@avtar_aromas" />
            <h2
              className="text-4xl text-foreground mt-5 mb-3"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
            >
              Follow Our World
            </h2>
            <a href="#" className="text-xs tracking-[0.3em] uppercase text-primary hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              @avtar_aromas
            </a>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&h=400&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400&h=400&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop&auto=format",
          ].map((src, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <a href="#" className="group relative aspect-square overflow-hidden block bg-[#0A0908]">
                <img
                  src={src}
                  alt={`Avtar Aromas Instagram ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-[#080807]/0 group-hover:bg-[#080807]/60 transition-all duration-500 flex items-center justify-center">
                  <Instagram size={22} strokeWidth={1.5} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section className="bg-[#0A0908] border-y border-[rgba(201,169,110,0.12)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16 sm:py-20 lg:py-28 text-center">
          <FadeIn>
            <GoldDivider />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mt-8 mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}
            >
              Join the Inner Circle
            </h2>
            <p
              className="text-[#9A9388] mb-12 max-w-md mx-auto text-base"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.8 }}
            >
              Rare drops, private events, olfactory stories. For those who appreciate the extraordinary.
            </p>
            <form className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border border-[rgba(201,169,110,0.25)] border-r-0 sm:border-r-0 px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/60 transition-colors duration-400"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
              <button
                type="submit"
                className="px-10 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase font-medium hover:bg-[#E8D5B0] transition-colors duration-400 whitespace-nowrap"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-muted-foreground/40 mt-5 tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              No spam. Unsubscribe anytime. Only the extraordinary.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
