import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";

const TEAM = [
  {
    name: "Arjun Avtar",
    title: "Founder & Master Perfumer",
    bio: "Trained under Grasse's finest noses, Arjun returned to India to bottle the subcontinent's soul — oud from Assam, rose from Kannauj, sandalwood from Mysore. Every formula is his handwriting.",
    initial: "A",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Meera Avtar",
    title: "Creative Director",
    bio: "Meera shapes the visual and sensory language of every bottle, campaign, and unboxing ritual. She believes packaging is the first note of any fragrance.",
    initial: "M",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Rohan Kapoor",
    title: "Head of Sourcing",
    bio: "Rohan travels to the source — oud traders in Cambodia, rose farmers in Bulgaria, vetiver fields in Haiti. His obsession is purity at origin.",
    initial: "R",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80",
  },
];

const MILESTONES = [
  { year: "2011", text: "Arjun Avtar blends his first oud accord in a rented kitchen in Lucknow." },
  { year: "2014", text: "Avtar Aromas launches with five fragrances. All five sell out in 72 hours." },
  { year: "2017", text: "First international stockist — a niche perfumery in Paris's Marais district." },
  { year: "2019", text: "The Kannauj Atelier opens — our dedicated distillation and blending facility." },
  { year: "2022", text: "Cruelty-free and vegan certification across all 40+ expressions." },
  { year: "2024", text: "Named one of the world's 50 most influential independent perfume houses." },
];

const VALUES = [
  {
    label: "Origin First",
    body: "We source single-origin raw materials and name the farm, region, or harvest year on every bottle. Transparency is not a marketing choice — it is a commitment.",
  },
  {
    label: "No Shortcuts",
    body: "Every accord is macerated for a minimum of six weeks. We do not use synthetic shortcuts that compromise depth. Time is an ingredient.",
  },
  {
    label: "Made in India",
    body: "From Kannauj's rose fields to Kerala's sandalwood groves — India's fragrance heritage is our canvas. We are proud to make it audible to the world.",
  },
  {
    label: "Small Batches",
    body: "Each expression is capped at 2,000 units per run. When it's gone, it's gone. Scarcity is not theatre; it is the cost of doing things properly.",
  },
];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen bg-[#080807] text-foreground">

      {/* ── Hero ── */}
      <section className="relative h-[90vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&auto=format&fit=crop&q=80"
            alt="Avtar Aromas atelier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#080807]/60 to-[#080807]/10" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 pb-16 sm:pb-24 w-full">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[10px] tracking-[0.5em] uppercase text-primary mb-5"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-foreground leading-[1.05] max-w-3xl"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
          >
            Scent is memory.<br />We make both.
          </motion.h1>
        </div>
      </section>

      {/* ── Founding story ── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <FadeIn>
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Where it began
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8 leading-tight" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            A kitchen in Lucknow.<br />A dream of honest oud.
          </h2>
          <div className="flex flex-col gap-5 text-[#9A9388] text-base" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
            <p>
              In 2011, Arjun Avtar returned from five years in Grasse with calloused hands, a notebook of 300 formulas, and a singular belief: that Indian raw materials deserved to anchor world-class perfumery — not merely support it.
            </p>
            <p>
              He rented a kitchen, sourced oud resin directly from a family in Assam, and spent eight months perfecting a single accord. That accord became <em style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>Midnight Oud</em> — still our most celebrated expression.
            </p>
            <p>
              Avtar Aromas was never meant to be a large company. It was meant to be an honest one. Every decision since has been measured against that intention.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="relative h-[420px] sm:h-[560px] lg:h-[640px]">
            <img
              src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=900&auto=format&fit=crop&q=80"
              alt="Perfume blending atelier"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-28 sm:w-36 h-28 sm:h-36 border border-primary/20 pointer-events-none" />
            <div className="absolute top-6 right-6 px-4 py-3 bg-[#080807]/80 backdrop-blur-sm border border-primary/15">
              <p className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>40+</p>
              <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Expressions</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Values ── */}
      <section className="border-y border-[rgba(201,169,110,0.1)] py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <FadeIn>
            <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              What we stand for
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-14 sm:mb-20" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              Our principles
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(201,169,110,0.08)]">
            {VALUES.map((v, i) => (
              <FadeIn key={v.label} delay={i * 0.1}>
                <div className="bg-[#080807] px-7 py-8 h-full flex flex-col gap-4">
                  <span className="text-xs tracking-[0.4em] uppercase text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-xl" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{v.label}</h3>
                  <p className="text-sm text-[#9A9388] leading-relaxed flex-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.85 }}>{v.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-32">
        <FadeIn>
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            The journey
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-14 sm:mb-20" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Milestones
          </h2>
        </FadeIn>
        <div className="flex flex-col">
          {MILESTONES.map((m, i) => (
            <FadeIn key={m.year} delay={i * 0.08}>
              <div className="flex gap-8 sm:gap-16 items-start py-7 border-b border-[rgba(201,169,110,0.08)] group">
                <span
                  className="w-16 shrink-0 text-sm text-primary group-hover:text-foreground transition-colors duration-400"
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
                >
                  {m.year}
                </span>
                <div className="w-px self-stretch bg-[rgba(201,169,110,0.15)] shrink-0 mt-1" />
                <p className="text-base text-[#9A9388] group-hover:text-foreground transition-colors duration-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.85 }}>
                  {m.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="border-t border-[rgba(201,169,110,0.1)] py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <FadeIn>
            <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              The people
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-14 sm:mb-20" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              Behind the bottle
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            {TEAM.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.12}>
                <div className="flex flex-col gap-5 group">
                  <div className="relative overflow-hidden aspect-[4/5] bg-[#0A0908]">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080807]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div>
                    <h3 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{p.name}</h3>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-primary mt-0.5 mb-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{p.title}</p>
                    <p className="text-sm text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.85 }}>{p.bio}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Atelier image ── */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1800&auto=format&fit=crop&q=80"
          alt="Kannauj Atelier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#080807]/55 flex items-center justify-center">
          <FadeIn className="text-center px-4">
            <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Kannauj, Uttar Pradesh</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              The Atelier
            </h2>
            <p className="text-sm text-[#9A9388] mt-4 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.85 }}>
              Every bottle begins here — in the city that has distilled fragrance for over 5,000 years.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-28 flex flex-col sm:flex-row items-center justify-between gap-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-center sm:text-left" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Find your signature scent.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Link
            to="/shop"
            className="flex items-center gap-3 px-8 py-4 border border-primary/40 text-primary hover:bg-primary hover:text-[#080807] transition-all duration-400 text-xs tracking-[0.25em] uppercase group"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Explore the Collection
            <ArrowRight size={13} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </FadeIn>
      </section>

    </div>
  );
}
