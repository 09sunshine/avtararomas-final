import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../../stores/authStore";
import { useCart } from "../../stores/cartStore";
import {
  fetchUserOrders,
  retryOrderPayment,
  verifyPayment,
  markPaymentFailed,
  updateOrderStatus,
  cancelAndRefundOrder,
  syncRefundStatus,
  type ApiOrder,
} from "../../lib/api";
import { generateAndDownloadInvoice } from "../../lib/invoice";
import { type Product } from "../../types";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// @ts-ignore - Vite env types

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
  dbId: string;
  date: string;
  createdAt?: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod?: string | null;
  transactionId?: string | null;
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

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  successful:        { label: "Paid", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  refund_initiated:  { label: "Refund Initiated", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  refund_processing: { label: "Refund In Process", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  refunded:          { label: "Refunded to Source", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  refund_failed:     { label: "Refund Failed", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  failed:            { label: "Payment Failed", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  pending:           { label: "Payment Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  cod:               { label: "Cash on Delivery", color: "#C9A96E", bg: "rgba(201,169,110,0.08)" },
};

const TIMELINE: Record<OrderStatus, string[]> = {
  Delivered:  ["Order Placed", "Confirmed", "Dispatched", "Out for Delivery", "Delivered"],
  Shipped:    ["Order Placed", "Confirmed", "Dispatched"],
  Processing: ["Order Placed", "Confirmed"],
  Cancelled:  ["Order Placed", "Cancelled"],
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

function mapStatus(status: ApiOrder["status"]): OrderStatus {
  switch (status) {
    case "delivered": return "Delivered";
    case "shipped": return "Shipped";
    case "cancelled": return "Cancelled";
    default: return "Processing";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function mapOrder(order: ApiOrder): Order {
  return {
    id: order.orderNumber,
    dbId: order.id,
    date: formatDate(order.createdAt),
    createdAt: order.createdAt,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    status: mapStatus(order.status),
    paymentStatus: order.paymentStatus || "pending",
    paymentMethod: order.paymentMethod,
    transactionId: order.razorpayPaymentId,
    tracking: order.trackingNumber || undefined,
    address: `${order.address.name}, ${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}, ${order.address.city} ${order.address.pincode}`,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      image: item.productImage || "",
      price: item.price,
      quantity: item.quantity,
      size: item.size,
    })),
  };
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function OrderCard({
  order,
  index,
  onRefresh,
}: {
  order: Order;
  index: number;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [syncingRefund, setSyncingRefund] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const { dispatch: cartDispatch } = useCart();
  const authState = useAuth();
  const navigate = useNavigate();

  // Check 8 hour limit for cancellation
  const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const now = Date.now();
  const hoursSinceOrder = !isNaN(orderTime) ? (now - orderTime) / (1000 * 60 * 60) : 999;
  const isWithin8Hours = hoursSinceOrder <= 8;
  const canUserCancel = order.status !== "Cancelled" && order.status !== "Shipped" && order.status !== "Delivered" && isWithin8Hours;

  const handleCancelOrder = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCancelLoading(true);
    try {
      const res = await cancelAndRefundOrder(order.dbId);
      toast.success(res.message || `Order #${order.id} has been cancelled.`);
      setShowCancelConfirm(false);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSyncRefundStatus = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSyncingRefund(true);
    try {
      const res = await syncRefundStatus(order.dbId);
      const updatedPayStatus = res.order.paymentStatus;
      const label = (PAYMENT_STATUS_CONFIG[updatedPayStatus || ""] || {}).label || updatedPayStatus;
      toast.success(`Refund status checked with Razorpay: ${label}`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sync refund status");
    } finally {
      setSyncingRefund(false);
    }
  };

  const cfg = STATUS_CONFIG[order.status];
  const payCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
  const timeline = TIMELINE[order.status];

  const canRetryPayment =
    order.paymentStatus === "failed" ||
    (order.paymentStatus === "pending" && order.paymentMethod?.toLowerCase() === "razorpay");

  const handleGetInvoice = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGeneratingInvoice(true);
    try {
      const result = await generateAndDownloadInvoice(order);
      if (result.success) {
        toast.success("Invoice downloaded successfully!");
      } else {
        toast.error("Failed to generate invoice. Please try again.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleReorder = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    order.items.forEach((item) => {
      const product: Product = {
        id: item.productId,
        name: item.name,
        slug: item.productId,
        price: item.price,
        category: "Perfume",
        images: [item.image || ""],
        description: "",
        rating: 5,
        reviewCount: 0,
        stock: 10,
        tags: [],
      };
      cartDispatch({
        type: "ADD",
        product,
        quantity: item.quantity,
        size: item.size,
      });
    });
    toast.success(`Readded ${order.items.length} item${order.items.length > 1 ? "s" : ""} to your cart!`);
    navigate("/cart");
  };

  const handleRetryPayment = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRetryLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || typeof window === "undefined" || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Please check your network connection.");
        setRetryLoading(false);
        return;
      }

      const res = await retryOrderPayment(order.dbId);

      const options = {
        key: res.razorpayKeyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: res.razorpayAmount || Math.round(order.total * 100),
        currency: res.currency || "INR",
        name: "AVTAR AROMAS",
        description: `Retry Payment for Order #${order.id}`,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150",
        order_id: res.razorpayOrderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setRetryLoading(true);
            const verification = await verifyPayment({
              orderId: order.dbId,
              razorpayOrderId: response.razorpay_order_id || res.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_retry_${Math.random().toString(36).slice(2, 10)}`,
              razorpaySignature: response.razorpay_signature || "mock_sig",
            });

            if (verification.success) {
              toast.success("Payment successful! Your order has been updated.");
              onRefresh();
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to verify payment");
          } finally {
            setRetryLoading(false);
          }
        },
        modal: {
          ondismiss: async function () {
            setRetryLoading(false);
            toast.info("Payment popup closed.");
            await markPaymentFailed({ orderId: order.dbId, error: "Retry modal closed" });
          },
        },
        prefill: {
          name: res.customer.name || authState.user?.name || "",
          email: res.customer.email || authState.user?.email || "",
          contact: res.customer.phone || "",
        },
        theme: {
          color: "#C9A96E",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response: any) {
        setRetryLoading(false);
        const failDesc = response.error?.description || "Payment retry failed";
        toast.error(`Payment Failed: ${failDesc}`);
        await markPaymentFailed({ orderId: order.dbId, error: failDesc });
      });
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment retry");
      setRetryLoading(false);
    }
  };

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
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 hover:bg-[rgba(201,169,110,0.03)] transition-colors group cursor-pointer"
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

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Retry Payment Header Button */}
          {canRetryPayment && (
            <button
              type="button"
              onClick={handleRetryPayment}
              disabled={retryLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors text-[10px] tracking-[0.15em] uppercase font-mono font-medium cursor-pointer shadow-sm"
            >
              {retryLoading ? <RefreshCw size={11} className="animate-spin" /> : <CreditCard size={11} />}
              Retry Payment
            </button>
          )}

          {/* Payment Status Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 border text-[10px] uppercase"
            style={{ borderColor: `${payCfg.color}40`, backgroundColor: payCfg.bg, color: payCfg.color, fontFamily: "var(--font-mono)", fontWeight: 300 }}
          >
            {payCfg.label}
          </div>

          {/* Order Status badge */}
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

              {/* Payment Details info banner */}
              <div className="mt-6 p-4 border border-[rgba(201,169,110,0.12)] bg-[#050504] flex flex-col gap-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  Payment Information
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                  <span>Method: <strong className="text-foreground uppercase">{order.paymentMethod || "Online"}</strong></span>
                  <span>Status: <strong style={{ color: payCfg.color }}>{payCfg.label}</strong></span>
                </div>
                {order.transactionId && (
                  <p className="text-xs text-muted-foreground pt-1 border-t border-[rgba(201,169,110,0.08)]" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    Transaction ID: <span className="text-primary">{order.transactionId}</span>
                  </p>
                )}
                {canRetryPayment && (
                  <div className="pt-2.5 border-t border-[rgba(239,68,68,0.2)] flex items-center justify-between flex-wrap gap-3">
                    <span className="text-xs text-red-400 font-mono">Payment is incomplete or failed.</span>
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      disabled={retryLoading}
                      className="flex items-center gap-1.5 text-xs px-4 py-2 bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors cursor-pointer"
                    >
                      {retryLoading ? <RefreshCw size={12} className="animate-spin" /> : <CreditCard size={12} />}
                      Retry Payment via Razorpay
                    </button>
                  </div>
                )}
              </div>

              {/* Multi-Stage Refund Progress Stepper */}
              {(order.paymentStatus?.startsWith("refund") || order.paymentStatus === "refunded") && (
                <div className="mt-6 p-4 border border-[rgba(201,169,110,0.15)] bg-[#050504]">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-mono">
                      Refund Status Tracker
                    </p>
                    <button
                      type="button"
                      onClick={handleSyncRefundStatus}
                      disabled={syncingRefund}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1 border border-primary/40 text-primary hover:bg-primary/10 transition-all font-mono cursor-pointer"
                    >
                      <RefreshCw size={11} className={syncingRefund ? "animate-spin" : ""} />
                      Check Status with Razorpay
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center pt-2 pb-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500 text-red-400 flex items-center justify-center text-xs font-mono">✓</div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">1. Cancelled</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border ${
                        order.paymentStatus === "refund_initiated" || order.paymentStatus === "refund_processing" || order.paymentStatus === "refunded"
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "bg-neutral-900 border-neutral-800 text-muted-foreground"
                      }`}>
                        {order.paymentStatus === "refund_initiated" ? "•" : "✓"}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">2. Initiated</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border ${
                        order.paymentStatus === "refund_processing" || order.paymentStatus === "refunded"
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-neutral-900 border-neutral-800 text-muted-foreground"
                      }`}>
                        {order.paymentStatus === "refund_processing" ? "•" : order.paymentStatus === "refunded" ? "✓" : "3"}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">3. In Process</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border ${
                        order.paymentStatus === "refunded"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "bg-neutral-900 border-neutral-800 text-muted-foreground"
                      }`}>
                        {order.paymentStatus === "refunded" ? "✓" : "4"}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">4. Refunded</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 mt-6 pt-5 border-t border-[rgba(201,169,110,0.08)] flex-wrap">
                <button
                  type="button"
                  onClick={handleReorder}
                  className="flex items-center gap-1.5 text-xs px-5 py-2.5 bg-primary text-[#080807] hover:bg-[#E8D5B0] transition-colors font-medium cursor-pointer"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <RotateCcw size={12} strokeWidth={1.5} />
                  Reorder
                </button>

                {canRetryPayment && (
                  <button
                    type="button"
                    onClick={handleRetryPayment}
                    disabled={retryLoading}
                    className="flex items-center gap-1.5 text-xs px-5 py-2.5 bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors font-medium cursor-pointer"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {retryLoading ? <RefreshCw size={12} className="animate-spin" /> : <CreditCard size={12} />}
                    Retry Payment
                  </button>
                )}

                {canUserCancel && (
                  isWithin8Hours ? (
                    !showCancelConfirm ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
                        className="flex items-center gap-1.5 text-xs px-5 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all font-medium cursor-pointer"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <XCircle size={12} strokeWidth={1.5} />
                        Cancel Order
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-1 px-3">
                        <span className="text-xs text-red-300 font-mono">Cancel order?</span>
                        <button
                          type="button"
                          onClick={handleCancelOrder}
                          disabled={cancelLoading}
                          className="text-xs px-3 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium cursor-pointer disabled:opacity-50"
                        >
                          {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(false); }}
                          className="text-xs px-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Orders can only be cancelled within 8 hours of placing them"
                      className="flex items-center gap-1.5 text-xs px-5 py-2.5 border border-red-500/10 text-red-400/40 opacity-50 cursor-not-allowed font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <XCircle size={12} strokeWidth={1.5} />
                      Cancel Expired (8h max)
                    </button>
                  )
                )}

                {order.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={handleGetInvoice}
                    disabled={generatingInvoice}
                    className="flex items-center gap-1.5 text-xs px-5 py-2.5 border border-[rgba(201,169,110,0.2)] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer disabled:opacity-50"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {generatingInvoice ? "Generating..." : "Get Invoice"}
                  </button>
                )}
                {order.status === "Delivered" && (
                  <Link
                    to="/shop"
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  const loadOrders = async () => {
    if (!authState.user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchUserOrders({ email: authState.user.email, userId: authState.user.id });
      setOrders(data.map(mapOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [authState.user]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

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
              className={`px-5 py-3.5 text-xs tracking-[0.15em] uppercase transition-all duration-300 capitalize border-b-2 -mb-px cursor-pointer ${
                filter === f
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {f === "all" ? `All (${orders.length})` : f}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Loading your orders...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
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
              <OrderCard key={order.id} order={order} index={i} onRefresh={loadOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
