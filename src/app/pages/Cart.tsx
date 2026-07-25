import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Minus, Plus, Trash2, Gift, Tag, ArrowRight, ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "../stores/cartStore";

const VALID_COUPONS: Record<string, number> = {
  AVTAR10: 10,
  LUXURY15: 15,
  WELCOME20: 20,
};

export default function Cart() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const giftWrapFee = giftWrap ? 199 : 0;
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discount) / 100) : 0;
  const shipping = subtotal >= 999 ? 0 : 149;
  const total = subtotal - discountAmount + giftWrapFee + shipping;

  const applyCoupon = () => {
    const upper = couponCode.toUpperCase().trim();
    if (VALID_COUPONS[upper]) {
      setAppliedCoupon({ code: upper, discount: VALID_COUPONS[upper] });
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#080807] pt-20 flex flex-col items-center justify-center gap-10 px-8">
        <div className="text-center">
          <ShoppingBag size={48} strokeWidth={0.8} className="text-muted-foreground mx-auto mb-6" />
          <h2 className="text-4xl text-foreground mb-3" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Your bag is empty
          </h2>
          <p className="text-sm text-muted-foreground mb-10" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Discover our collection of rare, handcrafted fragrances.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Explore Collection <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080807] pt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-10" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-foreground">Bag</span>
        </nav>

        <div className="flex items-baseline gap-4 mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            Your Bag
          </h1>
          <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            {state.items.length} {state.items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 sm:gap-12">
          {/* Items */}
          <div className="flex flex-col gap-0 border-t border-[rgba(201,169,110,0.1)]">
            {state.items.map((item, i) => {
              const { product, quantity, size } = item;
              return (
                <motion.div
                  key={`${product.id}-${size ?? "default"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="flex gap-4 sm:gap-6 py-6 sm:py-8 border-b border-[rgba(201,169,110,0.08)]"
                >
                  <Link to={`/shop/${product.slug}`} className="flex-shrink-0">
                    <div className="w-20 h-28 sm:w-24 sm:h-32 overflow-hidden bg-[#0A0908]">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  </Link>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      {product.subcategory}
                    </p>
                    <Link to={`/shop/${product.slug}`}>
                      <h3 className="text-base sm:text-xl text-foreground hover:text-primary transition-colors truncate" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                        {product.name}
                      </h3>
                    </Link>
                    {size && (
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Size: {size}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <div className="flex items-center border border-[rgba(201,169,110,0.2)]">
                        <button
                          onClick={() => dispatch({ type: "UPDATE_QTY", productId: product.id, quantity: quantity - 1 })}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus size={11} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{quantity}</span>
                        <button
                          onClick={() => dispatch({ type: "UPDATE_QTY", productId: product.id, quantity: quantity + 1 })}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={quantity >= product.stock}
                        >
                          <Plus size={11} strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => dispatch({ type: "REMOVE", productId: product.id, size })}
                          className="text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Gift wrap */}
            <div className="py-8 border-b border-[rgba(201,169,110,0.08)]">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setGiftWrap(!giftWrap)}
                  className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all duration-300 ${giftWrap ? "border-primary bg-primary/20" : "border-[rgba(201,169,110,0.3)]"}`}
                >
                  {giftWrap && <span className="text-primary text-[8px]">✓</span>}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Gift size={15} strokeWidth={1.5} className="text-primary" />
                    <div>
                      <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Luxury Gift Wrapping</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                        Signature box, ribbon & handwritten note — {formatPrice(199)}
                      </p>
                    </div>
                  </div>
                  {giftWrap && (
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Add a personal message (optional)..."
                      rows={2}
                      className="mt-4 w-full bg-transparent border border-[rgba(201,169,110,0.15)] focus:border-primary/40 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none resize-none"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="sticky top-28 self-start">
            <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-8">
              <h2 className="text-xl text-foreground mb-8" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                Order Summary
              </h2>

              <div className="mb-7">
                <div className="flex gap-0">
                  <div className="relative flex-1">
                    <Tag size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                      placeholder="Coupon code"
                      className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] border-r-0 pl-9 pr-3 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors uppercase"
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="px-5 py-3 border border-[rgba(201,169,110,0.2)] text-xs text-primary hover:bg-primary/10 transition-colors"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-400 mt-2" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-primary mt-2" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    ✓ {appliedCoupon.code} — {appliedCoupon.discount}% off applied
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3.5 border-t border-[rgba(201,169,110,0.08)] pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Subtotal</span>
                  <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Discount ({appliedCoupon?.discount}%)</span>
                    <span className="text-xs text-green-400" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {giftWrap && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Gift Wrap</span>
                    <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(giftWrapFee)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Shipping</span>
                  <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                {subtotal < 999 && (
                  <p className="text-[10px] text-muted-foreground/60" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    Add {formatPrice(999 - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-[rgba(201,169,110,0.1)] mt-5 pt-5 flex items-center justify-between mb-7">
                <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>Total</span>
                <span className="text-xl text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(total)}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400"
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              >
                Proceed to Checkout <ArrowRight size={14} strokeWidth={1.5} />
              </button>

              <Link to="/shop" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
