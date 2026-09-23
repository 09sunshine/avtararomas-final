import { Link } from "react-router";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { useState } from "react";
import { subscribeToNewsletter } from "../../lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await subscribeToNewsletter(email);
      setSubscribed(true);
      setMessage(result.alreadySubscribed ? "You're already subscribed!" : "Welcome to the Inner Circle ✦");
      setEmail("");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#050504] border-t border-[rgba(201,169,110,0.1)]">
      {/* Newsletter strip */}
      <div className="border-b border-[rgba(201,169,110,0.08)]">
        <div className="max-w-[1440px] mx-auto px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Join the Inner Circle</p>
            <h3 className="text-3xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              Rare drops. Private events.<br />Stories of scent.
            </h3>
          </div>
          {subscribed ? (
            <div>
              <p className="text-sm text-primary tracking-wider" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{message || "Welcome to the Inner Circle ✦"}</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-0 w-full md:w-auto md:min-w-[400px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-transparent border border-[rgba(201,169,110,0.2)] border-r-0 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors duration-400"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#E8D5B0] transition-colors duration-400 whitespace-nowrap disabled:opacity-60"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
              {message && !subscribed && (
                <p className="text-xs text-red-400 mt-2 w-full" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{message}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.5em] text-primary uppercase mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>artisan perfumes</p>
              <p className="text-2xl tracking-[0.12em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>AVTAR AROMAS</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-xs" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Handcrafted in small batches using the world&apos;s finest natural ingredients. Each fragrance is a composition — an expression of emotion, memory, and craft.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/avtar_aromas" },
                { Icon: Twitter, href: "https://www.instagram.com/avtar_aromas" },
                { Icon: Facebook, href: "#" },
                { Icon: Youtube, href: "https://www.youtube.com/@Akayyys_life" },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} className="w-9 h-9 border border-[rgba(201,169,110,0.2)] flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-400">
                  <Icon size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Collection",
              links: [
                ["Eau de Parfum", "/shop?category=Eau de Parfum"],
                ["Parfum Extrait", "/shop?category=Parfum Extrait"],
                ["Eau de Toilette", "/shop?category=Eau de Toilette"],
                ["Gift Sets", "/shop?category=Gift Sets"],
                ["Bestsellers", "/shop?sort=bestsellers"],
                ["New Arrivals", "/shop?filter=new"],
              ],
            },
            {
              title: "Explore",
              links: [
                ["Why Us", "/#why-us"],
                ["Reviews", "/#reviews"],
                ["Newsletter", "/#newsletter"],
              ],
              isAnchor: true,
            },
            {
              title: "Customer Care",
              links: [
                ["FAQ", "/about#faq"],
                ["Contact Us", "/about#contact"],
                ["Privacy Policy", "/privacy"],
                ["Terms of Use", "/terms"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="text-[10px] tracking-[0.35em] uppercase text-primary mb-5 font-normal"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {col.isAnchor ? (
                      <a
                        href={href}
                        className="text-sm text-muted-foreground hover:text-[#D9D2C7] transition-colors duration-300"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        to={href}
                        className="text-sm text-muted-foreground hover:text-[#D9D2C7] transition-colors duration-300"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-[rgba(201,169,110,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            © 2026 Avtar Aromas. All rights reserved. Handcrafted in India.
          </p>
          <div className="flex items-center gap-2">
            {["🇮🇳", "🔒 SSL Secured", "✦ Razorpay Payments"].map((item, i) => (
              <span key={i} className="text-xs text-muted-foreground/60 px-3 border-r border-muted-foreground/20 last:border-0" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
