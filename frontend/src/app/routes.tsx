import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import MyOrders from "./pages/account/Orders";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "shop/:slug", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "wishlist", Component: Wishlist },
      { path: "checkout", Component: Checkout },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "reset-password", Component: ResetPassword },
      { path: "account/orders", Component: MyOrders },
      { path: "admin", Component: AdminDashboard },
      { path: "about", Component: About },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
      { path: "*", Component: Home },
    ],
  },
]);
