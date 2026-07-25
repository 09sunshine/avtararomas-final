import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronRight, ChevronDown, Package, CheckCircle2, Truck, Clock, XCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { useAuth } from "../../stores/authStore";
import { products } from "../../data/products";

type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Cancelled";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  address: string;
  tracking?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  Delivered:  { icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)",  label: "Delivered" },
  Shipped:    { icon: Truck,        color: "#C9A96E", bg: "rgba(201,169,110,0.08)", label: "Shipped" },
  Processing: { icon: Clock,        color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  label: "Processing" },
  Cancelled:  { icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.08)",   label: "Cancelled" },
};

const TIMELINE: Record<OrderStatus, string[]> = {
  Delivered:  ["Order Placed", "Confirmed", "Dispatched", "Out for Delivery", "Delivered"],
  Shipped:    ["Order Placed", "Confirmed", "Dispatched"],
  Processing: ["Order Placed", "Confirmed"],
  Cancelled:  ["Order Placed", "Cancelled"],
};

const MOCK_ORDERS: Order[] = [
  {
    id: "AVT-8829",
    date: "19 Jul 2025",
    total: 7598,
    status: "Delivered",
    tracking: "BLRDEL99827412",
    address: "42 Regal Apartments, Indiranagar, Bengaluru 560038",
    items: [
      { productId: "1", name: products[0].name, image: products[0].images[0], price: products[0].price, quantity: 1, size: "50ml EDP" },
      { productId: "2", name: products[1].name, image: products[1].images[0], price: products[1].price, quantity: 1, size: "100ml EDP" },
    ],
  },
  {
    id: "AVT-7741",
    date: "05 Jul 2025",
    total: 4999,
    status: "Shipped",
    tracking: "MMBEXP44719302",
    address: "42 Regal Apartments, Indiranagar, Bengaluru 560038",
    items: [
      { productId: "3", name: products[2].name, image: products[2].images[0], price: products[2].price, quantity: 1, size: "30ml Parfum" },
    ],
  },
  {
    id: "AVT-6350",
    date: "21 Jun 2025",
    total: 12597,
    status: "Delivered",
    tracking: "BLRDEL77340199",
    address: "42 Regal Apartments, Indiranagar, Bengaluru 560038",
    items: [
      { productId: "4", name: products[3].name, image: products[3].images[0], price: products[3].price, quantity: 2, size: "50ml EDP" },
      { productId: "5", name: products[4].name, image: products[4].images[0], price: products[4].price, quantity: 1 },
    ],
  },
  {
    id: "AVT-5109",
    date: "08 Jun 2025",
    total: 3799,
    status: "Cancelled",
    address: "42 Regal Apartments, Indiranagar, Bengaluru 560038",
    items: [
      { productId: "5", name: products[5].name, image: products[5].images[0], price: products[5].price, quantity: 1, size: "100ml EDT" },
    ],
  },
];

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const timeline = TIMELINE[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="border border-[rgba(201,169,110,0.12)] bg-[#0A0908] overflow-hidden"
    >
      {/* Order header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 hover:bg-[rgba(201,169,110,0.03)] transition-colors group"
      >
        <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
          <div className="text-left">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Order</p>
            <p className="text-sm text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{order.id}</p>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Date</p>
            <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{order.date}</p>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Items</p>
            <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{order.items.length}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Total</p>
            <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 border"
            style={{ borderColor: `${cfg.color}30`, backgroundColor: cfg.bg }}
          >
            <cfg.icon size={11} strokeWidth={1.5} style={{ color: cfg.color }} />
            <span className="text-[10px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <ChevronDown
            size={15}
            strokeWidth={1.5}
            className={`text-muted-foreground transition-transform duration-400 group-hover:text-foreground ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="border-t border-[rgba(201,169,110,0.08)]"
        >
          <div className="px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 sm:gap-8">
            {/* Items */}
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Items Ordered</p>
              <div className="flex flex-col gap-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-20 overflow-hidden bg-[#141311] flex-shrink-0 border border-[rgba(201,169,110,0.08)]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <p className="text-base text-foreground truncate" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          {item.size}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 mt-6 pt-5 border-t border-[rgba(201,169,110,0.08)] flex-wrap">
                {order.status === "Delivered" && (
                  <button className="flex items-center gap-1.5 text-xs px-5 py-2.5 bg-primary text-[#080807] hover:bg-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>
                    <Package size={12} strokeWidth={1.5} />
                    Reorder
                  </button>
                )}
                {order.status !== "Cancelled" && (
                  <button className="flex items-center gap-1.5 text-xs px-5 py-2.5 border border-[rgba(201,169,110,0.2)] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    Get Invoice
                  </button>
                )}
                {order.status === "Delivered" && (
                  <Link
                    to={`/shop/${products[0].slug}`}
                    className="flex items-center gap-1.5 text-xs px-5 py-2.5 border border-[rgba(201,169,110,0.2)] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    Write a Review
                  </Link>
                )}
              </div>
            </div>

            {/* Right column: tracking + address */}
            <div className="flex flex-col gap-6">
              {/* Timeline */}
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Order Timeline</p>
                <div className="flex flex-col gap-0">
                  {timeline.map((step, i) => {
                    const isLast = i === timeline.length - 1;
                    const isDone = i < timeline.length - (order.status === "Processing" ? 1 : order.status === "Shipped" ? 0 : 0);
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors"
                            style={{
                              borderColor: isLast ? cfg.color : "rgba(201,169,110,0.4)",
                              backgroundColor: isLast ? cfg.color : "transparent",
                            }}
                          />
                          {!isLast && <div className="w-px h-7 bg-[rgba(201,169,110,0.15)] mt-1" />}
                        </div>
                        <p
                          className="text-xs pb-6"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 300,
                            color: isLast ? "var(--foreground)" : "var(--muted-foreground)",
                          }}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking */}
              {order.tracking && order.status !== "Cancelled" && (
                <div className="p-4 border border-[rgba(201,169,110,0.1)]">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Tracking ID</p>
                  <p className="text-sm text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{order.tracking}</p>
                </div>
              )}

              {/* Address */}
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Delivered to</p>
                <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.7 }}>
                  {order.address}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function MyOrders() {
  const authState = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  const filtered = filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-[#080807] pt-20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-10" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-foreground">My Orders</span>
        </nav>

        {/* Header */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Welcome back, {authState.user?.name?.split(" ")[0] || "Guest"}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              My Orders
            </h1>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-primary hover:text-[#E8D5B0] transition-colors border border-primary/30 hover:border-primary/60 px-5 py-3"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            <ShoppingBag size={13} strokeWidth={1.5} />
            Continue Shopping
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0 border-b border-[rgba(201,169,110,0.1)] mb-8 overflow-x-auto scrollbar-hide">
          {(["all", "Delivered", "Shipped", "Processing", "Cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3.5 text-xs tracking-[0.15em] uppercase transition-all duration-300 capitalize border-b-2 -mb-px ${
                filter === f
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {f === "all" ? `All (${MOCK_ORDERS.length})` : f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <Package size={40} strokeWidth={0.8} className="text-muted-foreground" />
            <div>
              <h3 className="text-2xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                No {filter} orders
              </h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                Try a different filter or explore our collection.
              </p>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-2 px-7 py-3.5 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-colors mt-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Shop Now <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
