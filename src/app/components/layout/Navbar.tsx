import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Search, Heart, ShoppingBag, Menu, X, User, ChevronDown, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useCart } from "../../stores/cartStore";
import { useWishlist } from "../../stores/wishlistStore";
import { useAuth } from "../../stores/authStore";
import { motion } from "motion/react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { state: wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Collection", href: "/shop" },
    { label: "Fragrance Families", href: "/shop?view=families" },
    { label: "Bestsellers", href: "/shop?sort=bestsellers" },
    { label: "Our Story", href: "/about" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-[#080807]/96 backdrop-blur-xl border-b border-[rgba(201,169,110,0.12)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex flex-col items-start leading-none">
            <span
              className="hidden sm:block text-[10px] tracking-[0.5em] text-primary uppercase font-light"
              style={{ fontFamily: "var(--font-body)" }}
            >
              artisan perfumes
            </span>
            <span
              className="text-lg sm:text-2xl tracking-[0.12em] text-foreground group-hover:text-primary transition-colors duration-500 whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "0.12em" }}
            >
              AVTAR AROMAS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-sm tracking-[0.12em] uppercase text-[#D9D2C7] hover:text-primary transition-colors duration-400 group"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#D9D2C7] hover:text-primary transition-colors duration-300"
              aria-label="Search"
            >
              <Search size={17} strokeWidth={1.5} />
            </button>

            <Link to="/wishlist" className="relative p-2 text-[#D9D2C7] hover:text-primary transition-colors duration-300">
              <Heart size={17} strokeWidth={1.5} />
              {wishlist.items.length > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary text-[#080807] text-[8px] font-bold rounded-full flex items-center justify-center" style={{ fontFamily: "var(--font-mono)" }}>
                  {wishlist.items.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 text-[#D9D2C7] hover:text-primary transition-colors duration-300">
              <ShoppingBag size={17} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary text-[#080807] text-[8px] font-bold rounded-full flex items-center justify-center" style={{ fontFamily: "var(--font-mono)" }}>
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-[#D9D2C7] hover:text-primary transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                    {user?.name.charAt(0)}
                  </div>
                  <ChevronDown size={12} className={`transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-[#0F0E0D] border border-[rgba(201,169,110,0.15)] shadow-2xl z-50">
                    <div className="px-5 py-4 border-b border-[rgba(201,169,110,0.1)]">
                      <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>{user?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{user?.email}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-xs tracking-wider uppercase text-[#D9D2C7] hover:text-primary hover:bg-primary/5 transition-all duration-300">
                        <LayoutDashboard size={13} strokeWidth={1.5} />
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/account/orders" className="flex items-center gap-3 px-5 py-3 text-xs tracking-wider uppercase text-[#D9D2C7] hover:text-primary hover:bg-primary/5 transition-all duration-300">
                      <ShoppingBag size={13} strokeWidth={1.5} />
                      My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs tracking-wider uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
                    >
                      <LogOut size={13} strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#D9D2C7] hover:text-primary transition-colors duration-300 border border-[rgba(201,169,110,0.25)] hover:border-primary/50 px-4 py-2"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                <User size={13} strokeWidth={1.5} />
                Sign In
              </Link>
            )}

            <button
              className="lg:hidden p-2 text-[#D9D2C7] hover:text-primary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-[#080807]/98 backdrop-blur-xl border-t border-[rgba(201,169,110,0.1)] px-8 py-8 flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-lg tracking-[0.1em] text-[#D9D2C7] hover:text-primary transition-colors duration-300 border-b border-[rgba(201,169,110,0.08)] pb-4"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex flex-col gap-0 border-t border-[rgba(201,169,110,0.1)] pt-4 mt-2">
                {/* User info */}
                <div className="flex items-center gap-3 px-1 pb-4 border-b border-[rgba(201,169,110,0.08)]">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}>{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground tracking-wider truncate max-w-[180px]" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>{user?.email}</p>
                  </div>
                </div>

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 py-3.5 border-b border-[rgba(201,169,110,0.08)] text-xs tracking-[0.2em] uppercase text-[#D9D2C7] hover:text-primary transition-colors duration-300"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    <LayoutDashboard size={14} strokeWidth={1.5} />
                    Admin Panel
                  </Link>
                )}

                <Link
                  to="/account/orders"
                  className="flex items-center gap-3 py-3.5 border-b border-[rgba(201,169,110,0.08)] text-xs tracking-[0.2em] uppercase text-[#D9D2C7] hover:text-primary transition-colors duration-300"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  <Package size={14} strokeWidth={1.5} />
                  My Orders
                </Link>

                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 py-3.5 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-red-400 transition-colors duration-300 mt-1"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="mt-2 py-3 text-center text-xs tracking-[0.3em] uppercase border border-primary/30 text-primary hover:bg-primary/5 transition-colors">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#080807]/95 backdrop-blur-xl flex items-start justify-center pt-32 px-8"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="w-full max-w-2xl">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-6 text-center" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>
              Search our collection
            </p>
            <form onSubmit={handleSearch} className="relative">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Oud, Rose, Sandalwood..."
                className="w-full bg-transparent border-b border-[rgba(201,169,110,0.3)] focus:border-primary pb-4 text-3xl text-foreground placeholder:text-muted-foreground/30 outline-none transition-colors duration-500 text-center"
                style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300 }}
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-0 top-0 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-6 tracking-wider" style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}>
              Press Enter to search
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
}
