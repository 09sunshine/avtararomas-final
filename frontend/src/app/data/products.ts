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
  { id: "1", name: "Eau de Parfum", slug: "edp", image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=800&fit=crop&auto=format", productCount: 0 },
  { id: "2", name: "Eau de Toilette", slug: "edt", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&fit=crop&auto=format", productCount: 0 },
  { id: "3", name: "Parfum Extrait", slug: "extrait", image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=800&fit=crop&auto=format", productCount: 0 },
  { id: "4", name: "Gift Sets", slug: "gifts", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop&auto=format", productCount: 0 },
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
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Avtar Aromas is unlike anything I have experienced from Indian perfumery. It rivals the great Parisian houses — complex, long-lasting, and utterly bewitching. This is my signature.",
    product: "Artisanal Oud",
  },
  {
    id: "t2",
    name: "Rahul Krishnamurthy",
    location: "Bengaluru",
    rating: 5,
    text: "Transported me to a temple courtyard at dusk. The sandalwood quality is extraordinary — smooth, creamy, and endlessly nuanced. Worth every rupee and then some.",
    product: "Santal Sacré",
  },
  {
    id: "t3",
    name: "Aisha Mehta",
    location: "Delhi",
    rating: 5,
    text: "The most beautiful rose fragrance I have smelled. Not heavy, not synthetic — just pure, living rose. The packaging is museum-worthy, and the longevity is remarkable.",
    product: "Rose Absolue",
  },
  {
    id: "t4",
    name: "Vikram Nair",
    location: "Chennai",
    rating: 5,
    text: "An absolute event. I wore it to a wedding and spent the entire evening fielding questions about what I was wearing. Exceptional craft.",
    product: "Oud Royal",
  },
];
