import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./stores/cartStore";
import { WishlistProvider } from "./stores/wishlistStore";
import { AuthProvider } from "./stores/authStore";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}