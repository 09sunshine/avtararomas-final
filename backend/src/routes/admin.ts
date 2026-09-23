import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { getStoreSettings, updateStoreSettings } from "../lib/settingsStore.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();

// Protect all admin endpoints with administrator authentication
adminRouter.use(requireAdmin);

const CATEGORY_COLORS = ["#C9A96E", "#E8D5B0", "#9A7A4A", "#5C4A2A", "#D4AF37", "#B8860B"];

adminRouter.get("/overview", async (_req, res, next) => {
  try {
    const [ordersResult, reviewsResult, customersResult, productsResult, orderItemsResult] = await Promise.all([
      supabase.from("orders").select("id, status, total, created_at, order_number, customer_name, customer_email").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, rating, comment, created_at, product_name, product_slug, users!inner(id, name, avatar)").order("created_at", { ascending: false }),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("products").select("id, category, stock"),
      supabase.from("order_items").select("product_id, quantity, price"),
    ]);

    if (ordersResult.error) throw new Error(ordersResult.error.message);
    if (reviewsResult.error) throw new Error(reviewsResult.error.message);
    if (customersResult.error) throw new Error(customersResult.error.message);

    const allOrders = ordersResult.data || [];
    const validOrders = allOrders.filter((o) => o.status !== "cancelled");

    const recentOrders = allOrders.slice(0, 5).map((order) => ({
      id: order.order_number,
      total: Number(order.total),
      status: order.status,
      date: order.created_at,
      customer: order.customer_name,
      email: order.customer_email,
    }));

    const recentReviews = (reviewsResult.data || []).slice(0, 5).map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      date: review.created_at,
      productName: review.product_name,
      productSlug: review.product_slug,
      user: review.users,
    }));

    const revenue = validOrders.reduce((sum, order) => sum + Number(order.total), 0);

    // Calculate Last 6 Months Revenue Trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months: Array<{ monthKey: string; monthLabel: string; year: number; monthIdx: number; revenue: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthLabel = monthNames[mIdx];
      const monthKey = `${yr}-${String(mIdx + 1).padStart(2, "0")}`;
      last6Months.push({ monthKey, monthLabel, year: yr, monthIdx: mIdx, revenue: 0 });
    }

    validOrders.forEach((o) => {
      if (!o.created_at) return;
      const orderDate = new Date(o.created_at);
      const oMonthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
      const target = last6Months.find((m) => m.monthKey === oMonthKey);
      if (target) {
        target.revenue += Number(o.total || 0);
      }
    });

    const revenueData = last6Months.map((m) => ({
      month: m.monthLabel,
      revenue: Math.round(m.revenue),
    }));

    // Calculate Sales / Products by Category Breakdown
    const categoryTotals: Record<string, number> = {};
    const products = productsResult.data || [];

    if (orderItemsResult.data && orderItemsResult.data.length > 0 && products.length > 0) {
      const productCategoryMap: Record<string, string> = {};
      products.forEach((p) => {
        productCategoryMap[p.id] = p.category || "Other";
      });

      orderItemsResult.data.forEach((item) => {
        const cat = productCategoryMap[item.product_id] || "Perfume";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(item.quantity || 1);
      });
    }

    // Fallback: If no order items exist yet, summarize product catalog counts
    if (Object.keys(categoryTotals).length === 0 && products.length > 0) {
      products.forEach((p) => {
        const cat = p.category || "Perfume";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + 1;
      });
    }

    const totalCategorySum = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
    const categoryData = Object.entries(categoryTotals).map(([name, count], idx) => ({
      name,
      value: Math.round((count / totalCategorySum) * 100),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));

    res.json({
      totalOrders: allOrders.length,
      totalCustomers: customersResult.count || 0,
      totalReviews: reviewsResult.data?.length || 0,
      revenue,
      recentOrders,
      recentReviews,
      revenueData,
      categoryData,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, status, total, subtotal, shipping, discount, coupon_code, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json((data || []).map((order) => ({
      id: order.order_number,
      customer: order.customer_name,
      email: order.customer_email,
      status: order.status,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      couponCode: order.coupon_code,
      date: order.created_at,
    })));
  } catch (err) {
    next(err);
  }
});

// Admin Store Settings Endpoints
adminRouter.get("/settings", async (_req, res, next) => {
  try {
    const settings = await getStoreSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

adminRouter.put("/settings", async (req, res, next) => {
  try {
    const updated = await updateStoreSettings(req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
