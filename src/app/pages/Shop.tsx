import { useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import { motion, useInView } from "motion/react";
import { SlidersHorizontal, Grid3X3, Grid2X2, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { products, categories, fragranceFamilies } from "../data/products";
import ProductCard from "../components/ui/ProductCard";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "bestsellers", label: "Best Selling" },
  { value: "newest", label: "New Arrivals" },
];

const PRICE_RANGES = [
  { label: "Under ₹4,000", min: 0, max: 4000 },
  { label: "₹4,000 – ₹5,500", min: 4000, max: 5500 },
  { label: "₹5,500 – ₹7,000", min: 5500, max: 7000 },
  { label: "₹7,000+", min: 7000, max: Infinity },
];

function FilterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[rgba(201,169,110,0.1)] py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-primary" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>{title}</span>
        {open ? <ChevronUp size={13} strokeWidth={1.5} className="text-muted-foreground" /> : <ChevronDown size={13} strokeWidth={1.5} className="text-muted-foreground" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [layout, setLayout] = useState<"grid4" | "grid3">("grid4");
  const [sortBy, setSortBy] = useState(params.get("sort") || "featured");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [localSearch, setLocalSearch] = useState(params.get("q") || "");

  const activeCategory = params.get("category") || "";
  const activeSubcategory = params.get("subcategory") || "";
  const filterNew = params.get("filter") === "new";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(activeCategory ? [activeCategory] : []);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>(activeSubcategory ? [activeSubcategory] : []);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);

  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  const toggleCategory = (cat: string) => setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleFamily = (fam: string) => setSelectedFamilies((prev) => prev.includes(fam) ? prev.filter((f) => f !== fam) : [...prev, fam]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (localSearch) {
      const q = localSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.subcategory?.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)));
    }
    if (selectedCategories.length > 0) result = result.filter((p) => selectedCategories.includes(p.category));
    if (selectedFamilies.length > 0) result = result.filter((p) => selectedFamilies.includes(p.subcategory || ""));
    if (filterNew) result = result.filter((p) => p.isNew);
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      result = result.filter((p) => p.price >= range.min && p.price <= range.max);
    }
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "bestsellers": result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "newest": result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return result;
  }, [localSearch, selectedCategories, selectedFamilies, selectedPriceRange, minRating, sortBy, filterNew]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedFamilies([]);
    setSelectedPriceRange(null);
    setMinRating(0);
    setLocalSearch("");
    setParams({});
  };

  const hasFilters = selectedCategories.length > 0 || selectedFamilies.length > 0 || selectedPriceRange !== null || minRating > 0 || localSearch;

  return (
    <div className="min-h-screen bg-[#080807] pt-20">
      {/* Header */}
      <div className="border-b border-[rgba(201,169,110,0.1)] bg-[#050504]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <motion.div ref={titleRef} initial={{ opacity: 0, y: 30 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }}>
            <p className="text-[10px] tracking-[0.5em] uppercase text-primary mb-3" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>— Browse</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>
              {localSearch ? `Results for "${localSearch}"` : activeCategory || "The Full Collection"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? "fragrance" : "fragrances"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#9A9388] hover:text-foreground transition-colors border border-[rgba(201,169,110,0.15)] hover:border-primary/30 px-3 sm:px-4 py-2.5"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">{filtersOpen ? "Hide" : "Show"} </span>Filters
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-primary hover:text-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
                <X size={11} /> Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search fragrances..."
                className="bg-transparent border border-[rgba(201,169,110,0.15)] focus:border-primary/40 pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors w-44"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0A0908] border border-[rgba(201,169,110,0.15)] text-xs text-[#9A9388] px-2 sm:px-4 py-2.5 outline-none focus:border-primary/40 cursor-pointer max-w-[120px] sm:max-w-none"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="hidden sm:flex border border-[rgba(201,169,110,0.15)]">
              <button onClick={() => setLayout("grid4")} className={`p-2.5 transition-colors ${layout === "grid4" ? "bg-primary text-[#080807]" : "text-muted-foreground hover:text-foreground"}`}>
                <Grid3X3 size={14} strokeWidth={1.5} />
              </button>
              <button onClick={() => setLayout("grid3")} className={`p-2.5 transition-colors ${layout === "grid3" ? "bg-primary text-[#080807]" : "text-muted-foreground hover:text-foreground"}`}>
                <Grid2X2 size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden mb-4">
          <div className="relative">
            <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search fragrances..."
              className="w-full bg-transparent border border-[rgba(201,169,110,0.15)] focus:border-primary/40 pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            />
          </div>
        </div>

        <div className={`${filtersOpen ? "flex flex-col sm:flex-row" : "flex"} gap-6 lg:gap-10`}>
          {/* Sidebar — full width on mobile when open */}
          {filtersOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full sm:w-56 sm:shrink-0"
            >
              <FilterAccordion title="Category">
                <div className="flex flex-col gap-2.5">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleCategory(cat.name)}
                        className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${selectedCategories.includes(cat.name) ? "border-primary bg-primary/20" : "border-[rgba(201,169,110,0.2)] group-hover:border-primary/40"}`}
                      >
                        {selectedCategories.includes(cat.name) && <span className="text-primary text-[8px]">✓</span>}
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        {cat.name}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground/50" style={{ fontFamily: "var(--font-mono)" }}>{cat.productCount}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Fragrance Family">
                <div className="flex flex-col gap-2.5">
                  {fragranceFamilies.map((f) => (
                    <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleFamily(f.name)}
                        className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${selectedFamilies.includes(f.name) ? "border-primary bg-primary/20" : "border-[rgba(201,169,110,0.2)] group-hover:border-primary/40"}`}
                      >
                        {selectedFamilies.includes(f.name) && <span className="text-primary text-[8px]">✓</span>}
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        {f.icon} {f.name}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Price Range">
                <div className="flex flex-col gap-2.5">
                  {PRICE_RANGES.map((range, i) => (
                    <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setSelectedPriceRange(i === selectedPriceRange ? null : i)}
                        className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${selectedPriceRange === i ? "border-primary bg-primary/20" : "border-[rgba(201,169,110,0.2)] group-hover:border-primary/40"}`}
                      >
                        {selectedPriceRange === i && <span className="text-primary text-[8px]">✓</span>}
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Minimum Rating">
                <div className="flex flex-col gap-2.5">
                  {[4.5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${minRating === rating ? "border-primary bg-primary/20" : "border-[rgba(201,169,110,0.2)] group-hover:border-primary/40"}`}
                      >
                        {minRating === rating && <span className="text-primary text-[8px]">✓</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span key={j} className={`text-[10px] ${j < rating ? "text-primary" : "text-muted-foreground/30"}`}>★</span>
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-0.5" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </FilterAccordion>
            </motion.aside>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
                <p className="text-5xl mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>∅</p>
                <div>
                  <h3 className="text-2xl text-foreground mb-2" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>No fragrances found</h3>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Try adjusting your filters or search terms.</p>
                </div>
                <button onClick={clearFilters} className="px-8 py-3 bg-primary text-[#080807] text-xs tracking-[0.25em] uppercase hover:bg-[#E8D5B0] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${layout === "grid4" ? (filtersOpen ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4") : (filtersOpen ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3")}`}>
                {filteredProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
