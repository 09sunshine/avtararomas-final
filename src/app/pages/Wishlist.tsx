import { Link } from "react-router";
import { Heart, ShoppingBag, X } from "lucide-react";
import { motion } from "motion/react";
import { useWishlist } from "../stores/wishlistStore";
import { useCart } from "../stores/cartStore";

export default function Wishlist() {
  const { state, dispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080807] pt-20 flex flex-col items-center justify-center gap-8 px-8">
        <Heart size={48} strokeWidth={0.8} className="text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-4xl text-foreground mb-3" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Your wishlist is empty
          </h2>
          <p className="text-sm text-muted-foreground mb-8" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Save your favourite fragrances here to revisit later.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Discover Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080807] pt-20">
      <div className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="flex items-baseline gap-4 mb-14">
          <h1 className="text-5xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Your Wishlist
          </h1>
          <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            {state.items.length} {state.items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {state.items.map((product, i) => {
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group flex flex-col"
              >
                <div className="relative overflow-hidden bg-[#0A0908] aspect-[3/4]">
                  <Link to={`/shop/${product.slug}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <button
                    onClick={() => dispatch({ type: "REMOVE", productId: product.id })}
                    className="absolute top-4 right-4 p-2 border border-[rgba(201,169,110,0.3)] bg-[#080807]/70 text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-all"
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                    <button
                      onClick={() => cartDispatch({ type: "ADD", product })}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-[#080807] text-xs tracking-[0.2em] uppercase hover:bg-[#E8D5B0] transition-colors"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      <ShoppingBag size={13} strokeWidth={1.5} />
                      Add to Bag
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{product.subcategory}</p>
                  <Link to={`/shop/${product.slug}`}>
                    <h3 className="text-lg text-foreground hover:text-primary transition-colors" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
