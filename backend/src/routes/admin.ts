import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { getStoreSettings, updateStoreSettings } from "../lib/settingsStore.js";
import { requireAdmin } from "../middleware/auth.js";
import { getFallbackLogs, saveFallbackLog, deleteFallbackLog } from "../lib/keepAliveStore.js";

export const adminRouter = Router();

// Webhook for GitHub Actions keepalive workflow (authenticated via service role key)
adminRouter.post("/keep-alive/record", async (req, res, next) => {
  try {
    const keepaliveKey = (req.headers["x-keepalive-key"] as string) || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!keepaliveKey || keepaliveKey !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized keepalive submission" });
    }

    const { response_status, duration_ms, triggered_by, message, details } = req.body || {};
    const status: "success" | "warning" | "error" | "failed" =
      ["success", "warning", "error", "failed"].includes(req.body?.status) ? req.body.status : "success";
    const payload = {
      status,
      response_status: Number(response_status) || 200,
      duration_ms: Number(duration_ms) || 0,
      triggered_by: triggered_by || "schedule",
      message: message || "Keep-alive ping recorded",
      details: details || {},
    };

    const { data, error } = await supabase.from("keep_alive_logs").insert(payload).select().single();
    if (error) {
      if (error.code === "PGRST205") {
        const fallback = saveFallbackLog(payload);
        return res.json({ success: true, log: fallback, tableExists: false });
      }
      throw new Error(error.message);
    }

    res.json({ success: true, log: data, tableExists: true });
  } catch (err) {
    next(err);
  }
});

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

// Admin Keep-Alive Endpoints
adminRouter.get("/keep-alive", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("keep_alive_logs")
      .select("id, status, response_status, duration_ms, message, triggered_by, details, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (error.code === "PGRST205") {
        const fallback = getFallbackLogs();
        return res.json({ logs: fallback, tableExists: false });
      }
      throw new Error(error.message);
    }

    const logs = (data || []).map((row) => ({
      id: row.id,
      status: row.status,
      responseStatus: row.response_status,
      durationMs: row.duration_ms,
      message: row.message,
      triggeredBy: row.triggered_by,
      details: row.details || {},
      createdAt: row.created_at,
    }));

    if (logs.length === 0) {
      const fallback = getFallbackLogs();
      if (fallback.length > 0) {
        return res.json({ logs: fallback, tableExists: true });
      }
    }

    res.json({ logs, tableExists: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/keep-alive/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("keep_alive_logs").delete().eq("id", id);
    deleteFallbackLog(id);

    if (error && error.code !== "PGRST205") {
      throw new Error(error.message);
    }

    res.json({ success: true, id, message: "Keep-alive log deleted successfully from database." });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/keep-alive/test-ping", async (_req, res, next) => {
  try {
    const start = Date.now();
    const { error: pingError } = await supabase
      .from("store_settings")
      .select("id")
      .limit(1);
    const durationMs = Date.now() - start;

    const status: "error" | "success" = pingError ? "error" : "success";
    const responseStatus = pingError ? 500 : 200;
    const message = pingError
      ? `Supabase ping failed: ${pingError.message}`
      : `Supabase ping successful (HTTP 200 in ${durationMs}ms)`;

    const payload = {
      status,
      response_status: responseStatus,
      duration_ms: durationMs,
      message,
      triggered_by: "admin_test",
      details: {
        pinged_table: "store_settings",
        duration_ms: durationMs,
        timestamp: new Date().toISOString(),
      },
    };

    const { data, error } = await supabase
      .from("keep_alive_logs")
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        const fallback = saveFallbackLog(payload);
        return res.json({ log: fallback, tableExists: false });
      }
      throw new Error(error.message);
    }

    res.json({
      log: {
        id: data.id,
        status: data.status,
        responseStatus: data.response_status,
        durationMs: data.duration_ms,
        message: data.message,
        triggeredBy: data.triggered_by,
        details: data.details || {},
        createdAt: data.created_at,
      },
      tableExists: true,
    });
  } catch (err) {
    next(err);
  }
});
