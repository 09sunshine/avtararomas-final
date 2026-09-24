import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Star, Heart, ShoppingBag, ChevronRight, ChevronLeft, Minus, Plus, Truck, Shield, RotateCcw, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { fetchProducts, fetchProductReviews, createReview } from "../lib/api";
import { testimonials } from "../data/products";
import ProductCard from "../components/ui/ProductCard";
import { useCart } from "../stores/cartStore";
import { useWishlist } from "../stores/wishlistStore";
import { useAuth } from "../stores/authStore";
import { normalizeImageUrl } from "../lib/image";

interface ReviewCard {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"description" | "ingredients" | "reviews">("description");
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const { dispatch: cartDispatch } = useCart();
  const { dispatch: wishDispatch, isWishlisted } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [backendReviews, setBackendReviews] = useState<ReviewCard[]>([]);
  const activeRef = useRef(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProducts().then((data) => {
      if (active) {
        setAllProducts(data || []);
        const found = (data || []).find((p: any) => p.slug === slug);
        if (found) {
          setProduct(found);
          setSelectedSize(found.sizes?.[1] || found.sizes?.[0] || null);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { activeRef.current = false; };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    let active = true;

    const loadReviews = async () => {
      try {
        const reviews = await fetchProductReviews(product.id, product.slug);
        if (!active) return;
        setBackendReviews(
          reviews.map((review) => ({
            id: review.id,
            name: review.user.name,
            location: "Verified Purchase",
            rating: review.rating,
            text: review.comment,
          }))
        );
      } catch {
        if (active) setBackendReviews([]);
      }
    };

    loadReviews();
    setReviewSubmitted(false);
    setReviewError(null);

    return () => {
      active = false;
    };
  }, [product?.id, product?.slug]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080807] pt-24 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080807] pt-24 flex flex-col items-center justify-center gap-6">
        <p className="text-6xl" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "#C9A96E" }}>404</p>
        <h2 className="text-2xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 300 }}>Fragrance not found</h2>
        <Link to="/shop" className="text-primary text-sm hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          ← Return to Collection
        </Link>
      </div>
    );
  }

  const matchSubcat = allProducts.filter((p: any) => p.id !== product.id && p.subcategory && p.subcategory === product.subcategory);
  const matchCat = allProducts.filter((p: any) => p.id !== product.id && p.category === product.category && !matchSubcat.some((m: any) => m.id === p.id));
  const otherProds = allProducts.filter((p: any) => p.id !== product.id && !matchSubcat.some((m: any) => m.id === p.id) && !matchCat.some((m: any) => m.id === p.id));
  const related = [...matchSubcat, ...matchCat, ...otherProds].slice(0, 4);
  const wishlisted = isWishlisted(product.id);
  const originalPrice = product.original_price ?? product.originalPrice;
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;
  const formatPrice = (p: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);
  const reviewCount = backendReviews.length;
  const rating = reviewCount > 0
    ? Number((backendReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviewCount).toFixed(1))
    : (typeof product.rating === 'number' && product.rating > 0 ? product.rating : 0);
  const stock = typeof product.stock === 'number' ? product.stock : 0;

  const handleAddToCart = () => {
    cartDispatch({ type: "ADD", product, quantity, size: selectedSize || undefined });
    navigate("/cart");
  };

  const parseNotes = (s?: string | null) => s ? s.split(",").map((n) => n.trim()).filter(Boolean) : [];
  const NOTES = {
    top: parseNotes(product.top_notes ?? product.topNotes).length > 0 ? parseNotes(product.top_notes ?? product.topNotes) : ["Saffron", "Bergamot", "Pink Pepper"],
    heart: parseNotes(product.heart_notes ?? product.heartNotes).length > 0 ? parseNotes(product.heart_notes ?? product.heartNotes) : ["Bulgarian Rose", "Oud", "Jasmine"],
    base: parseNotes(product.base_notes ?? product.baseNotes).length > 0 ? parseNotes(product.base_notes ?? product.baseNotes) : ["Amber", "Sandalwood", "White Musk"],
  };

  return (
    <div className="min-h-screen bg-[#080807] pt-20">
      {/* Back + Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors self-start group"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-primary transition-colors">Collection</Link>
          <ChevronRight size={10} />
          <span className="text-foreground truncate max-w-48">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 mb-16 sm:mb-24">
          {/* Gallery */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 self-start">
            {/* Main image + zoom lens */}
            <div className="relative">
              <div
                ref={imgContainerRef}
                className="relative overflow-hidden bg-[#0A0908] aspect-[3/4] cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {product.images && product.images.length > 0 ? (
                  <>
                    <motion.img
                      key={activeImg}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      src={normalizeImageUrl(product.images[activeImg])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Lens square overlay */}
                    {isZooming && (
                      <div
                        className="pointer-events-none absolute border border-primary/60 bg-white/10 backdrop-blur-[1px]"
                        style={{
                          width: 120,
                          height: 120,
                          left: `calc(${zoomPos.x}% - 60px)`,
                          top: `calc(${zoomPos.y}% - 60px)`,
                          boxShadow: "0 0 0 1px rgba(201,169,110,0.3), inset 0 0 0 1px rgba(201,169,110,0.15)",
                        }}
                      />
                    )}

                    {/* Prev / Next arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-[rgba(201,169,110,0.3)] bg-[#080807]/70 backdrop-blur-sm text-primary hover:bg-primary hover:text-[#080807] transition-all duration-300 opacity-0 hover:opacity-100"
                          style={{ zIndex: 10 }}
                        >
                          <ChevronLeft size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-[rgba(201,169,110,0.3)] bg-[#080807]/70 backdrop-blur-sm text-primary hover:bg-primary hover:text-[#080807] transition-all duration-300 opacity-0 hover:opacity-100"
                          style={{ zIndex: 10 }}
                        >
                          <ChevronRight size={16} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                    {/* Image counter */}
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-[#080807]/75 backdrop-blur-sm border border-[rgba(201,169,110,0.2)]" style={{ zIndex: 5 }}>
                      <span className="text-[10px] tracking-[0.2em]" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, color: "#C9A96E" }}>
                        {activeImg + 1} / {product.images.length}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="absolute top-5 left-5 px-3 py-1.5 bg-primary text-[#080807] text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)", zIndex: 5 }}>
                        -{discount}% Off
                      </div>
                    )}
                    {stock > 0 && stock < 10 && (
                      <div className="absolute bottom-4 left-5 px-3 py-1.5 border border-primary/40 bg-[#080807]/80 text-primary text-[10px] tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, zIndex: 5 }}>
                        Only {stock} left
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>

              {/* Zoom panel — floats to the right of the gallery column */}
              {isZooming && product.images && product.images.length > 0 && (
                <div
                  className="absolute top-0 left-[calc(100%+20px)] w-[420px] aspect-[3/4] overflow-hidden border border-[rgba(201,169,110,0.25)] bg-[#0A0908] shadow-2xl pointer-events-none hidden xl:block"
                  style={{ zIndex: 50 }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${product.images[activeImg]})`,
                      backgroundSize: "400%",
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundRepeat: "no-repeat",
                      transition: "background-position 0.05s linear",
                    }}
                  />
                  {/* Corner ornaments */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-primary/40 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/40 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/40 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-primary/40 pointer-events-none" />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <span className="px-3 py-1 bg-[#080807]/80 text-[9px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      4× zoom
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal thumbnail scroller */}
            {product.images && product.images.length > 0 && (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative flex-shrink-0 w-[72px] h-[90px] overflow-hidden border-2 transition-all duration-300 ${activeImg === i
                        ? "border-primary scale-[1.04]"
                        : "border-transparent hover:border-primary/40"
                        }`}
                    >
                      <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                      {activeImg === i && (
                        <div className="absolute inset-0 ring-1 ring-inset ring-primary/60" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Fade edges if more than 5 images */}
                {product.images.length > 5 && (
                  <div className="absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[#080807] to-transparent pointer-events-none" />
                )}
              </div>
            )}

            {/* Dot indicators */}
            {product.images && product.images.length > 0 && (
              <div className="flex items-center justify-center gap-2">
                {product.images.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`transition-all duration-300 rounded-full ${activeImg === i ? "w-6 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-[rgba(201,169,110,0.25)] hover:bg-primary/50"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              {/* Category & rating */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] tracking-[0.4em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  {product.subcategory || "Fragrance"} · {product.category || "Eau de Parfum"}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted-foreground/20 text-muted-foreground/20"} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    {rating} ({reviewCount})
                  </span>
                </div>
              </div>

              {/* Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-foreground mb-5 leading-[1.05]" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-4 pb-6 border-b border-[rgba(201,169,110,0.1)]">
                <span className="text-2xl text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                  {formatPrice(product.price || 0)}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-xs px-2 py-1 border border-primary/30 text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Brief description */}
              <p className="text-sm text-[#9A9388] leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
                {product.description ? product.description.slice(0, 180) + "..." : "A luxurious fragrance crafted with the finest ingredients."}
              </p>

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      Size — {selectedSize || product.sizes[0]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2.5 text-xs border transition-all duration-300 ${selectedSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-[rgba(201,169,110,0.2)] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + CTA */}
              <div className="flex gap-3 mt-6">
                <div className="flex items-center border border-[rgba(201,169,110,0.2)]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Minus size={13} strokeWidth={1.5} />
                  </button>
                  <span className="w-10 text-center text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(stock || 1, quantity + 1))} className="p-3.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Plus size={13} strokeWidth={1.5} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 group"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  Add to Bag
                </button>

                <button
                  onClick={() => wishDispatch({ type: "TOGGLE", product })}
                  className={`p-3.5 border transition-all duration-400 ${wishlisted ? "border-primary bg-primary/10 text-primary" : "border-[rgba(201,169,110,0.2)] text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
                >
                  <Heart size={16} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 pt-6 border-t border-[rgba(201,169,110,0.08)]">
                {[
                  { icon: Truck, text: "Free delivery ₹999+" },
                  { icon: Shield, text: "Authentic & sealed" },
                  { icon: RotateCcw, text: "No returns" },
                ].map((item) => (
                  <div key={item.text} className="flex flex-col items-center gap-2 text-center">
                    <item.icon size={16} strokeWidth={1} className="text-primary" />
                    <p className="text-[10px] text-muted-foreground leading-tight" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 border border-[rgba(201,169,110,0.12)] text-[10px] text-muted-foreground tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fragrance Notes */}
        <div className="border-y border-[rgba(201,169,110,0.1)] py-10 sm:py-16 mb-10 sm:mb-16">
          <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-10 text-center" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Fragrance Notes</p>
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {Object.entries(NOTES).map(([layer, notes]) => (
              <div key={layer} className="text-center">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{layer}</p>
                {notes.map((note) => (
                  <p key={note} className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{note}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10 sm:mb-16">
          <div className="flex justify-start sm:justify-center border-b border-[rgba(201,169,110,0.1)] mb-10 overflow-x-auto scrollbar-hide">
            {(["description", "ingredients", "reviews"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 px-4 sm:px-8 py-4 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-400 capitalize whitespace-nowrap ${tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                {t === "reviews" ? `Reviews (${reviewCount})` : t}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            {tab === "description" && (
              <div>
                <p className="text-base text-[#9A9388] leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>{product.description || "A luxurious fragrance crafted with the finest ingredients."}</p>
                <ul className="flex flex-col gap-3">
                  {["Handcrafted in small batches", "Free from synthetic musks and fixatives", "Covered by brand quality guarantee", "Ships in luxury gift packaging"].map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-[#9A9388]" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      <span className="text-primary text-xs">✦</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "ingredients" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-px bg-[rgba(201,169,110,0.08)]">
                  {[
                    ["Concentration", product.concentration || product.category || "Eau de Parfum"],
                    ["Origin", product.origin || "Handcrafted in India"],
                    ["Top Notes", NOTES.top.join(", ")],
                    ["Heart Notes", NOTES.heart.join(", ")],
                    ["Base Notes", NOTES.base.join(", ")],
                    ["Longevity", product.longevity || "12–18 hours"],
                    ["Sillage", product.sillage || "Moderate to Strong"],
                    ["Season", product.season || "All seasons"],
                  ].map(([key, val]) => (
                    <div key={key} className="bg-[#0A0908] px-6 py-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{key}</p>
                      <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{val}</p>
                    </div>
                  ))}
                </div>
                {(product.ingredients) && (
                  <div className="border-t border-[rgba(201,169,110,0.1)] pt-6">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      Full Ingredients
                    </p>
                    <p className="text-sm text-[#9A9388] leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.9 }}>
                      {product.ingredients}
                    </p>
                  </div>
                )}
              </div>
            )}

            {tab === "reviews" && (
              <div className="flex flex-col gap-8">
                {/* Existing reviews from database */}
                {backendReviews.length > 0 ? (
                  backendReviews.map((r: any) => (
                    <div key={r.id} className="pb-8 border-b border-[rgba(201,169,110,0.08)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 border border-primary/25 flex items-center justify-center text-primary text-sm font-semibold uppercase" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                            {r.name ? r.name.charAt(0) : "U"}
                          </div>
                          <div>
                            <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{r.name}</p>
                            <p className="text-[10px] text-muted-foreground tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{r.location || "Verified Purchase"}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < (r.rating ?? 5) ? "fill-primary text-primary" : "fill-transparent text-primary/30"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#9A9388] leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.8 }}>
                        &ldquo;{r.text}&rdquo;
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center border border-[rgba(201,169,110,0.1)] bg-[#0A0908] px-4">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      No reviews yet for this fragrance. Be the first to share your experience!
                    </p>
                  </div>
                )}

                {/* Write a review */}
                <div className="pt-4 border-t border-[rgba(201,169,110,0.12)]">
                  <h4 className="text-lg text-foreground mb-6" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                    Write a Review
                  </h4>

                  {!isAuthenticated ? (
                    /* Not logged in — prompt */
                    <div className="border border-[rgba(201,169,110,0.15)] bg-[#0A0908] px-6 py-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                      <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary shrink-0">
                        <Star size={16} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          Share your experience with this fragrance
                        </p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          You need to be signed in to leave a review.
                        </p>
                      </div>
                      <Link
                        to="/login"
                        className="shrink-0 px-6 py-3 bg-primary text-[#080807] text-xs tracking-[0.2em] uppercase hover:bg-[#E8D5B0] transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                      >
                        Sign In to Review
                      </Link>
                    </div>
                  ) : reviewSubmitted ? (
                    /* Success state */
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-[rgba(201,169,110,0.2)] bg-[#0A0908] px-6 py-8 flex items-center gap-4"
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className="fill-primary text-primary" />)}
                      </div>
                      <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                        Thank you, {user?.name?.split(" ")[0]}. Your review has been posted.
                      </p>
                    </motion.div>
                  ) : (
                    /* Review form */
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setReviewError(null);

                        if (!reviewRating) {
                          setReviewError("Please select a star rating.");
                          return;
                        }

                        if (!reviewText.trim()) {
                          setReviewError("Please write your review comment.");
                          return;
                        }

                        if (reviewText.trim().length < 3) {
                          setReviewError("Review comment must be at least 3 characters long.");
                          return;
                        }

                        if (!user) {
                          setReviewError("You must be logged in to post a review.");
                          return;
                        }

                        try {
                          const review = await createReview({
                            customer: {
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              avatar: user.avatar,
                            },
                            product: {
                              id: product.id,
                              slug: product.slug,
                              name: product.name,
                            },
                            rating: reviewRating,
                            comment: reviewText.trim(),
                          });

                          setBackendReviews((prev) => [
                            {
                              id: review.id,
                              name: review.user.name,
                              location: "Verified Purchase",
                              rating: review.rating,
                              text: review.comment,
                            },
                            ...prev.filter((item: any) => item.id !== review.id),
                          ]);

                          window.dispatchEvent(new Event("products-updated"));

                          setReviewSubmitted(true);
                          setReviewRating(0);
                          setReviewHover(0);
                          setReviewText("");
                        } catch (error) {
                          setReviewError(error instanceof Error ? error.message : "Failed to post review");
                        }
                      }}
                      className="flex flex-col gap-6"
                    >
                      {/* Star rating picker */}
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          Your Rating
                        </p>
                        <div className="flex gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const val = i + 1;
                            const filled = val <= (reviewHover || reviewRating);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setReviewRating(val)}
                                onMouseEnter={() => setReviewHover(val)}
                                onMouseLeave={() => setReviewHover(0)}
                                className="p-1 transition-transform duration-150 hover:scale-110"
                                aria-label={`Rate ${val} star${val > 1 ? "s" : ""}`}
                              >
                                <Star
                                  size={22}
                                  strokeWidth={1.2}
                                  className={filled ? "fill-primary text-primary" : "fill-transparent text-primary/30"}
                                />
                              </button>
                            );
                          })}
                          {reviewRating > 0 && (
                            <span className="ml-2 self-center text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                              {["", "Poor", "Fair", "Good", "Great", "Excellent"][reviewRating]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Text area */}
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          Your Review
                        </p>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          placeholder="Describe the scent, longevity, sillage — what makes it yours..."
                          required
                          className="w-full bg-[#0A0908] border border-[rgba(201,169,110,0.15)] focus:border-primary/50 outline-none px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/30 resize-none transition-colors duration-300"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.8 }}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-right" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          {reviewText.length}/500
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={!reviewRating || !reviewText.trim()}
                        className="self-start flex items-center gap-2 px-7 py-3.5 bg-primary text-[#080807] text-xs tracking-[0.2em] uppercase hover:bg-[#E8D5B0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                      >
                        <Send size={12} strokeWidth={1.5} />
                        Post Review
                      </button>
                      {reviewError && (
                        <p className="text-xs text-red-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          {reviewError}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pt-16 border-t border-[rgba(201,169,110,0.1)]">
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                You May Also Love
              </h2>
              <Link to="/shop" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary hover:gap-4 transition-all duration-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                Full Collection <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}