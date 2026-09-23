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

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#080807] text-foreground">
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 sm:py-32">
        <FadeIn>
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Terms of Use
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            Last updated: July 2025
          </p>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 flex flex-col gap-8 text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
            <FadeIn>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>1. Acceptance of Terms</h2>
              <p>By accessing or using the Avtar Aromas website, you agree to be bound by these Terms of Use. If you do not agree, please do not use our site or services.</p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>2. Use of the Site</h2>
              <p>You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else’s use and enjoyment of the site. Prohibited behaviour includes harassing or causing distress to any person through the website.</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>3. Product Information</h2>
              <p>We strive to display accurate product descriptions, pricing, and availability. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.</p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>4. Orders & Payment</h2>
              <p>All orders are subject to acceptance and availability. Payment must be received in full before dispatch. We accept major credit/debit cards and UPI via Razorpay.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>5. Shipping & Returns</h2>
              <p>Orders are shipped within 2–4 business days. If a bottle arrives damaged or the scent does not meet expectations, contact us within 14 days for a replacement or refund. Return shipping labels are provided for eligible returns.</p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>6. Intellectual Property</h2>
              <p>All content on this site — including text, images, logos, and designs — is the property of Avtar Aromas and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>7. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, Avtar Aromas shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of, or inability to use, the website or products.</p>
            </FadeIn>
            <FadeIn delay={0.35}>
              <h2 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>8. Governing Law</h2>
              <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kannauj, Uttar Pradesh.</p>
            </FadeIn>
          </div>
          <div className="lg:col-span-1">
            <FadeIn>
              <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                <p className="text-[10px] tracking-[0.35em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>On this page</p>
                <div className="flex flex-col gap-3 text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  <span>Acceptance of Terms</span>
                  <span>Use of the Site</span>
                  <span>Product Information</span>
                  <span>Orders & Payment</span>
                  <span>Shipping & Returns</span>
                  <span>Intellectual Property</span>
                  <span>Limitation of Liability</span>
                  <span>Governing Law</span>
                </div>
                <Link to="/privacy" className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary hover:gap-4 transition-all duration-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Privacy Policy <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}