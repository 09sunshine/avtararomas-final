import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, ArrowRight, CreditCard, MapPin, Package } from "lucide-react";
import { useCart } from "../stores/cartStore";
import { useAuth } from "../stores/authStore";
import { motion } from "motion/react";

type Step = "address" | "shipping" | "payment" | "confirm";

interface AddressForm {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const STEPS: { id: Step; label: string; icon: typeof MapPin }[] = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "shipping", label: "Shipping", icon: Package },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirm", label: "Confirmed", icon: CheckCircle2 },
];

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", description: "5–7 business days", price: 0, note: "Free" },
  { id: "express", label: "Express Delivery", description: "2–3 business days", price: 149, note: "₹149" },
  { id: "overnight", label: "Overnight Delivery", description: "Next business day", price: 349, note: "₹349" },
];

const INDIAN_STATES = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];

export default function Checkout() {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const authState = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [shippingOption, setShippingOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    name: authState.user?.name || "",
    phone: "",
    email: authState.user?.email || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const subtotal = cartState.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const selectedShipping = SHIPPING_OPTIONS.find((o) => o.id === shippingOption)!;
  const total = subtotal + selectedShipping.price;

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleAddressNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("shipping");
  };

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    cartDispatch({ type: "CLEAR" });
    setCurrentStep("confirm");
  };

  const OrderSummary = () => (
    <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-6 sticky top-28 self-start">
      <h3 className="text-base text-foreground mb-6" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
        Order Summary
      </h3>
      <div className="flex flex-col gap-4 mb-6">
        {cartState.items.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            <div className="w-12 h-16 bg-[#141311] overflow-hidden flex-shrink-0">
              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{item.product.name}</p>
              {item.size && <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Size: {item.size}</p>}
              <p className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Qty: {item.quantity}</p>
            </div>
            <p className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-[rgba(201,169,110,0.08)] pt-4 flex flex-col gap-2.5">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Subtotal</span>
          <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Shipping</span>
          <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{selectedShipping.price === 0 ? "Free" : formatPrice(selectedShipping.price)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-[rgba(201,169,110,0.08)]">
          <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>Total</span>
          <span className="text-base text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080807] pt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Logo */}
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.5em] text-primary uppercase mb-1" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>secure checkout</p>
          <p className="text-3xl tracking-[0.12em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>AVTAR AROMAS</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-10 sm:mb-16 gap-0 overflow-x-auto scrollbar-hide px-2">
          {STEPS.map((step, i) => {
            const isComplete = i < stepIndex;
            const isActive = step.id === currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 transition-all duration-400 ${isActive ? "text-primary" : isComplete ? "text-primary/60" : "text-muted-foreground/40"}`}>
                  {isComplete ? (
                    <CheckCircle2 size={14} strokeWidth={1.5} className="text-primary" />
                  ) : (
                    <div className={`w-5 h-5 border flex items-center justify-center text-[10px] transition-colors ${isActive ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground/30"}`} style={{ fontFamily: "var(--font-mono)" }}>
                      {i + 1}
                    </div>
                  )}
                  <span className="text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 h-px mx-1 transition-colors ${i < stepIndex ? "bg-primary/40" : "bg-[rgba(201,169,110,0.15)]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {currentStep === "confirm" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center py-16"
          >
            <div className="w-16 h-16 border border-primary flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={28} strokeWidth={1} className="text-primary" />
            </div>
            <h2 className="text-4xl text-foreground mb-4" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              Order Confirmed
            </h2>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Your fragrances are being carefully packaged. You will receive a confirmation email shortly.
            </p>
            <p className="text-xs text-primary mb-10" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              Order #AVT-{Math.random().toString(36).slice(2, 8).toUpperCase()}
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Continue Shopping <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 sm:gap-12 max-w-5xl mx-auto">
            <div>
              {/* Address step */}
              {currentStep === "address" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl text-foreground mb-8" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                    Delivery Address
                  </h2>
                  <form onSubmit={handleAddressNext} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(["name", "phone"] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                            {field === "name" ? "Full Name" : "Phone"}
                          </label>
                          <input
                            required
                            value={address[field]}
                            onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                            className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Email</label>
                      <input
                        required type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Address Line 1</label>
                      <input
                        required
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        placeholder="House/flat, street name"
                        className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Address Line 2 (optional)</label>
                      <input
                        value={address.line2}
                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                        placeholder="Landmark, area"
                        className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>City</label>
                        <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }} />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>State</label>
                        <select required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full bg-[#080807] border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          <option value="">State</option>
                          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Pincode</label>
                        <input required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                          className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }} />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 flex items-center justify-center gap-2.5 w-full py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      Continue to Shipping <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Shipping step */}
              {currentStep === "shipping" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl text-foreground mb-8" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                    Shipping Method
                  </h2>
                  <div className="flex flex-col gap-3 mb-8">
                    {SHIPPING_OPTIONS.map((opt) => (
                      <label key={opt.id} className={`flex items-center gap-5 p-5 border cursor-pointer transition-all duration-300 ${shippingOption === opt.id ? "border-primary bg-primary/5" : "border-[rgba(201,169,110,0.15)] hover:border-primary/30"}`}>
                        <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${shippingOption === opt.id ? "border-primary" : "border-muted-foreground/30"}`}>
                          {shippingOption === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" className="sr-only" value={opt.id} checked={shippingOption === opt.id} onChange={() => setShippingOption(opt.id)} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{opt.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{opt.description}</p>
                        </div>
                        <p className={`text-sm ${opt.price === 0 ? "text-primary" : "text-foreground"}`} style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{opt.note}</p>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setCurrentStep("address")} className="px-6 py-4 border border-[rgba(201,169,110,0.2)] text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      Back
                    </button>
                    <button onClick={() => setCurrentStep("payment")} className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>
                      Continue to Payment <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Payment step */}
              {currentStep === "payment" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl text-foreground mb-8" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                    Payment Method
                  </h2>
                  <div className="flex flex-col gap-3 mb-8">
                    {[
                      { id: "razorpay" as const, label: "Pay Online", desc: "Cards, UPI, Net Banking, Wallets via Razorpay" },
                      { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when your order arrives" },
                    ].map((opt) => (
                      <label key={opt.id} className={`flex items-center gap-5 p-5 border cursor-pointer transition-all duration-300 ${paymentMethod === opt.id ? "border-primary bg-primary/5" : "border-[rgba(201,169,110,0.15)] hover:border-primary/30"}`}>
                        <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === opt.id ? "border-primary" : "border-muted-foreground/30"}`}>
                          {paymentMethod === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" className="sr-only" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} />
                        <div>
                          <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{opt.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.08)] p-5 mb-8">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Delivering to: {address.line1}, {address.city}, {address.state}</p>
                      <button onClick={() => setCurrentStep("address")} className="text-xs text-primary hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Edit</button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setCurrentStep("shipping")} className="px-6 py-4 border border-[rgba(201,169,110,0.2)] text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                      Back
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 disabled:opacity-60"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                    >
                      {processing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-[#080807]/30 border-t-[#080807] rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Place Order — {formatPrice(total)} <ArrowRight size={14} strokeWidth={1.5} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <OrderSummary />
          </div>
        )}
      </div>
    </div>
  );
}
