import { useState } from "react";
import { Link } from "react-router";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import type { Product } from "../../types";
import { useCart } from "../../stores/cartStore";
import { useWishlist } from "../../stores/wishlistStore";
import { motion } from "motion/react";
import { normalizeImageUrl } from "../../lib/image";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [hovering, setHovering] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { dispatch: cartDispatch } = useCart();
  const { dispatch: wishDispatch, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group flex flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-[#0F0E0D] aspect-[3/4]">
        <Link to={`/shop/${product.slug}`}>
          {/* Main image */}
          <img
            src={normalizeImageUrl(product.images[0])}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${
              hovering ? "scale-108" : "scale-100"
            } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            style={{ transform: hovering ? "scale(1.08)" : "scale(1)" }}
          />
          {!imgLoaded && <div className="absolute inset-0 bg-[#141311] animate-pulse" />}

          {/* Hover second image */}
          {product.images[1] && (
            <img
              src={normalizeImageUrl(product.images[1])}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hovering ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {/* Luxury vignette on hover */}
          <div className={`absolute inset-0 transition-opacity duration-700 ${hovering ? "opacity-100" : "opacity-0"}`}
            style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,8,7,0.4) 100%)" }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discount > 0 && (
            <span
              className="px-2.5 py-1 bg-primary text-[#080807] text-[10px] tracking-[0.15em] uppercase font-medium"
              style={{ fontFamily: "var(--font-body)" }}
            >
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span
              className="px-2.5 py-1 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              New
            </span>
          )}
          {product.stock < 10 && (
            <span
              className="px-2.5 py-1 bg-[#0F0E0D]/80 border border-primary/30 text-primary text-[10px] tracking-[0.12em] uppercase"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
            >
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => wishDispatch({ type: "TOGGLE", product })}
          className={`absolute top-4 right-4 p-2.5 border transition-all duration-400 ${
            wishlisted
              ? "border-primary bg-primary text-[#080807] opacity-100"
              : "border-[rgba(201,169,110,0.3)] bg-[#080807]/60 text-[#D9D2C7] opacity-0 group-hover:opacity-100"
          }`}
          aria-label="Wishlist"
        >
          <Heart size={14} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick actions on hover */}
        <motion.div
          initial={false}
          animate={{ y: hovering ? 0 : 20, opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute bottom-0 left-0 right-0 flex"
        >
          <button
            onClick={() => cartDispatch({ type: "ADD", product })}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#080807]/85 backdrop-blur-sm text-primary hover:bg-primary hover:text-[#080807] transition-all duration-400 text-xs tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            <ShoppingBag size={13} strokeWidth={1.5} />
            Add to Cart
          </button>
          <Link
            to={`/shop/${product.slug}`}
            className="p-4 bg-[#080807]/60 backdrop-blur-sm text-[#D9D2C7] hover:text-primary hover:bg-[#080807]/85 transition-all duration-400 border-l border-[rgba(201,169,110,0.15)]"
          >
            <Eye size={14} strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>

      {/* Info */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-primary"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            {product.subcategory}
          </p>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-primary text-primary" />
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              {product.rating}
            </span>
          </div>
        </div>

        <Link to={`/shop/${product.slug}`}>
          <h3
            className="text-lg text-foreground hover:text-primary transition-colors duration-400"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, lineHeight: 1.2 }}
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-sm font-medium text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.sizes && (
          <div className="flex items-center gap-1.5 mt-1">
            {product.sizes.map((size) => (
              <span key={size} className="text-[9px] px-2 py-0.5 border border-[rgba(201,169,110,0.15)] text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
