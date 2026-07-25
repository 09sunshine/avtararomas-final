import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./stores/cartStore";
import { WishlistProvider } from "./stores/wishlistStore";
import { AuthProvider } from "./stores/authStore";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={router} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}