import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Product } from "../types";

interface WishlistState {
  items: Product[];
}

type WishlistAction = { type: "TOGGLE"; product: Product } | { type: "REMOVE"; productId: string };

const WishlistContext = createContext<{
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
  isWishlisted: (id: string) => boolean;
} | null>(null);

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "TOGGLE": {
      const exists = state.items.some((i) => i.id === action.product.id);
      return { items: exists ? state.items.filter((i) => i.id !== action.product.id) : [...state.items, action.product] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.productId) };
    default:
      return state;
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const stored = typeof window !== "undefined" ? localStorage.getItem("wishlist") : null;
  const [state, dispatch] = useReducer(reducer, stored ? JSON.parse(stored) : { items: [] });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(state));
  }, [state]);

  const isWishlisted = (id: string) => state.items.some((i) => i.id === id);

  return <WishlistContext.Provider value={{ state, dispatch, isWishlisted }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}
