import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem, Product } from "../types";

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
}

type CartAction =
  | { type: "ADD"; product: Product; quantity?: number; size?: string; color?: string }
  | { type: "REMOVE"; productId: string; size?: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number; size?: string }
  | { type: "SET_COUPON"; coupon: AppliedCoupon | null }
  | { type: "CLEAR" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  total: number;
  itemCount: number;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id && i.size === action.size
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id && i.size === action.size
              ? { ...i, quantity: i.quantity + (action.quantity ?? 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity ?? 1, size: action.size, color: action.color }],
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) =>
          action.size !== undefined
            ? !(i.product.id === action.productId && i.size === action.size)
            : i.product.id !== action.productId
        ),
      };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) =>
            action.size !== undefined
              ? !(i.product.id === action.productId && i.size === action.size)
              : i.product.id !== action.productId
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) => {
          const match =
            action.size !== undefined
              ? i.product.id === action.productId && i.size === action.size
              : i.product.id === action.productId;
          return match ? { ...i, quantity: action.quantity } : i;
        }),
      };
    case "SET_COUPON":
      return { ...state, coupon: action.coupon };
    case "CLEAR":
      return { items: [], coupon: null };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const stored = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
  const initialState: CartState = stored
    ? { coupon: null, ...JSON.parse(stored) }
    : { items: [], coupon: null };
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const total = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return <CartContext.Provider value={{ state, dispatch, total, itemCount }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
