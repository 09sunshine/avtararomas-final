import { motion } from "motion/react";

/**
 * StoryHeroArt
 * ---------------------------------------------------------------------------
 * Bespoke SVG artwork for the "Our Story" hero.
 *
 * Concept: the traditional Kannauj *deg-bhapka* hydro-distillation setup —
 * a hammered copper cauldron (deg) over a slow wood fire, a bamboo condenser
 * (chonga) arcing into a submerged receiver (bhapka), framed by an olfactory
 * "memory constellation" of the house's signature raw materials.
 *
 * Deliberately different from the Login page flacon art (that one is a
 * product/bottle study; this is a heritage/craft study) while sharing the
 * same language: ink-black ground, single gold palette, thin line work,
 * dotted geometry, serif micro-labels.
 */

const ART_CSS = `
@keyframes sa-rise {
  0%   { transform: translateY(0) scaleX(1);      opacity: 0; }
  18%  {                                          opacity: 0.55; }
  100% { transform: translateY(-190px) scaleX(1.5); opacity: 0; }
}
@keyframes sa-flicker {
  0%, 100% { transform: scaleY(1) scaleX(1);       opacity: 0.9; }
  40%      { transform: scaleY(1.18) scaleX(0.94); opacity: 1; }
  70%      { transform: scaleY(0.94) scaleX(1.04); opacity: 0.8; }
}
@keyframes sa-ember {
  0%, 100% { opacity: 0.35; }
  50%      { opacity: 0.7; }
}
@keyframes sa-twinkle {
  0%, 100% { opacity: 0.2; }
  50%      { opacity: 0.9; }
}
@keyframes sa-drop {
  0%   { transform: translateY(0);   opacity: 0; }
  12%  {                             opacity: 0.9; }
  78%  {                             opacity: 0.9; }
  100% { transform: translateY(52px); opacity: 0; }
}
@keyframes sa-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-16px); }
}
@keyframes sa-ripple {
  0%   { transform: scaleX(0.6); opacity: 0.5; }
  100% { transform: scaleX(1.5); opacity: 0; }
}
@keyframes sa-orbit { to { transform: rotate(360deg); } }

.sa-anim { transform-box: fill-box; }
.sa-mist    { animation: sa-rise 10s ease-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
.sa-flame   { animation: sa-flicker 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
.sa-ember   { animation: sa-ember 3.2s ease-in-out infinite; }
.sa-twinkle { animation: sa-twinkle 4s ease-in-out infinite; }
.sa-drop    { animation: sa-drop 4.5s cubic-bezier(0.4,0,0.9,0.4) infinite; transform-box: fill-box; }
.sa-float   { animation: sa-float 11s ease-in-out infinite; transform-box: fill-box; }
.sa-ripple  { animation: sa-ripple 4.5s ease-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
.sa-orbit   { animation: sa-orbit 140s linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }

@media (prefers-reduced-motion: reduce) {
  .sa-mist, .sa-flame, .sa-ember, .sa-twinkle, .sa-drop, .sa-float, .sa-ripple, .sa-orbit {
    animation: none !important;
  }
}
`;

/** Signature raw materials — plotted as a "memory constellation" above the still. */
const NOTES: { x: number; y: number; label: string; r: number }[] = [
  { x: 372, y: 176, label: "SAFFRON", r: 3 },
  { x: 566, y: 104, label: "KANNAUJ ROSE", r: 4 },
  { x: 800, y: 150, label: "ASSAM OUD", r: 4.5 },
  { x: 1034, y: 96, label: "MYSORE SANDAL", r: 4 },
  { x: 1236, y: 172, label: "HAITIAN VETIVER", r: 3 },
];

/** Small apothecary vials of graded attar, lined up on the atelier bench. */
function Vial({
  x,
  h,
  w = 34,
  fill = 0.66,
  delay = 0,
}: {
  x: number;
  h: number;
  w?: number;
  fill?: number;
  delay?: number;
}) {
  return (
    <g className="sa-float" style={{ animationDelay: `${delay}s` }}>
      {/* body */}
      <rect x={x} y={-h} width={w} height={h} rx={4} fill="#100E0A" stroke="url(#saGold)" strokeWidth="1" />
      {/* attar */}
      <rect
        x={x + 2.5}
        y={-h * fill}
        width={w - 5}
        height={h * fill - 2.5}
        rx={3}
        fill="url(#saAttar)"
        opacity="0.8"
      />
      {/* liquid meniscus */}
      <line x1={x + 2.5} y1={-h * fill} x2={x + w - 2.5} y2={-h * fill} stroke="#FCEECA" strokeWidth="0.8" opacity="0.45" />
      {/* neck + stopper */}
      <rect x={x + w / 2 - 5} y={-h - 13} width={10} height={13} fill="#0F0D0A" stroke="url(#saGold)" strokeWidth="0.8" />
      <rect x={x + w / 2 - 8} y={-h - 21} width={16} height={8} rx={2} fill="url(#saGold)" opacity="0.85" />
      {/* glass sheen */}
      <rect x={x + 4} y={-h + 7} width="3" height={Math.max(h - 16, 6)} fill="url(#saSheen)" opacity="0.55" />
    </g>
  );
}

export default function StoryHeroArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070706]">
      <style>{ART_CSS}</style>

      {/* Ambient atelier glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 78% 68% at 52% 40%, rgba(201,169,110,0.17) 0%, rgba(44,33,19,0.36) 42%, rgba(7,7,6,0.96) 84%)",
        }}
      />
      {/* Fine dotted apothecary grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#c9a96e_1px,transparent_1px)] [background-size:26px_26px]" />

      <motion.svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <defs>
          <linearGradient id="saGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCEECA" />
            <stop offset="38%" stopColor="#E5C384" />
            <stop offset="72%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor="#7A5C2B" />
          </linearGradient>

          <linearGradient id="saCopper" x1="12%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#F3CFA2" />
            <stop offset="26%" stopColor="#D19457" />
            <stop offset="58%" stopColor="#9A5C28" />
            <stop offset="100%" stopColor="#4A2A11" />
          </linearGradient>

          <linearGradient id="saCopperDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B0793C" />
            <stop offset="55%" stopColor="#6B3C17" />
            <stop offset="100%" stopColor="#2E1A08" />
          </linearGradient>

          <linearGradient id="saAttar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8AA42" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#C67D22" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#5B2907" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id="saSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(201,169,110,0.22)" />
          </linearGradient>

          <linearGradient id="saHorizon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,169,110,0)" />
            <stop offset="28%" stopColor="rgba(201,169,110,0.42)" />
            <stop offset="72%" stopColor="rgba(201,169,110,0.42)" />
            <stop offset="100%" stopColor="rgba(201,169,110,0)" />
          </linearGradient>

          <radialGradient id="saEmber" cx="50%" cy="78%" r="62%">
            <stop offset="0%" stopColor="#FFD08A" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#E07C1E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3A1502" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="saWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9FD3D8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0E2B31" stopOpacity="0.5" />
          </linearGradient>

          <filter id="saMistBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="saGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
        </defs>

        {/* ══════════ Background geometry: rings of diffusion ══════════ */}
        <g opacity="0.5">
          <circle cx="800" cy="360" r="500" stroke="url(#saGold)" strokeWidth="0.7" strokeDasharray="1 20" opacity="0.35" />
          <circle cx="800" cy="360" r="392" stroke="url(#saGold)" strokeWidth="0.8" strokeDasharray="3 12" opacity="0.3" />
          <circle
            cx="800"
            cy="360"
            r="288"
            stroke="url(#saGold)"
            strokeWidth="1"
            strokeDasharray="5 9"
            opacity="0.28"
            className="sa-orbit"
          />
        </g>

        {/* ══════════ Memory constellation of signature notes ══════════ */}
        <g>
          <polyline
            points={NOTES.map((n) => `${n.x},${n.y}`).join(" ")}
            stroke="url(#saGold)"
            strokeWidth="0.8"
            strokeDasharray="2 7"
            opacity="0.3"
          />
          {NOTES.map((n, i) => (
            <g key={n.label}>
              {/* leader down toward the still */}
              <line
                x1={n.x}
                y1={n.y + n.r + 4}
                x2={n.x}
                y2={n.y + 34}
                stroke="url(#saGold)"
                strokeWidth="0.6"
                strokeDasharray="1 6"
                opacity="0.24"
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="#E5C384"
                className="sa-twinkle"
                style={{ animationDelay: `${i * 0.7}s` }}
              />
              <circle cx={n.x} cy={n.y} r={n.r + 7} stroke="url(#saGold)" strokeWidth="0.6" opacity="0.28" />
              <text
                x={n.x}
                y={n.y - 18}
                textAnchor="middle"
                fill="#C9A96E"
                fontSize="11"
                letterSpacing="3.4"
                opacity="0.55"
                style={{ fontFamily: "var(--font-mono), monospace" }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </g>

        {/* ══════════ Aromatic molecule study (left) ══════════ */}
        <g stroke="url(#saGold)" strokeWidth="0.8" opacity="0.22" transform="translate(214, 300) scale(1.15)">
          <polygon points="34,0 68,19 68,58 34,77 0,58 0,19" />
          <circle cx="34" cy="38.5" r="20" strokeDasharray="3 3" />
          <line x1="68" y1="38.5" x2="112" y2="24" />
          <circle cx="118" cy="22" r="3.5" fill="#E5C384" stroke="none" />
          <line x1="34" y1="77" x2="34" y2="112" />
          <circle cx="34" cy="118" r="3" fill="#C9A96E" stroke="none" />
        </g>

        {/* ══════════ Botanical line art: rose stem (upper left) ══════════ */}
        <g stroke="url(#saGold)" strokeWidth="1.1" fill="none" opacity="0.4" transform="translate(112, 128) scale(1.25)">
          <path d="M 62 320 C 54 236, 78 156, 42 62" />
          <path d="M 64 240 C 112 230, 132 194, 102 174 C 74 180, 64 216, 64 240 Z" fill="url(#saGold)" fillOpacity="0.07" />
          <path d="M 56 176 C 20 166, 4 134, 28 116 C 50 122, 56 156, 56 176 Z" fill="url(#saGold)" fillOpacity="0.07" />
          <path d="M 42 62 C 20 34, -6 46, 2 74 C -14 98, 14 128, 42 110 C 72 128, 96 90, 76 60 C 66 42, 52 44, 42 62 Z" />
          <path d="M 26 78 C 30 60, 54 58, 60 76 C 64 92, 46 100, 34 94 C 26 90, 24 84, 26 78 Z" />
          <circle cx="42" cy="80" r="7" strokeDasharray="2 3" />
        </g>

        {/* ══════════ Botanical line art: sandalwood branch (upper right) ══════════ */}
        <g stroke="url(#saGold)" strokeWidth="1.05" fill="none" opacity="0.36" transform="translate(1352, 116)">
          <path d="M 12 330 C 52 262, 60 176, 132 78" />
          {[
            { cx: 34, cy: 268, rot: -34 },
            { cx: 58, cy: 226, rot: 30 },
            { cx: 46, cy: 190, rot: -28 },
            { cx: 74, cy: 156, rot: 34 },
            { cx: 68, cy: 118, rot: -22 },
            { cx: 104, cy: 96, rot: 40 },
          ].map((l, i) => (
            <ellipse
              key={i}
              cx={l.cx}
              cy={l.cy}
              rx="9"
              ry="22"
              transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
              fill="url(#saGold)"
              fillOpacity="0.09"
            />
          ))}
          <circle cx="132" cy="78" r="4" fill="#E5C384" stroke="none" opacity="0.8" />
        </g>

        {/* ══════════ Vetiver tufts along the bench line ══════════ */}
        {[
          { tx: 336, s: 1 },
          { tx: 1042, s: 0.82 },
        ].map((v) => (
          <g
            key={v.tx}
            stroke="url(#saGold)"
            strokeWidth="0.9"
            fill="none"
            opacity="0.26"
            transform={`translate(${v.tx}, 560) scale(${v.s})`}
          >
            <path d="M 0 0 C -6 -52, -26 -86, -54 -108" />
            <path d="M 0 0 C -2 -60, -6 -104, -18 -142" />
            <path d="M 0 0 C 6 -58, 14 -100, 34 -136" />
            <path d="M 0 0 C 10 -46, 30 -78, 58 -98" />
            <path d="M 0 0 C 2 -34, 12 -58, 22 -72" />
          </g>
        ))}

        {/* ══════════ Bench / horizon ══════════ */}
        <ellipse cx="800" cy="566" rx="240" ry="16" fill="#000000" opacity="0.6" filter="url(#saMistBlur)" />
        <ellipse cx="1146" cy="566" rx="130" ry="12" fill="#000000" opacity="0.5" filter="url(#saMistBlur)" />
        <line x1="0" y1="560" x2="1600" y2="560" stroke="url(#saHorizon)" strokeWidth="1.2" />
        <line x1="0" y1="566" x2="1600" y2="566" stroke="url(#saHorizon)" strokeWidth="0.6" strokeDasharray="4 10" opacity="0.5" />

        {/* ══════════ THE DEG (copper cauldron) over the slow fire ══════════ */}
        <g>
          {/* Furnace / bhatti */}
          <path
            d="M 686 560 L 704 470 L 896 470 L 914 560 Z"
            fill="#100E0B"
            stroke="url(#saCopperDark)"
            strokeWidth="1.2"
          />
          {/* brick coursing */}
          <g stroke="url(#saGold)" strokeWidth="0.5" opacity="0.16">
            <line x1="698" y1="500" x2="902" y2="500" />
            <line x1="692" y1="530" x2="908" y2="530" />
            <line x1="742" y1="470" x2="736" y2="500" />
            <line x1="858" y1="470" x2="864" y2="500" />
            <line x1="722" y1="500" x2="714" y2="530" />
            <line x1="878" y1="500" x2="886" y2="530" />
          </g>
          {/* fire mouth */}
          <path d="M 758 560 L 758 516 Q 800 480 842 516 L 842 560 Z" fill="url(#saEmber)" />
          <path
            d="M 758 560 L 758 516 Q 800 480 842 516 L 842 560"
            stroke="url(#saCopper)"
            strokeWidth="1.2"
            opacity="0.7"
            fill="none"
          />
          {/* flames */}
          <g>
            <path
              className="sa-flame"
              d="M 800 552 C 788 528, 808 518, 800 494 C 822 512, 820 538, 800 552 Z"
              fill="#F0A63C"
              opacity="0.9"
            />
            <path
              className="sa-flame"
              style={{ animationDelay: "0.6s" }}
              d="M 780 554 C 772 536, 784 528, 780 512 C 796 526, 794 544, 780 554 Z"
              fill="#E88A28"
              opacity="0.75"
            />
            <path
              className="sa-flame"
              style={{ animationDelay: "1.2s" }}
              d="M 820 554 C 812 536, 824 528, 820 512 C 836 526, 834 544, 820 554 Z"
              fill="#E88A28"
              opacity="0.75"
            />
            <path
              className="sa-flame"
              style={{ animationDelay: "0.3s" }}
              d="M 800 550 C 794 536, 804 530, 800 518 C 812 530, 810 542, 800 550 Z"
              fill="#FFDFA0"
              opacity="0.85"
            />
          </g>
          {/* ember specks */}
          {[
            { cx: 772, cy: 500, r: 2 },
            { cx: 828, cy: 492, r: 1.6 },
            { cx: 800, cy: 476, r: 2.2 },
          ].map((e, i) => (
            <circle
              key={i}
              cx={e.cx}
              cy={e.cy}
              r={e.r}
              fill="#FFC773"
              className="sa-ember"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}

          {/* Cauldron body */}
          <path
            d="M 690 404
               C 690 328, 731 282, 800 282
               C 869 282, 910 328, 910 404
               C 910 450, 866 478, 800 478
               C 734 478, 690 450, 690 404 Z"
            fill="#150F0A"
            stroke="url(#saCopper)"
            strokeWidth="1.8"
          />
          {/* hammered copper contours */}
          <g stroke="url(#saCopper)" strokeWidth="0.8" opacity="0.32" fill="none">
            <path d="M 700 366 C 748 392, 852 392, 900 366" />
            <path d="M 696 400 C 748 430, 852 430, 904 400" />
            <path d="M 706 434 C 750 460, 850 460, 894 434" />
            <path d="M 716 330 C 754 352, 846 352, 884 330" />
          </g>
          {/* rim light + glass-like sheen */}
          <path
            d="M 724 452 C 700 412, 706 356, 744 314 C 726 336, 712 372, 716 410 C 718 430, 722 442, 724 452 Z"
            fill="url(#saSheen)"
            opacity="0.5"
          />
          <path d="M 862 320 C 890 348, 898 388, 890 424" stroke="#FFE4B5" strokeWidth="1.4" opacity="0.22" fill="none" />

          {/* Clay-sealed neck */}
          <rect x="772" y="250" width="56" height="34" rx="3" fill="url(#saCopperDark)" stroke="url(#saCopper)" strokeWidth="1" />
          <line x1="772" y1="260" x2="828" y2="260" stroke="#2E1A08" strokeWidth="1" opacity="0.8" />
          <line x1="772" y1="272" x2="828" y2="272" stroke="#2E1A08" strokeWidth="1" opacity="0.8" />
          <ellipse cx="800" cy="250" rx="36" ry="9" fill="url(#saCopper)" opacity="0.9" />
          <ellipse cx="800" cy="248" rx="22" ry="5" fill="#120D08" opacity="0.85" />
        </g>

        {/* ══════════ THE CHONGA (bamboo condenser pipe) ══════════ */}
        <g fill="none">
          <path
            d="M 826 252 C 902 236, 1010 278, 1082 358 C 1120 402, 1140 438, 1145 470"
            stroke="url(#saCopperDark)"
            strokeWidth="13"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M 826 252 C 902 236, 1010 278, 1082 358 C 1120 402, 1140 438, 1145 470"
            stroke="url(#saCopper)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* bamboo node bindings */}
          <path
            d="M 826 252 C 902 236, 1010 278, 1082 358 C 1120 402, 1140 438, 1145 470"
            stroke="#FFE4B5"
            strokeWidth="1.4"
            strokeDasharray="1 46"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* cloth wrap at the joint */}
          <ellipse cx="836" cy="250" rx="13" ry="10" fill="url(#saGold)" opacity="0.5" transform="rotate(-12 836 250)" />
        </g>

        {/* ══════════ THE BHAPKA (receiver in a water trough) ══════════ */}
        <g>
          {/* trough */}
          <path d="M 1054 560 L 1060 496 L 1232 496 L 1238 560 Z" fill="#0C0B09" stroke="url(#saGold)" strokeWidth="1" opacity="0.85" />
          {/* receiver neck + vessel */}
          <rect x="1130" y="464" width="30" height="24" rx="2" fill="url(#saCopperDark)" stroke="url(#saCopper)" strokeWidth="1" />
          <ellipse cx="1145" cy="512" rx="58" ry="46" fill="#150F0A" stroke="url(#saCopper)" strokeWidth="1.5" />
          <path d="M 1100 494 C 1112 476, 1128 468, 1140 468 C 1120 480, 1108 492, 1104 506 Z" fill="url(#saSheen)" opacity="0.45" />
          <path d="M 1096 512 C 1114 536, 1176 536, 1194 512" stroke="url(#saCopper)" strokeWidth="0.8" opacity="0.35" fill="none" />
          {/* attar collecting inside (hinted through the rim) */}
          <ellipse cx="1145" cy="524" rx="42" ry="22" fill="url(#saAttar)" opacity="0.35" />
          {/* water */}
          <rect x="1058" y="528" width="176" height="32" fill="url(#saWater)" />
          <line x1="1060" y1="528" x2="1232" y2="528" stroke="#CFEAEC" strokeWidth="0.8" opacity="0.35" />
          <ellipse cx="1145" cy="528" rx="34" ry="4" stroke="#CFEAEC" strokeWidth="0.7" opacity="0.3" className="sa-ripple" />
          <ellipse
            cx="1145"
            cy="528"
            rx="34"
            ry="4"
            stroke="#CFEAEC"
            strokeWidth="0.7"
            opacity="0.3"
            className="sa-ripple"
            style={{ animationDelay: "2.2s" }}
          />
          {/* falling attar droplet from the pipe mouth */}
          <circle cx="1145" cy="490" r="3" fill="#FFD9A0" className="sa-drop" />
          <circle cx="1145" cy="490" r="3" fill="#FFD9A0" className="sa-drop" style={{ animationDelay: "2.3s" }} />
        </g>

        {/* ══════════ Vapour / mist ══════════ */}
        <g opacity="0.5">
          <ellipse cx="800" cy="238" rx="120" ry="30" fill="url(#saGold)" opacity="0.1" filter="url(#saMistBlur)" />
          {[
            { d: "M 790 246 C 762 200, 812 168, 786 118", delay: 0 },
            { d: "M 806 246 C 836 202, 792 172, 818 122", delay: 2.4 },
            { d: "M 800 244 C 780 196, 820 176, 802 128", delay: 4.6 },
            { d: "M 1146 470 C 1122 434, 1166 412, 1144 376", delay: 1.5 },
            { d: "M 1152 470 C 1180 440, 1140 418, 1162 386", delay: 3.7 },
          ].map((m, i) => (
            <path
              key={i}
              className="sa-mist"
              style={{ animationDelay: `${m.delay}s` }}
              d={m.d}
              stroke="url(#saGold)"
              strokeWidth="1.2"
              strokeDasharray="3 8"
              fill="none"
            />
          ))}
        </g>

        {/* ══════════ Graded attar vials on the bench ══════════ */}
        <g transform="translate(1268, 560)">
          <Vial x={0} h={62} w={30} fill={0.58} delay={0} />
          <Vial x={44} h={92} w={34} fill={0.72} delay={1.8} />
          <Vial x={92} h={74} w={30} fill={0.5} delay={3.4} />
          <Vial x={136} h={104} w={36} fill={0.8} delay={2.6} />
          <line x1="-14" y1="0" x2="196" y2="0" stroke="url(#saGold)" strokeWidth="0.8" opacity="0.3" />
        </g>

        {/* ══════════ Floating essence motes ══════════ */}
        {[
          { cx: 470, cy: 300, r: 2.2, d: 0 },
          { cx: 640, cy: 240, r: 1.6, d: 1.4 },
          { cx: 960, cy: 210, r: 2, d: 2.6 },
          { cx: 1180, cy: 288, r: 1.8, d: 3.8 },
          { cx: 540, cy: 430, r: 1.5, d: 5 },
          { cx: 1000, cy: 452, r: 1.7, d: 2 },
        ].map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="#FCEECA"
            className="sa-twinkle"
            style={{ animationDelay: `${p.d}s` }}
          />
        ))}

        {/* ══════════ Micro-labels ══════════ */}
        <g style={{ fontFamily: "var(--font-mono), monospace" }}>
          <text x="800" y="612" textAnchor="middle" fill="#C9A96E" fontSize="13" letterSpacing="7" opacity="0.5">
            THE DEG–BHAPKA METHOD
          </text>
          <text x="800" y="636" textAnchor="middle" fill="#8A6D3B" fontSize="10.5" letterSpacing="4.5" opacity="0.5">
            HYDRO-DISTILLED BY HAND · KANNAUJ, UTTAR PRADESH
          </text>

          <text x="1520" y="70" textAnchor="end" fill="#C9A96E" fontSize="11" letterSpacing="4" opacity="0.45">
            EST. 2011
          </text>
          <text x="1520" y="92" textAnchor="end" fill="#8A6D3B" fontSize="9.5" letterSpacing="3" opacity="0.4">
            NO. 001 — THE FIRST ACCORD
          </text>

          <text x="80" y="70" fill="#C9A96E" fontSize="11" letterSpacing="4" opacity="0.45">
            5,000 YEARS OF ATTAR
          </text>
        </g>
      </motion.svg>

      {/* Edge vignette so the artwork melts into the page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 96% 92% at 50% 46%, transparent 40%, rgba(8,8,7,0.55) 78%, #080807 100%)",
        }}
      />
    </div>
  );
}
