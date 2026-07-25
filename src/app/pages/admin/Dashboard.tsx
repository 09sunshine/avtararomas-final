import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Package, ShoppingCart, Users, TrendingUp, Plus, Pencil, Trash2, Eye,
  ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Truck, XCircle, Tag,
  BarChart2, Settings, LogOut, X, Save, Bell, Globe, Mail, AlertTriangle,
  ToggleLeft, ToggleRight, Search,
} from "lucide-react";
import { products as initialProducts } from "../../data/products";
import { useAuth } from "../../stores/authStore";
import { motion } from "motion/react";
import type { Product } from "../../types";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "products" | "orders" | "coupons" | "settings";
type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Cancelled";

interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  address: string;
  orderProducts: { name: string; qty: number; price: number; image: string }[];
}

interface Coupon {
  code: string;
  discount: number;
  uses: number;
  limit: number;
  active: boolean;
  expiry: string;
  minOrder: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: string;
  originalPrice: string;
  stock: string;
  description: string;
  tags: string;
  sizes: string;
  image1: string;
  image2: string;
  featured: boolean;
  isNew: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REVENUE_DATA = [
  { month: "Feb", revenue: 84000 },
  { month: "Mar", revenue: 96000 },
  { month: "Apr", revenue: 88000 },
  { month: "May", revenue: 112000 },
  { month: "Jun", revenue: 98000 },
  { month: "Jul", revenue: 134000 },
];

const CATEGORY_DATA = [
  { name: "EDP", value: 48, color: "#C9A96E" },
  { name: "Parfum", value: 27, color: "#E8D5B0" },
  { name: "EDT", value: 16, color: "#9A7A4A" },
  { name: "Gift Sets", value: 9, color: "#5C4A2A" },
];

const SAMPLE_ORDERS: AdminOrder[] = [
  {
    id: "AVT-001", customer: "Aanya Sharma", email: "aanya@email.com",
    date: "23 Jul 2025", total: 7598, status: "Delivered", items: 2,
    address: "12 MG Road, Bengaluru 560001",
    orderProducts: [
      { name: initialProducts[0].name, qty: 1, price: initialProducts[0].price, image: initialProducts[0].images[0] },
      { name: initialProducts[1].name, qty: 1, price: initialProducts[1].price, image: initialProducts[1].images[0] },
    ],
  },
  {
    id: "AVT-002", customer: "Rahul Mehta", email: "rahul@email.com",
    date: "22 Jul 2025", total: 3799, status: "Shipped", items: 1,
    address: "7 Linking Road, Mumbai 400050",
    orderProducts: [
      { name: initialProducts[2].name, qty: 1, price: initialProducts[2].price, image: initialProducts[2].images[0] },
    ],
  },
  {
    id: "AVT-003", customer: "Priya Nair", email: "priya@email.com",
    date: "21 Jul 2025", total: 12597, status: "Processing", items: 3,
    address: "45 Anna Salai, Chennai 600002",
    orderProducts: [
      { name: initialProducts[3].name, qty: 2, price: initialProducts[3].price, image: initialProducts[3].images[0] },
      { name: initialProducts[4].name, qty: 1, price: initialProducts[4].price, image: initialProducts[4].images[0] },
    ],
  },
  {
    id: "AVT-004", customer: "Vikram Khanna", email: "vikram@email.com",
    date: "20 Jul 2025", total: 5399, status: "Cancelled", items: 1,
    address: "18 Connaught Place, Delhi 110001",
    orderProducts: [
      { name: initialProducts[5].name, qty: 1, price: initialProducts[5].price, image: initialProducts[5].images[0] },
    ],
  },
  {
    id: "AVT-005", customer: "Sanya Bose", email: "sanya@email.com",
    date: "19 Jul 2025", total: 8999, status: "Delivered", items: 1,
    address: "33 Park Street, Kolkata 700016",
    orderProducts: [
      { name: initialProducts[6].name, qty: 1, price: initialProducts[6].price, image: initialProducts[6].images[0] },
    ],
  },
];

const SAMPLE_COUPONS: Coupon[] = [
  { code: "AVTAR10", discount: 10, uses: 42, limit: 100, active: true, expiry: "2025-12-31", minOrder: 999 },
  { code: "LUXURY15", discount: 15, uses: 28, limit: 50, active: true, expiry: "2025-09-30", minOrder: 2999 },
  { code: "WELCOME20", discount: 20, uses: 91, limit: 200, active: false, expiry: "2025-08-31", minOrder: 0 },
];

const STATUS_CFG: Record<OrderStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  Delivered:  { icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  Shipped:    { icon: Truck,        color: "#C9A96E", bg: "rgba(201,169,110,0.08)" },
  Processing: { icon: Clock,        color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  Cancelled:  { icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

const PRODUCT_CATEGORIES = ["Eau de Parfum", "Eau de Toilette", "Parfum Extrait", "Gift Sets"];
const FRAGRANCE_FAMILIES  = ["Floral", "Woody", "Fresh", "Oriental", "Aquatic", "Citrus"];
const ALL_STATUSES: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Cancelled"];

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const EMPTY_FORM: ProductFormData = {
  name: "", slug: "", category: "Eau de Parfum", subcategory: "Floral",
  price: "", originalPrice: "", stock: "20",
  description: "", tags: "", sizes: "30ml, 50ml, 100ml",
  image1: "", image2: "", featured: false, isNew: true,
};

function productToForm(p: Product): ProductFormData {
  return {
    name: p.name, slug: p.slug, category: p.category, subcategory: p.subcategory || "",
    price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : "",
    stock: String(p.stock), description: p.description, tags: p.tags.join(", "),
    sizes: p.sizes?.join(", ") || "", image1: p.images[0] || "", image2: p.images[1] || "",
    featured: !!p.featured, isNew: !!p.isNew,
  };
}

// ─── Reusable primitives ──────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
      {children}
    </p>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#0D0C0B] border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors ${props.className ?? ""}`}
      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
    />
  );
}

function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-[#0D0C0B] border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors resize-none ${props.className ?? ""}`}
      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
    />
  );
}

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full bg-[#0D0C0B] border border-[rgba(201,169,110,0.2)] focus:border-primary/50 px-4 py-3 text-sm text-foreground outline-none transition-colors ${rest.className ?? ""}`}
      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
    >
      {children}
    </select>
  );
}

function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`transition-colors duration-300 ${checked ? "text-primary" : "text-muted-foreground/40"}`}>
      {checked ? <ToggleRight size={26} strokeWidth={1.5} /> : <ToggleLeft size={26} strokeWidth={1.5} />}
    </button>
  );
}

// ─── Slide-in Drawer ──────────────────────────────────────────────────────────

function SlideDrawer({ open, onClose, title, subtitle, width = "max-w-[620px]", children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`relative h-full w-full ${width} bg-[#0A0908] border-l border-[rgba(201,169,110,0.15)] flex flex-col shadow-2xl`}
      >
        <div className="flex items-start justify-between px-8 py-6 border-b border-[rgba(201,169,110,0.1)] flex-shrink-0">
          <div>
            <h2 className="text-2xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{subtitle}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors mt-1">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-7 scrollbar-thin">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Centred Modal ────────────────────────────────────────────────────────────

function CentreModal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] bg-[#0F0E0D] border border-[rgba(201,169,110,0.2)] shadow-2xl"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[rgba(201,169,110,0.1)]">
          <h3 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            {title}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ open, label, message, onConfirm, onClose }: {
  open: boolean;
  label: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-[#0F0E0D] border border-[rgba(201,169,110,0.15)] p-8 shadow-2xl"
      >
        <div className="flex gap-4 mb-6">
          <div className="p-2.5 border border-red-500/30 text-red-400 flex-shrink-0 h-fit">
            <AlertTriangle size={16} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg text-foreground mb-1.5" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              {label}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[rgba(201,169,110,0.2)] text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 bg-red-500 text-white text-xs tracking-[0.2em] uppercase hover:bg-red-400 transition-all"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, change, icon: Icon, up }: {
  title: string; value: string; change: string; icon: typeof Package; up: boolean;
}) {
  return (
    <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 border border-[rgba(201,169,110,0.15)] text-primary">
          <Icon size={16} strokeWidth={1.5} />
        </div>
        <div className={`flex items-center gap-1 text-xs ${up ? "text-green-400" : "text-red-400"}`} style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
          {up ? <ArrowUpRight size={13} strokeWidth={1.5} /> : <ArrowDownRight size={13} strokeWidth={1.5} />}
          {change}
        </div>
      </div>
      <p className="text-2xl text-foreground mb-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{value}</p>
      <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{title}</p>
    </div>
  );
}

// ─── Product Form (used in add & edit drawer) ─────────────────────────────────

function ProductFormBody({ data, setData, onSave, saveLabel }: {
  data: ProductFormData;
  setData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSave: () => void;
  saveLabel: string;
}) {
  const field = (key: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData((prev) => ({ ...prev, [key]: e.target.value }));

  const autoSlug = () => {
    setData((prev) => prev.slug
      ? prev
      : { ...prev, slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Basic */}
      <section>
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Basic Information
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>Product Name *</FieldLabel>
            <FieldInput value={data.name} onChange={field("name")} onBlur={autoSlug} placeholder="e.g. Midnight Oud Noir" />
          </div>
          <div>
            <FieldLabel>URL Slug *</FieldLabel>
            <FieldInput value={data.slug} onChange={field("slug")} placeholder="e.g. midnight-oud-noir" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Category *</FieldLabel>
              <FieldSelect value={data.category} onChange={field("category")}>
                {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </FieldSelect>
            </div>
            <div>
              <FieldLabel>Fragrance Family</FieldLabel>
              <FieldSelect value={data.subcategory} onChange={field("subcategory")}>
                {FRAGRANCE_FAMILIES.map((f) => <option key={f}>{f}</option>)}
              </FieldSelect>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-[rgba(201,169,110,0.08)] pt-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Pricing & Inventory
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <FieldLabel>Price (₹) *</FieldLabel>
            <FieldInput type="number" value={data.price} onChange={field("price")} placeholder="3999" />
          </div>
          <div>
            <FieldLabel>Original Price (₹)</FieldLabel>
            <FieldInput type="number" value={data.originalPrice} onChange={field("originalPrice")} placeholder="4999" />
          </div>
          <div>
            <FieldLabel>Stock *</FieldLabel>
            <FieldInput type="number" value={data.stock} onChange={field("stock")} placeholder="20" />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="border-t border-[rgba(201,169,110,0.08)] pt-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Description & Tags
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>Description *</FieldLabel>
            <FieldTextarea rows={4} value={data.description} onChange={field("description")} placeholder="A captivating blend of rare ingredients..." />
          </div>
          <div>
            <FieldLabel>Tags (comma-separated)</FieldLabel>
            <FieldInput value={data.tags} onChange={field("tags")} placeholder="oud, woody, evening, oriental" />
          </div>
          <div>
            <FieldLabel>Sizes (comma-separated)</FieldLabel>
            <FieldInput value={data.sizes} onChange={field("sizes")} placeholder="30ml, 50ml, 100ml" />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="border-t border-[rgba(201,169,110,0.08)] pt-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Images
        </p>
        <div className="flex flex-col gap-4">
          {(["image1", "image2"] as const).map((key, idx) => (
            <div key={key}>
              <FieldLabel>{idx === 0 ? "Primary Image URL *" : "Hover Image URL"}</FieldLabel>
              <div className="flex gap-3 items-center">
                <FieldInput value={data[key]} onChange={field(key)} placeholder="https://images.unsplash.com/..." className="flex-1" />
                {data[key] && (
                  <div className="w-12 h-14 border border-[rgba(201,169,110,0.2)] overflow-hidden flex-shrink-0">
                    <img src={data[key]} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flags */}
      <section className="border-t border-[rgba(201,169,110,0.08)] pt-6">
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Visibility
        </p>
        {([
          { key: "featured" as const, label: "Featured on Homepage" },
          { key: "isNew" as const, label: "Mark as New Arrival" },
        ]).map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-3.5 border-b border-[rgba(201,169,110,0.06)] last:border-0">
            <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{label}</span>
            <SwitchToggle checked={!!data[key]} onChange={() => setData((p) => ({ ...p, [key]: !p[key] }))} />
          </div>
        ))}
      </section>

      <button
        onClick={onSave}
        className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary text-[#080807] text-xs tracking-[0.3em] uppercase hover:bg-[#E8D5B0] transition-all duration-400 mt-2"
        style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
      >
        <Save size={14} strokeWidth={1.5} />
        {saveLabel}
      </button>
    </div>
  );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────

function OrderDrawer({ order, onClose, onStatusChange }: {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusChange: (id: string, s: OrderStatus) => void;
}) {
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");

  useEffect(() => {
    setNextStatus(order?.status ?? "");
  }, [order]);

  if (!order) return null;
  const cfg = STATUS_CFG[order.status];

  return (
    <SlideDrawer
      open
      onClose={onClose}
      title={`Order ${order.id}`}
      subtitle={`Placed ${order.date} · ${order.customer}`}
      width="max-w-[520px]"
    >
      <div className="flex flex-col gap-7">
        {/* Status row */}
        <div className="flex items-center justify-between p-4 border border-[rgba(201,169,110,0.1)] bg-[rgba(201,169,110,0.02)]">
          <div className="flex items-center gap-2">
            <cfg.icon size={14} strokeWidth={1.5} style={{ color: cfg.color }} />
            <span className="text-sm" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, color: cfg.color }}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FieldSelect
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="text-xs py-2 px-3 w-36"
            >
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </FieldSelect>
            <button
              onClick={() => { if (nextStatus && nextStatus !== order.status) onStatusChange(order.id, nextStatus as OrderStatus); }}
              disabled={!nextStatus || nextStatus === order.status}
              className="px-3.5 py-2 bg-primary text-[#080807] text-xs tracking-[0.15em] uppercase hover:bg-[#E8D5B0] transition-colors disabled:opacity-40 whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              Update
            </button>
          </div>
        </div>

        {/* Customer */}
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Customer
          </p>
          <p className="text-base text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            {order.customer}
          </p>
          <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            {order.email}
          </p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            {order.address}
          </p>
        </div>

        {/* Items */}
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Items Ordered ({order.items})
          </p>
          <div className="flex flex-col gap-3">
            {order.orderProducts.map((p, i) => (
              <div key={i} className="flex gap-3 p-3 border border-[rgba(201,169,110,0.08)]">
                <div className="w-12 h-14 overflow-hidden bg-[#141311] flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                  <p className="text-sm text-foreground truncate" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                    Qty: {p.qty}
                  </p>
                </div>
                <p className="text-sm text-foreground flex-shrink-0" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                  {formatPrice(p.price * p.qty)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-[rgba(201,169,110,0.08)] pt-5 flex flex-col gap-2.5">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Subtotal</span>
            <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Shipping</span>
            <span className="text-xs text-green-400" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>Free</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-[rgba(201,169,110,0.08)]">
            <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>Total</span>
            <span className="text-lg text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-3 border border-[rgba(201,169,110,0.2)] text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Print Invoice
          </button>
          {order.status !== "Cancelled" && (
            <button
              className="flex-1 py-3 border border-red-500/20 text-xs tracking-[0.2em] uppercase text-red-400 hover:bg-red-500/5 hover:border-red-500/40 transition-all"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </SlideDrawer>
  );
}

// ─── Coupon Form Modal ────────────────────────────────────────────────────────

function CouponFormModal({ open, editing, onClose, onSave }: {
  open: boolean;
  editing: Coupon | null;
  onClose: () => void;
  onSave: (c: Coupon) => void;
}) {
  const blank: Coupon = { code: "", discount: 10, uses: 0, limit: 100, active: true, expiry: "", minOrder: 0 };
  const [form, setForm] = useState<Coupon>(editing ?? blank);

  useEffect(() => {
    setForm(editing ?? blank);
  }, [editing, open]);

  const numField = (key: keyof Coupon) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: Number(e.target.value) }));

  const strField = (key: keyof Coupon) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <CentreModal open={open} onClose={onClose} title={editing ? "Edit Coupon" : "New Coupon"}>
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Coupon Code *</FieldLabel>
          <FieldInput
            value={form.code}
            onChange={strField("code")}
            placeholder="e.g. SUMMER25"
            disabled={!!editing}
            className="uppercase tracking-[0.2em]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Discount (%)</FieldLabel>
            <FieldInput type="number" min={1} max={90} value={form.discount} onChange={numField("discount")} />
          </div>
          <div>
            <FieldLabel>Usage Limit</FieldLabel>
            <FieldInput type="number" min={1} value={form.limit} onChange={numField("limit")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Min. Order (₹)</FieldLabel>
            <FieldInput type="number" min={0} value={form.minOrder} onChange={numField("minOrder")} placeholder="0 = no min" />
          </div>
          <div>
            <FieldLabel>Expiry Date</FieldLabel>
            <FieldInput type="date" value={form.expiry} onChange={strField("expiry")} />
          </div>
        </div>
        <div className="flex items-center justify-between py-3.5 border-t border-[rgba(201,169,110,0.08)]">
          <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Active</span>
          <SwitchToggle checked={form.active} onChange={() => setForm((p) => ({ ...p, active: !p.active }))} />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[rgba(201,169,110,0.2)] text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-all"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (form.code.trim()) { onSave(form); onClose(); } }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-[#080807] text-xs tracking-[0.2em] uppercase hover:bg-[#E8D5B0] transition-all"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          >
            <Save size={13} strokeWidth={1.5} />
            {editing ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </CentreModal>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel() {
  const [storeName, setStoreName]   = useState("Avtar Aromas");
  const [storeEmail, setStoreEmail] = useState("hello@avtararomas.com");
  const [storePhone, setStorePhone] = useState("+91 98765 43210");
  const [gst, setGst]               = useState("29ABCDE1234F1Z5");
  const [currency, setCurrency]     = useState("INR");
  const [freeAt, setFreeAt]         = useState("999");
  const [stdShip, setStdShip]       = useState("149");
  const [orderAlerts, setOrderAlerts]   = useState(true);
  const [stockAlerts, setStockAlerts]   = useState(true);
  const [newsAlerts, setNewsAlerts]     = useState(false);
  const [instagram, setInstagram]   = useState("@avtararomas");
  const [facebook, setFacebook]     = useState("avtararomas");
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved]           = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Row = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-4 border-b border-[rgba(201,169,110,0.06)] last:border-0">
      <div>
        <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{desc}</p>
      </div>
      <SwitchToggle checked={checked} onChange={onChange} />
    </div>
  );

  const Section = ({ icon: Icon, title, children }: { icon: typeof Globe; title: string; children: React.ReactNode }) => (
    <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-7 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="p-2 border border-[rgba(201,169,110,0.15)] text-primary"><Icon size={14} strokeWidth={1.5} /></div>
        <p className="text-[10px] tracking-[0.35em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{title}</p>
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Section icon={Globe} title="Store Information">
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel>Store Name</FieldLabel>
            <FieldInput value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Support Email</FieldLabel>
              <FieldInput type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <FieldInput value={storePhone} onChange={(e) => setStorePhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>GST Number</FieldLabel>
              <FieldInput value={gst} onChange={(e) => setGst(e.target.value)} className="uppercase tracking-wider" />
            </div>
            <div>
              <FieldLabel>Currency</FieldLabel>
              <FieldSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
              </FieldSelect>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Truck} title="Shipping Configuration">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Free Shipping Threshold (₹)</FieldLabel>
            <FieldInput type="number" value={freeAt} onChange={(e) => setFreeAt(e.target.value)} />
            <p className="text-[10px] text-muted-foreground/50 mt-1.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              Orders above this amount get free shipping
            </p>
          </div>
          <div>
            <FieldLabel>Standard Shipping Fee (₹)</FieldLabel>
            <FieldInput type="number" value={stdShip} onChange={(e) => setStdShip(e.target.value)} />
          </div>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <Row label="New order alerts"       desc="Email notification for every new order"        checked={orderAlerts} onChange={() => setOrderAlerts(!orderAlerts)} />
        <Row label="Low stock alerts"       desc="Alert when product stock falls below 5"        checked={stockAlerts} onChange={() => setStockAlerts(!stockAlerts)} />
        <Row label="Newsletter signups"     desc="Notify on each new newsletter subscription"    checked={newsAlerts}  onChange={() => setNewsAlerts(!newsAlerts)} />
      </Section>

      <Section icon={Mail} title="Social Links">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Instagram Handle</FieldLabel>
            <FieldInput value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
          </div>
          <div>
            <FieldLabel>Facebook Page</FieldLabel>
            <FieldInput value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="pagename" />
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="bg-[#0A0908] border border-red-500/15 p-7 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-red-500/30 text-red-400"><AlertTriangle size={14} strokeWidth={1.5} /></div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-red-400" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            Danger Zone
          </p>
        </div>
        <Row
          label="Maintenance Mode"
          desc="Temporarily take the store offline for visitors"
          checked={maintenance}
          onChange={() => setMaintenance(!maintenance)}
        />
      </div>

      <button
        onClick={handleSave}
        className={`flex items-center justify-center gap-2.5 py-4 text-xs tracking-[0.3em] uppercase transition-all duration-400 ${
          saved
            ? "bg-green-500/15 border border-green-500/30 text-green-400"
            : "bg-primary text-[#080807] hover:bg-[#E8D5B0]"
        }`}
        style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
      >
        {saved ? <><CheckCircle2 size={14} strokeWidth={1.5} /> Saved!</> : <><Save size={14} strokeWidth={1.5} /> Save Settings</>}
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Products
  const [allProducts, setAllProducts]     = useState<Product[]>([...initialProducts]);
  const [productSearch, setProductSearch] = useState("");
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm]     = useState<ProductFormData>(EMPTY_FORM);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Orders
  const [allOrders, setAllOrders]           = useState<AdminOrder[]>(SAMPLE_ORDERS);
  const [viewingOrder, setViewingOrder]     = useState<AdminOrder | null>(null);
  const [orderSearch, setOrderSearch]       = useState("");
  const [statusFilter, setStatusFilter]     = useState<OrderStatus | "all">("all");

  // Coupons
  const [allCoupons, setAllCoupons]         = useState<Coupon[]>(SAMPLE_COUPONS);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon]   = useState<Coupon | null>(null);
  const [deleteCouponCode, setDeleteCouponCode] = useState<string | null>(null);

  // Helpers
  const openAdd = () => { setEditingProduct(null); setProductForm(EMPTY_FORM); setDrawerOpen(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setProductForm(productToForm(p)); setDrawerOpen(true); };

  const saveProduct = () => {
    const p: Product = {
      id: editingProduct?.id ?? String(Date.now()),
      name: productForm.name, slug: productForm.slug,
      category: productForm.category, subcategory: productForm.subcategory,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      stock: Number(productForm.stock), description: productForm.description,
      tags: productForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      sizes: productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      images: [productForm.image1, productForm.image2].filter(Boolean),
      rating: editingProduct?.rating ?? 0,
      reviewCount: editingProduct?.reviewCount ?? 0,
      featured: productForm.featured, isNew: productForm.isNew,
    };
    setAllProducts((prev) => editingProduct
      ? prev.map((x) => (x.id === editingProduct.id ? p : x))
      : [p, ...prev]
    );
    setDrawerOpen(false);
  };

  const visibleProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const visibleOrders = allOrders.filter((o) => {
    const q = orderSearch.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const TABS: { id: AdminTab; label: string; icon: typeof BarChart2 }[] = [
    { id: "overview",  label: "Overview",  icon: BarChart2 },
    { id: "products",  label: "Products",  icon: Package },
    { id: "orders",    label: "Orders",    icon: ShoppingCart },
    { id: "coupons",   label: "Coupons",   icon: Tag },
    { id: "settings",  label: "Settings",  icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050504] flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-60 border-r border-[rgba(201,169,110,0.1)] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-[rgba(201,169,110,0.08)]">
          <p className="text-[9px] tracking-[0.5em] text-primary uppercase mb-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
            admin panel
          </p>
          <p className="text-xl tracking-[0.1em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            AVTAR
          </p>
        </div>

        <nav className="flex flex-col gap-1 p-4 flex-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 text-xs tracking-[0.15em] uppercase transition-all duration-200 text-left ${
                tab === t.id
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-[rgba(201,169,110,0.05)]"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              <t.icon size={14} strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[rgba(201,169,110,0.08)] flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            <Eye size={14} strokeWidth={1.5} />
            View Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-red-400 transition-colors"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">

        {/* Sticky header */}
        <div className="border-b border-[rgba(201,169,110,0.1)] px-8 py-5 sticky top-0 bg-[#050504] z-10">
          <h1 className="text-xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
            July 23, 2025
          </p>
        </div>

        <div className="p-8">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue"    value="₹1,34,872" change="+18.4%" icon={TrendingUp}   up={true} />
                <StatCard title="Total Orders"     value="248"        change="+12.1%" icon={ShoppingCart} up={true} />
                <StatCard title="Active Products"  value={String(allProducts.length)} change="+2" icon={Package} up={true} />
                <StatCard title="Customers"        value="1,894"      change="-3.2%"  icon={Users}        up={false} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-6">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    Revenue — Last 6 Months
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={REVENUE_DATA}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B6560", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: "#0A0908", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 0, fontSize: 12, fontFamily: "DM Mono", color: "#F8F4ED" }}
                        formatter={(v: number) => [formatPrice(v), "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={1.5}
                        dot={{ fill: "#C9A96E", strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: "#C9A96E" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-6">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    Sales by Category
                  </p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {CATEGORY_DATA.map((e) => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0A0908", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 0, fontSize: 11, fontFamily: "DM Mono", color: "#F8F4ED" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 mt-4">
                    {CATEGORY_DATA.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{d.name}</span>
                        </div>
                        <span className="text-xs text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    Recent Orders
                  </p>
                  <button onClick={() => setTab("orders")} className="text-xs text-primary hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    View all →
                  </button>
                </div>
                {allOrders.slice(0, 4).map((o) => {
                  const c = STATUS_CFG[o.status];
                  return (
                    <div key={o.id} className="flex items-center gap-4 py-3.5 border-b border-[rgba(201,169,110,0.06)] last:border-0">
                      <span className="text-xs text-muted-foreground w-20 flex-shrink-0" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{o.id}</span>
                      <span className="text-sm text-foreground flex-1 min-w-0 truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{o.customer}</span>
                      <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(o.total)}</span>
                      <div className="flex items-center gap-1.5 w-26 flex-shrink-0">
                        <c.icon size={11} strokeWidth={1.5} style={{ color: c.color }} />
                        <span className="text-xs" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, color: c.color }}>{o.status}</span>
                      </div>
                      <button onClick={() => setViewingOrder(o)} className="text-xs text-primary hover:text-[#E8D5B0] transition-colors flex-shrink-0" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="relative">
                  <Search size={13} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none w-64 transition-colors"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  />
                </div>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#080807] text-xs tracking-[0.2em] uppercase hover:bg-[#E8D5B0] transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  <Plus size={13} strokeWidth={1.5} />
                  Add Product
                </button>
              </div>

              <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(201,169,110,0.08)]">
                      {["Product", "Category", "Price", "Stock", "Rating", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((p) => (
                      <tr key={p.id} className="border-b border-[rgba(201,169,110,0.05)] hover:bg-[rgba(201,169,110,0.03)] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 overflow-hidden bg-[#141311] flex-shrink-0">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{p.name}</p>
                              {p.isNew && <span className="text-[9px] text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{p.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(p.price)}</p>
                          {p.originalPrice && <p className="text-xs text-muted-foreground line-through" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(p.originalPrice)}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 border ${p.stock < 10 ? "border-red-500/30 text-red-400 bg-red-500/5" : "border-green-500/30 text-green-400 bg-green-500/5"}`} style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-primary text-xs">★</span>
                            <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{p.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/shop/${p.slug}`} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="View">
                              <Eye size={13} strokeWidth={1.5} />
                            </Link>
                            <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                              <Pencil size={13} strokeWidth={1.5} />
                            </button>
                            <button onClick={() => setDeleteProductId(p.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleProducts.length === 0 && (
                  <p className="py-14 text-center text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    No products found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={13} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by ID or name..."
                    className="w-full bg-transparent border border-[rgba(201,169,110,0.2)] focus:border-primary/50 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  />
                </div>
                <div className="flex border border-[rgba(201,169,110,0.15)]">
                  {(["all", ...ALL_STATUSES] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3.5 py-2.5 text-xs tracking-[0.1em] uppercase transition-all capitalize ${
                        statusFilter === s ? "bg-primary text-[#080807]" : "text-muted-foreground hover:text-foreground"
                      }`}
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0908] border border-[rgba(201,169,110,0.1)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(201,169,110,0.08)]">
                      {["Order", "Customer", "Date", "Items", "Total", "Status", "Action"].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((o) => {
                      const c = STATUS_CFG[o.status];
                      return (
                        <tr key={o.id} className="border-b border-[rgba(201,169,110,0.05)] hover:bg-[rgba(201,169,110,0.03)] transition-colors">
                          <td className="px-5 py-4 text-xs text-primary" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{o.id}</td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{o.customer}</p>
                            <p className="text-xs text-muted-foreground/60" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{o.email}</p>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{o.date}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground text-center" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{o.items}</td>
                          <td className="px-5 py-4 text-sm text-foreground" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{formatPrice(o.total)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 w-fit border" style={{ borderColor: `${c.color}30`, backgroundColor: c.bg }}>
                              <c.icon size={10} strokeWidth={1.5} style={{ color: c.color }} />
                              <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", fontWeight: 300, color: c.color }}>{o.status}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setViewingOrder(o)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(201,169,110,0.2)] text-xs text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                            >
                              <Eye size={11} strokeWidth={1.5} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {visibleOrders.length === 0 && (
                  <p className="py-14 text-center text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    No orders found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── COUPONS ── */}
          {tab === "coupons" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                  {allCoupons.length} codes · {allCoupons.filter((c) => c.active).length} active
                </p>
                <button
                  onClick={() => { setEditingCoupon(null); setCouponModalOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#080807] text-xs tracking-[0.2em] uppercase hover:bg-[#E8D5B0] transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                >
                  <Plus size={13} strokeWidth={1.5} />
                  New Coupon
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCoupons.map((c) => (
                  <div
                    key={c.code}
                    className={`bg-[#0A0908] border p-6 flex flex-col gap-4 transition-opacity ${
                      c.active ? "border-[rgba(201,169,110,0.15)]" : "border-[rgba(201,169,110,0.06)] opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-lg text-primary tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                        {c.code}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-1 border ${
                          c.active ? "border-green-500/30 text-green-400 bg-green-500/5" : "border-muted-foreground/20 text-muted-foreground"
                        }`}
                        style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 300, lineHeight: 1 }}>
                      {c.discount}%{" "}
                      <span className="text-base text-muted-foreground">off</span>
                    </p>

                    <div className="text-xs text-muted-foreground flex flex-col gap-1" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                      {c.minOrder > 0 && <span>Min. order: {formatPrice(c.minOrder)}</span>}
                      {c.expiry && <span>Expires: {c.expiry}</span>}
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                        <span>{c.uses} uses</span>
                        <span>{c.limit} limit</span>
                      </div>
                      <div className="h-0.5 bg-[rgba(201,169,110,0.1)]">
                        <div
                          className="h-full bg-primary/50"
                          style={{ width: `${Math.min((c.uses / c.limit) * 100, 100)}%`, transition: "width 0.5s ease" }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-[rgba(201,169,110,0.08)]">
                      <button
                        onClick={() => { setEditingCoupon(c); setCouponModalOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs border border-[rgba(201,169,110,0.2)] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                      >
                        <Pencil size={11} strokeWidth={1.5} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteCouponCode(c.code)}
                        className="p-2.5 border border-[rgba(201,169,110,0.2)] text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-all"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </div>

      {/* ── Product Drawer ─────────────────────────────────────────────── */}
      <SlideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        subtitle={editingProduct ? `Editing: ${editingProduct.name}` : "Add a new fragrance to the collection"}
        width="max-w-[640px]"
      >
        <ProductFormBody
          data={productForm}
          setData={setProductForm}
          onSave={saveProduct}
          saveLabel={editingProduct ? "Save Changes" : "Add Product"}
        />
      </SlideDrawer>

      {/* ── Order Drawer ────────────────────────────────────────────────── */}
      <OrderDrawer
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onStatusChange={(id, s) => {
          setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: s } : o)));
          setViewingOrder((prev) => (prev?.id === id ? { ...prev, status: s } : prev));
        }}
      />

      {/* ── Coupon Modal ────────────────────────────────────────────────── */}
      <CouponFormModal
        open={couponModalOpen}
        editing={editingCoupon}
        onClose={() => setCouponModalOpen(false)}
        onSave={(c) => {
          setAllCoupons((prev) =>
            editingCoupon
              ? prev.map((x) => (x.code === editingCoupon.code ? c : x))
              : [c, ...prev]
          );
        }}
      />

      {/* ── Delete Product Confirm ─────────────────────────────────────── */}
      <DeleteConfirm
        open={!!deleteProductId}
        label="Delete Product"
        message="This product will be permanently removed from your catalogue. This cannot be undone."
        onConfirm={() => setAllProducts((prev) => prev.filter((p) => p.id !== deleteProductId))}
        onClose={() => setDeleteProductId(null)}
      />

      {/* ── Delete Coupon Confirm ──────────────────────────────────────── */}
      <DeleteConfirm
        open={!!deleteCouponCode}
        label={`Delete "${deleteCouponCode}"`}
        message="This coupon will be permanently removed and can no longer be redeemed by customers."
        onConfirm={() => setAllCoupons((prev) => prev.filter((c) => c.code !== deleteCouponCode))}
        onClose={() => setDeleteCouponCode(null)}
      />

    </div>
  );
}
