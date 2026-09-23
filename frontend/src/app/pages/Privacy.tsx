import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#080807] text-foreground">
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-32">
        <FadeIn>
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            Last updated: July 2025
          </p>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 flex flex-col gap-8 text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
            <FadeIn>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>1. Introduction</h2>
              <p>At Avtar Aromas, we respect your privacy and are committed to protecting the personal information you share with us. This policy explains how we collect, use, and safeguard your data when you visit our website or make a purchase.</p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>2. Information We Collect</h2>
              <p>We may collect your name, email address, shipping address, phone number, and payment details when you place an order. We also collect non‑personal information such as browser type and usage patterns to improve our site.</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>3. How We Use Your Information</h2>
              <p>Your data is used to process orders, provide customer support, send transactional updates, and (only with your consent) send marketing communications. We do not sell or rent your personal data to third parties.</p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>4. Cookies & Tracking</h2>
              <p>We use cookies to enhance your browsing experience, remember preferences, and analyse site traffic. You can manage or disable cookies through your browser settings.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>5. Data Security</h2>
              <p>We implement appropriate technical and organisational measures to protect your data. However, no online transmission is completely secure, and we cannot guarantee absolute security.</p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>6. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data by contacting us at concierge@avtararomas.com. We will respond within 30 days.</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>7. Changes to This Policy</h2>
              <p>We may update this policy from time to time. Any changes will be posted on this page with a revised effective date.</p>
            </FadeIn>
          </div>
          <div className="lg:col-span-1">
            <FadeIn>
              <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                <p className="text-[10px] tracking-[0.35em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>On this page</p>
                <div className="flex flex-col gap-3 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  <span>Introduction</span>
                  <span>Information We Collect</span>
                  <span>How We Use Your Information</span>
                  <span>Cookies & Tracking</span>
                  <span>Data Security</span>
                  <span>Your Rights</span>
                  <span>Changes to This Policy</span>
                </div>
                <Link to="/terms" className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary hover:gap-4 transition-all duration-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Terms of Use <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}