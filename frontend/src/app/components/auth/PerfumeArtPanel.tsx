import React from "react";
import { CheckCircle2 } from "lucide-react";

interface PerfumeArtPanelProps {
  subtitle?: string;
  title?: React.ReactNode;
  description?: string;
  bullets?: string[];
}

export default function PerfumeArtPanel({
  subtitle = "AVTAR AROMAS",
  title = <>The Art of<br />Olfactory Alchemy</>,
  description = "Step into a world of rare botanicals, artisanal extraction, and bespoke fragrance creation.",
  bullets,
}: PerfumeArtPanelProps) {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#070706] flex flex-col justify-between p-10 lg:p-14 selection:bg-primary/20">
      {/* Dynamic Glow & Ambient Lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(201, 169, 110, 0.18) 0%, rgba(35, 27, 18, 0.45) 48%, rgba(7, 7, 6, 0.95) 88%)",
        }}
      />

      {/* Soft Background Grid / Geometry Lines */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#c9a96e_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Brand Tag */}
      <div className="relative z-10 flex items-center justify-end">
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground/60 uppercase font-mono">
          Est. 2026
        </span>
      </div>

      {/* Centerpiece Artwork: Creative Perfume Flacon & Botanical Olfactory Geometry */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4">
        <div className="relative w-full max-w-[480px] lg:max-w-[520px] aspect-square flex items-center justify-center">
          
          {/* Main SVG Creative Perfume Art */}
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full drop-shadow-[0_20px_50px_rgba(201,169,110,0.22)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Gold Gradients */}
              <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCEECA" />
                <stop offset="35%" stopColor="#E5C384" />
                <stop offset="70%" stopColor="#C9A96E" />
                <stop offset="100%" stopColor="#8A6D3B" />
              </linearGradient>

              <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A96E" />
                <stop offset="50%" stopColor="#7A5C2B" />
                <stop offset="100%" stopColor="#3D2E14" />
              </linearGradient>

              {/* Glass Reflection Gradient */}
              <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                <stop offset="30%" stopColor="rgba(255, 255, 255, 0.08)" />
                <stop offset="70%" stopColor="rgba(201, 169, 110, 0.05)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
              </linearGradient>

              {/* Liquid Perfume Amber Gradient */}
              <linearGradient id="amberElixir" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E8AA42" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#C67D22" stopOpacity="0.9" />
                <stop offset="85%" stopColor="#7E3E0E" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#4A2004" stopOpacity="0.98" />
              </linearGradient>

              {/* Subtle Aura Glow Filter */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="softMist" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="15" />
              </filter>
            </defs>

            {/* Background Scent Aura & Rays */}
            <circle cx="250" cy="260" r="190" fill="url(#goldLight)" opacity="0.03" />
            <circle cx="250" cy="260" r="150" stroke="url(#goldLight)" strokeWidth="1" strokeDasharray="4 8" opacity="0.25" />
            <circle cx="250" cy="260" r="210" stroke="url(#goldLight)" strokeWidth="0.75" strokeDasharray="1 12" opacity="0.3" />

            {/* Sacred Olfactory Geometry Lines */}
            <g stroke="url(#goldLight)" strokeWidth="0.8" opacity="0.3">
              {/* Triangular Pyramid of Notes (Top, Heart, Base) */}
              <polygon points="250,90 380,360 120,360" strokeDasharray="3 3" />
              {/* Note Nodes */}
              <circle cx="250" cy="90" r="4" fill="#E5C384" />
              <circle cx="380" cy="360" r="4" fill="#C9A96E" />
              <circle cx="120" cy="360" r="4" fill="#8A6D3B" />
              {/* Note Labels */}
              <text x="250" y="75" textAnchor="middle" fill="#E5C384" fontSize="10" fontFamily="serif" letterSpacing="2" opacity="0.8">TOP • CITRUS &amp; ELEMI</text>
              <text x="405" y="375" textAnchor="start" fill="#C9A96E" fontSize="9" fontFamily="serif" letterSpacing="1.5" opacity="0.7">HEART • DAMASK ROSE</text>
              <text x="95" y="375" textAnchor="end" fill="#8A6D3B" fontSize="9" fontFamily="serif" letterSpacing="1.5" opacity="0.7">BASE • AGARWOOD &amp; AMBER</text>
            </g>

            {/* Molecular Alchemy Ring (Benzene/Aromatic Rings) Left Side */}
            <g stroke="url(#goldLight)" strokeWidth="0.7" opacity="0.25" transform="translate(70, 180) scale(0.6)">
              <polygon points="30,0 60,17 60,52 30,69 0,52 0,17" fill="none" />
              <circle cx="30" cy="34.5" r="18" fill="none" />
              <line x1="60" y1="34.5" x2="90" y2="34.5" />
              <circle cx="90" cy="34.5" r="3" fill="#E5C384" />
            </g>

            {/* Botanical Flower Line Art - Right Side (Rose / Jasmine outline) */}
            <g stroke="url(#goldLight)" strokeWidth="0.8" opacity="0.35" fill="none" transform="translate(330, 140)">
              {/* Flower Stem & Leaves */}
              <path d="M 30 110 C 25 80, 45 40, 20 10" />
              <path d="M 32 80 C 55 75, 65 60, 50 50 C 38 52, 32 70, 32 80 Z" fill="url(#goldLight)" fillOpacity="0.1" />
              {/* Rose Petals */}
              <path d="M 20 10 C 10 -5, -5 5, 0 20 C -10 30, 5 45, 20 35 C 35 45, 45 25, 35 10 Z" />
              <circle cx="16" cy="18" r="6" strokeDasharray="2 2" />
            </g>

            {/* Botanical Lavender Stems - Left Side */}
            <g stroke="url(#goldLight)" strokeWidth="0.8" opacity="0.35" fill="none" transform="translate(100, 220)">
              <path d="M 30 120 Q 15 60 25 0" />
              <ellipse cx="21" cy="15" rx="4" ry="7" transform="rotate(-20 21 15)" fill="url(#goldLight)" fillOpacity="0.15" />
              <ellipse cx="30" cy="30" rx="4" ry="7" transform="rotate(20 30 30)" fill="url(#goldLight)" fillOpacity="0.15" />
              <ellipse cx="20" cy="45" rx="4" ry="7" transform="rotate(-25 20 45)" fill="url(#goldLight)" fillOpacity="0.15" />
              <ellipse cx="28" cy="60" rx="4" ry="7" transform="rotate(15 28 60)" fill="url(#goldLight)" fillOpacity="0.15" />
            </g>

            {/* Ambient Fragrance Mist Rays (Static Radiance) */}
            <g opacity="0.18">
              <ellipse cx="250" cy="140" rx="90" ry="25" fill="url(#goldLight)" filter="url(#softMist)" />
              <path d="M 250 140 L 170 60 M 250 140 L 330 60 M 250 140 L 250 40 M 250 140 L 210 45 M 250 140 L 290 45" stroke="url(#goldLight)" strokeWidth="1" strokeDasharray="2 4" />
            </g>

            {/* ================= CENTRAL LUXURY BOTTLE ARTWORK ================= */}
            <g transform="translate(0, 10)">
              
              {/* Bottle Shadow */}
              <ellipse cx="250" cy="395" rx="85" ry="14" fill="#000000" opacity="0.75" />

              {/* 1. FLACON BODY (Outer Glass Structure) */}
              <path
                d="M 175 220 
                   L 200 170 
                   L 300 170 
                   L 325 220 
                   L 325 365 
                   C 325 380, 310 390, 290 390 
                   L 210 390 
                   C 190 390, 175 380, 175 365 
                   Z"
                fill="#12100D"
                stroke="url(#goldLight)"
                strokeWidth="1.5"
              />

              {/* Inner Liquid Chamber (Amber Elixir) */}
              <path
                d="M 188 235 
                   L 208 190 
                   L 292 190 
                   L 312 235 
                   L 312 355 
                   C 312 368, 300 376, 282 376 
                   L 218 376 
                   C 200 376, 188 368, 188 355 
                   Z"
                fill="url(#amberElixir)"
              />

              {/* Liquid Level Surface & Meniscus */}
              <ellipse cx="250" cy="225" rx="55" ry="8" fill="#FCEECA" opacity="0.4" />
              <ellipse cx="250" cy="225" rx="50" ry="5" fill="#E8AA42" opacity="0.6" />

              {/* Liquid Bubbles / Floating Essence Orbs */}
              <circle cx="230" cy="310" r="3" fill="#FFF4D0" opacity="0.6" />
              <circle cx="275" cy="280" r="4.5" fill="#FFF4D0" opacity="0.5" />
              <circle cx="255" cy="340" r="2.5" fill="#FFF4D0" opacity="0.7" />
              <circle cx="215" cy="260" r="2" fill="#FFF4D0" opacity="0.4" />

              {/* Glass Facet Refraction Cut Lines */}
              <path d="M 200 170 L 218 190 L 218 376 L 210 390" stroke="url(#glassReflect)" strokeWidth="1.2" />
              <path d="M 300 170 L 282 190 L 282 376 L 290 390" stroke="url(#glassReflect)" strokeWidth="1.2" />
              <path d="M 250 170 L 250 390" stroke="url(#glassReflect)" strokeWidth="0.8" opacity="0.4" />

              {/* Glass Highlight Reflections (Frosted Shine) */}
              <path
                d="M 183 230 L 195 200 L 202 203 L 190 233 Z"
                fill="url(#glassReflect)"
                opacity="0.8"
              />
              <path
                d="M 183 245 L 183 340 L 192 345 L 192 245 Z"
                fill="url(#glassReflect)"
                opacity="0.5"
              />

              {/* 2. GOLD METALLIC NECK & SPRAY NOZZLE */}
              {/* Neck Collar */}
              <rect x="228" y="142" width="44" height="28" rx="2" fill="url(#goldLight)" stroke="#5E4720" strokeWidth="0.8" />
              {/* Guilloché Engraved Neck Rings */}
              <line x1="228" y1="149" x2="272" y2="149" stroke="#7A5C2B" strokeWidth="1" />
              <line x1="228" y1="156" x2="272" y2="156" stroke="#7A5C2B" strokeWidth="1" />
              <line x1="228" y1="163" x2="272" y2="163" stroke="#7A5C2B" strokeWidth="1" />

              {/* Atomizer Stem */}
              <rect x="244" y="132" width="12" height="10" fill="url(#goldDark)" />

              {/* 3. CRYSTAL OCTAGONAL STOPPER (CAP) */}
              {/* Stopper Base Ring */}
              <rect x="232" y="126" width="36" height="7" rx="1" fill="url(#goldLight)" />
              {/* Emerald-cut Crystal Crown */}
              <polygon
                points="225,124 235,80 265,80 275,124"
                fill="#1C1813"
                stroke="url(#goldLight)"
                strokeWidth="1.5"
              />
              {/* Stopper Crystal Facet Reflections */}
              <polygon points="235,80 250,80 244,124 225,124" fill="url(#glassReflect)" opacity="0.6" />
              <polygon points="250,80 265,80 275,124 256,124" fill="url(#goldLight)" opacity="0.15" />
              {/* Inner Gold Core in Stopper */}
              <rect x="245" y="88" width="10" height="28" rx="2" fill="url(#goldLight)" opacity="0.7" />

              {/* 4. GOLD EMBLEM LABEL ON BOTTLE FRONT */}
              <g transform="translate(210, 248)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="70"
                  rx="3"
                  fill="#0B0A08"
                  stroke="url(#goldLight)"
                  strokeWidth="1"
                />
                <rect
                  x="3"
                  y="3"
                  width="74"
                  height="64"
                  rx="2"
                  fill="none"
                  stroke="url(#goldLight)"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
                {/* Crest Icon */}
                <path d="M 40 14 L 46 22 L 34 22 Z" fill="url(#goldLight)" />
                <circle cx="40" cy="20" r="1.5" fill="#0B0A08" />
                {/* Brand Text */}
                <text x="40" y="34" textAnchor="middle" fill="#E5C384" fontSize="8.5" fontFamily="serif" letterSpacing="2.5" fontWeight="bold">AVTAR</text>
                <text x="40" y="44" textAnchor="middle" fill="#C9A96E" fontSize="5.5" fontFamily="sans-serif" letterSpacing="1.8">AROMAS</text>
                <line x1="20" y1="50" x2="60" y2="50" stroke="url(#goldLight)" strokeWidth="0.5" />
                <text x="40" y="58" textAnchor="middle" fill="#8A6D3B" fontSize="4.5" fontFamily="serif" letterSpacing="1">EXTRAIT DE PARFUM</text>
              </g>

            </g>
          </svg>

        </div>
      </div>

      {/* Bottom Brand Copy */}
      <div className="relative z-10 max-w-md">
        <p
          className="text-[10px] tracking-[0.55em] uppercase text-primary mb-3 font-mono font-medium"
        >
          {subtitle}
        </p>
        <h2
          className="text-3xl lg:text-4xl text-foreground leading-[1.15] mb-4 font-serif font-light italic"
        >
          {title}
        </h2>
        <div className="w-12 h-px bg-gradient-to-r from-primary via-primary/50 to-transparent mb-4" />
        
        {description && (
          <p
            className="text-xs lg:text-sm text-[#9A9388] leading-relaxed font-light"
          >
            {description}
          </p>
        )}

        {bullets && bullets.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={14} strokeWidth={1.5} className="text-primary flex-shrink-0" />
                <p className="text-xs text-[#B5AEA3] font-light">{b}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subtle Right-edge Border Gradient Fade */}
      <div
        className="absolute inset-y-0 right-0 w-px pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.3) 30%, rgba(201,169,110,0.3) 70%, transparent)",
        }}
      />
    </div>
  );
}
