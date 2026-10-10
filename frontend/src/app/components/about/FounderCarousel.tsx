import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface SlideItem {
  src: string;
  alt: string;
  position: string;
}

const FOUNDER_SLIDES: SlideItem[] = [
  {
    src: "/1 (2).jpeg",
    alt: "Akanksha Maheshwari - Founder of Avtar Aromas",
    position: "object-center",
  },
  {
    src: "/2 (2).jpeg",
    alt: "Akanksha Maheshwari with Avtar signature bottle",
    position: "object-[center_25%]",
  },
  {
    src: "/3 (2).jpeg",
    alt: "Avtar Aromas delicate fragrance mist",
    position: "object-center",
  },
  {
    src: "/4 (2).jpeg",
    alt: "Akanksha Maheshwari holding signature parfum",
    position: "object-[center_20%]",
  },
  {
    src: "/5 (2).jpeg",
    alt: "The Royal Reflection - Udaipur fine fragrance",
    position: "object-[center_25%]",
  },
  {
    src: "/6 (2).jpeg",
    alt: "Akanksha Maheshwari with The Five Signatures collection",
    position: "object-[center_35%]",
  },
  {
    src: "/7 (2).jpeg",
    alt: "Evaluating the olfactory notes of Rajasthan",
    position: "object-[center_35%]",
  },
];

export default function FounderCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload images into browser cache so slide transitions are instantaneous
  useEffect(() => {
    FOUNDER_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % FOUNDER_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + FOUNDER_SLIDES.length) % FOUNDER_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Autoplay effect - smoothly changes state without triggering any page scrolling or DOM focus
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, handleNext]);

  return (
    <div className="relative group mx-auto max-w-[420px] lg:max-w-none select-none">
      {/* Main Image Frame (fixed aspect-[4/5] prevents any layout shift or viewport jumping) */}
      <div 
        className="relative overflow-hidden aspect-[4/5] bg-[#0A0908] border border-[rgba(201,169,110,0.18)] shadow-2xl"
        aria-live="off"
        aria-roledescription="carousel"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={currentIndex}
            src={FOUNDER_SLIDES[currentIndex].src}
            alt={FOUNDER_SLIDES[currentIndex].alt}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className={`absolute inset-0 w-full h-full object-cover ${FOUNDER_SLIDES[currentIndex].position}`}
            loading="eager"
            draggable={false}
          />
        </AnimatePresence>

        {/* Ambient vignette gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080807]/80 via-transparent to-[#080807]/20 pointer-events-none" />

        {/* Previous / Next Chevron Buttons */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handlePrev();
          }}
          aria-label="Previous image"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#080807]/60 hover:bg-[#080807]/90 text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/50 backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleNext();
          }}
          aria-label="Next image"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#080807]/60 hover:bg-[#080807]/90 text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/50 backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Bottom Carousel Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 flex items-center justify-between z-10 bg-gradient-to-t from-[#080807]/90 via-[#080807]/50 to-transparent">
          {/* Slide dots and counter */}
          <div className="flex items-center gap-2.5">
            <span
              className="text-[10px] sm:text-xs text-primary tracking-widest font-mono"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {String(currentIndex + 1).padStart(2, "0")} / {String(FOUNDER_SLIDES.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5 ml-1">
              {FOUNDER_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    goToSlide(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-primary/30 hover:bg-primary/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Autoplay Play/Pause Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              togglePlayPause();
            }}
            aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
            title={isPlaying ? "Pause autoplay" : "Play autoplay"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080807]/75 hover:bg-[#080807] text-primary border border-primary/30 hover:border-primary/70 backdrop-blur-md transition-all text-[10px] tracking-wider uppercase font-mono shadow-md"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-primary" />
                <span className="hidden sm:inline text-[9px]">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-primary ml-0.5" />
                <span className="hidden sm:inline text-[9px]">Play</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Decorative gold corner accents (preserved from original luxury frame) */}
      <div className="absolute -bottom-3 -right-3 w-16 h-16 border-r border-b border-primary/30 pointer-events-none hidden sm:block" />
      <div className="absolute -top-3 -left-3 w-16 h-16 border-l border-t border-primary/30 pointer-events-none hidden sm:block" />
    </div>
  );
}
