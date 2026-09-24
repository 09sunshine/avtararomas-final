import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { ArrowRight, Phone, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { sendContactMessage } from "../lib/api";
import StoryHeroArt from "../components/about/StoryHeroArt";

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

const VALUES = [
  {
    label: "Your Avtar, Your Choice",
    body: "We don’t tell you who to be. You choose the presence you want to carry.",
  },
  {
    label: "Fragrance With Character",
    body: "Every fragrance should have a personality, a story, and something worth remembering.",
  },
  {
    label: "Rajasthan, Without the Souvenir",
    body: "We draw from Rajasthan’s places, people, culture, and character — and translate them into modern parfums.",
  },
  {
    label: "Unisex, Always",
    body: "We don’t believe fragrance has a gender. Wear what feels like you, or the Avtar you want to carry.",
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
        <div className="absolute inset-0" aria-hidden="true">
          <StoryHeroArt />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#080807]/15 to-[#080807]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080807]/80 via-[#080807]/10 to-[#080807]/25" />
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
            A home in Rajasthan.<br />A dream of honest parfum.
          </h2>
          <div className="flex flex-col gap-5 text-[#9A9388] text-base" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
            <p>
              Rajasthan has never been just one mood.
            </p>
            <p>
              Its cities carry completely different personalities — the grandeur of Jaipur, the effortless calm of Udaipur, the courage of Chittorgarh, the warmth of Ajmer, the distinctive character of Jaisalmer.
            </p>
            <p>
              Our first collection, The Five Signatures, brings five distinct personalities of Rajasthan into five parfums. Each one invites you to ask:“Which Signature am I today?”
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="relative h-[420px] sm:h-[560px] lg:h-[640px]">
            <img
              src="https://ik.imagekit.io/9sdifktgw0/box2.png?updatedAt=1785496774486?w=900&auto=format&fit=crop&q=80"
              alt="Perfume blending atelier"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-28 sm:w-36 h-28 sm:h-36 border border-primary/20 pointer-events-none" />
            <div className="absolute top-6 right-6 px-4 py-3 bg-[#080807]/80 backdrop-blur-sm border border-primary/15">
              <p className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>2026</p>
              <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Founded</p>
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

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <FadeIn>
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Questions
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-14 sm:mb-20" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Frequently Asked
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: "Are your fragrances cruelty-free?", a: "Yes. Every Avtar Aromas expression is cruelty-free and vegan-certified. We never test on animals." },
            { q: "How long will my scent last?", a: "Our Parfum Extrait concentrations last 12–24 hours. We do not dilute with fillers." },
            { q: "Do you ship internationally?", a: "Yes. We ship worldwide with tracked, insured delivery. Free shipping on orders above ₹5,000." },
            { q: "Can I visit the atelier?", a: "The Kannauj Atelier is open by appointment for private consultations and workshops." },
            { q: "What is your return policy?", a: "If a bottle arrives damaged or the scent does not match expectations within 14 days, we will replace or refund without question." },
            { q: "Are your ingredients ethically sourced?", a: "We name the origin of every key ingredient and maintain direct relationships with growers and harvesters." },
          ].map((item, i) => (
            <FadeIn key={item.q} delay={i * 0.05}>
              <div className="p-8 bg-[#0A0908] border border-[rgba(201,169,110,0.1)]">
                <h3 className="text-lg text-foreground mb-3" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{item.q}</h3>
                <p className="text-sm text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.85 }}>{item.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Contact Us ── */}
      <ContactSection />

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

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "name") {
      if (!value.trim()) err = "Please enter your name.";
      else if (value.trim().length < 2) err = "Name must be at least 2 characters.";
    } else if (field === "email") {
      if (!value.trim()) err = "Please enter your email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) err = "Please enter a valid email address.";
    } else if (field === "phone") {
      if (!value.trim()) err = "Please enter your mobile / phone number.";
      else if (!/^[0-9+\s\-()]{7,15}$/.test(value.trim())) err = "Please enter a valid phone number (7-15 digits).";
    } else if (field === "message") {
      if (!value.trim()) err = "Please enter your message.";
      else if (value.trim().length < 10) err = "Message must be at least 10 characters long.";
    }
    return err;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status) setStatus(null);
    if (errors[name as keyof typeof errors]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const newErrors: typeof errors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      message: validateField("message", formData.message),
    };

    if (newErrors.name || newErrors.email || newErrors.phone || newErrors.message) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
      });

      setStatus({
        type: "success",
        message: res.message || "Thank you! Your message has been sent to our concierge team. We will respond shortly.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setErrors({});
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Failed to send your message. Please verify your details and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-t border-[rgba(201,169,110,0.1)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <FadeIn>
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Get in touch
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Contact Us
          </h2>
          <div className="flex flex-col gap-6 text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
            <p>
              For bespoke orders, press enquiries, or collaboration proposals, reach out directly to our concierge team.
            </p>

            <div className="flex flex-col gap-5 py-6 border-y border-[rgba(201,169,110,0.12)] my-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[rgba(201,169,110,0.2)] flex items-center justify-center shrink-0 text-primary">
                  <Mail size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary/80 mb-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    Email
                  </p>
                  <a href="mailto:avtar.aromas@gmail.com" className="text-foreground hover:text-primary transition-colors text-base font-normal">
                    avtar.aromas@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[rgba(201,169,110,0.2)] flex items-center justify-center shrink-0 text-primary">
                  <Phone size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary/80 mb-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    Mobile / Call
                  </p>
                  <a href="tel:+919928922989" className="text-foreground hover:text-primary transition-colors text-base" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    +91 99289 22989
                  </a>
                </div>
              </div>
            </div>

            
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {status && (
              <div
                className={`p-4 border flex items-start gap-3 ${status.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                )}
                <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  {status.message}
                </p>
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name *"
                className={`bg-transparent border px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400 ${errors.name ? "border-red-500/60 focus:border-red-500" : "border-[rgba(201,169,110,0.2)] focus:border-primary/60"
                  }`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
              {errors.name && (
                <span className="text-xs text-red-400 px-1" style={{ fontFamily: "var(--font-body)" }}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address *"
                className={`bg-transparent border px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400 ${errors.email ? "border-red-500/60 focus:border-red-500" : "border-[rgba(201,169,110,0.2)] focus:border-primary/60"
                  }`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
              {errors.email && (
                <span className="text-xs text-red-400 px-1" style={{ fontFamily: "var(--font-body)" }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Mobile / Phone */}
            <div className="flex flex-col gap-1.5">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Mobile / Phone Number *"
                className={`bg-transparent border px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400 ${errors.phone ? "border-red-500/60 focus:border-red-500" : "border-[rgba(201,169,110,0.2)] focus:border-primary/60"
                  }`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
              {errors.phone && (
                <span className="text-xs text-red-400 px-1" style={{ fontFamily: "var(--font-body)" }}>
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject / Topic (Optional)"
                className="bg-transparent border border-[rgba(201,169,110,0.2)] px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/60 transition-colors duration-400"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message *"
                rows={5}
                className={`bg-transparent border px-6 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-400 ${errors.message ? "border-red-500/60 focus:border-red-500" : "border-[rgba(201,169,110,0.2)] focus:border-primary/60"
                  }`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
              {errors.message && (
                <span className="text-xs text-red-400 px-1" style={{ fontFamily: "var(--font-body)" }}>
                  {errors.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || status?.type === "success"}
              className={`px-8 py-4 text-xs tracking-[0.25em] uppercase font-medium transition-all duration-400 flex items-center justify-center gap-2 ${status?.type === "success"
                  ? "bg-emerald-600/90 text-white border border-emerald-500/40 cursor-default"
                  : "bg-primary text-[#080807] hover:bg-[#E8D5B0] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Message...
                </>
              ) : status?.type === "success" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Request Sent
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
