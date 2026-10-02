import type { Product, Category } from "../types";

export const fragranceFamilies = [
  { id: "floral", name: "Floral", description: "Blooms eternal", icon: "🌸", color: "from-pink-950/30 to-rose-950/10" },
  { id: "woody", name: "Woody", description: "Grounded & warm", icon: "🌳", color: "from-amber-950/30 to-stone-950/10" },
  { id: "fresh", name: "Fresh", description: "Crisp & alive", icon: "🍃", color: "from-emerald-950/30 to-teal-950/10" },
  { id: "oriental", name: "Oriental", description: "Mysterious depth", icon: "🌙", color: "from-violet-950/30 to-purple-950/10" },
  { id: "aquatic", name: "Aquatic", description: "Sea & sky", icon: "💧", color: "from-blue-950/30 to-cyan-950/10" },
  { id: "citrus", name: "Citrus", description: "Bright & radiant", icon: "🍋", color: "from-yellow-950/30 to-amber-950/10" },
];

export const categories: Category[] = [
  { id: "1", name: "Extrait de parfum", slug: "extrait", image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=800&fit=crop&auto=format", productCount: 0 },
];

export const products: Product[] = [];

export const getFeaturedProducts = () => products.filter((p) => p.featured);
export const getNewProducts = () => products.filter((p) => p.isNew);
export const getBestSellers = () =>
  [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6);
export const getProductsByCategory = (cat: string) =>
  products.filter((p) => p.category === cat || p.subcategory === cat);
export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const testimonials = [
  {
    id: "t1",
    name: "Priti Seghal",
    location: "Mumbai",
    rating: 5,
    text: "Okay but why does this smell this good?? 😍 Lowkey obsessed. Used it once and now I’m hooked. Already planning my next order because I’m not letting this run out. 10/10 would repurchase.",
    product: "The Imperial Dawn – Jaipur",
  },
  {
    id: "t2",
    name: "Dhruv Agarwal",
    location: "Bengaluru",
    rating: 5,
    text: "Amazing scent, lasting power. Smells fantastic and lasts way longer than I expected. Not overpowering at all. Will definitely purchase again when I run out. Great value for money.",
    product: "The Eternal Grace – Ajmer",
  },
  {
    id: "t3",
    name: "Sidhham Jain",
    location: "Delhi",
    rating: 5,
    text: "My new signature scent fr. I literally can’t stop smelling myself lol. It’s that good. Fresh, clean, and kinda addictive. My sister already stole mine so I’m ordering another bottle ASAP. 100% worth it and I’ll be back for more.",
    product: "The Royal Reflection – Udaipur",
  },
  {
    id: "t4",
    name: "Tejaswini Thakur",
    location: "Chennai",
    rating: 5,
    text: "Spicy, party vibe, soft, calm, strong, sweet. This Signatures kit is a blast.",
    product: "The Five Signatures",
  },
];
