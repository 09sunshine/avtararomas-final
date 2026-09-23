import { supabase } from "./supabase.js";

export interface CouponData {
  id: string;
  code: string;
  discount: number;
  uses: number;
  limit: number;
  active: boolean;
  expiry: string;
  minOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

// In-memory store fallback if Supabase table is not yet created
let memoryCoupons: CouponData[] = [];

function mapFromDb(row: any): CouponData {
  return {
    id: row.id,
    code: row.code,
    discount: Number(row.discount),
    uses: Number(row.uses || 0),
    limit: Number(row.limit || 100),
    active: Boolean(row.active),
    expiry: row.expiry || "",
    minOrder: Number(row.min_order || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllCoupons(): Promise<CouponData[]> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return memoryCoupons;
    }

    return (data || []).map(mapFromDb);
  } catch {
    return memoryCoupons;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getCouponByCode(idOrCode: string): Promise<CouponData | null> {
  const normalized = idOrCode.toUpperCase().trim();
  const isUuid = UUID_REGEX.test(idOrCode.trim());

  try {
    let query = supabase.from("coupons").select("*");
    if (isUuid) {
      query = query.or(`code.eq.${normalized},id.eq.${idOrCode.trim()}`);
    } else {
      query = query.eq("code", normalized);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return memoryCoupons.find((c) => c.code === normalized || c.id === idOrCode) || null;
    }

    return mapFromDb(data);
  } catch {
    return memoryCoupons.find((c) => c.code === normalized || c.id === idOrCode) || null;
  }
}

export async function createCoupon(payload: {
  code: string;
  discount: number;
  limit?: number;
  active?: boolean;
  expiry?: string;
  minOrder?: number;
}): Promise<CouponData> {
  const normalizedCode = payload.code.toUpperCase().trim();

  const existing = await getCouponByCode(normalizedCode);
  if (existing) {
    throw new Error(`Coupon code '${normalizedCode}' already exists.`);
  }

  const newCoupon: CouponData = {
    id: `cpn_${Math.random().toString(36).slice(2, 11)}`,
    code: normalizedCode,
    discount: Number(payload.discount),
    uses: 0,
    limit: Number(payload.limit ?? 100),
    active: payload.active ?? true,
    expiry: payload.expiry || "",
    minOrder: Number(payload.minOrder ?? 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: newCoupon.code,
        discount: newCoupon.discount,
        uses: newCoupon.uses,
        limit: newCoupon.limit,
        active: newCoupon.active,
        expiry: newCoupon.expiry || null,
        min_order: newCoupon.minOrder,
      })
      .select("*")
      .single();

    if (error || !data) {
      memoryCoupons.unshift(newCoupon);
      return newCoupon;
    }

    return mapFromDb(data);
  } catch {
    memoryCoupons.unshift(newCoupon);
    return newCoupon;
  }
}

export async function updateCoupon(
  idOrCode: string,
  payload: {
    code?: string;
    discount?: number;
    limit?: number;
    active?: boolean;
    expiry?: string;
    minOrder?: number;
  }
): Promise<CouponData> {
  const existing = await getCouponByCode(idOrCode);
  const codeToUse = (payload.code || existing?.code || idOrCode).toUpperCase().trim();
  const isUuid = UUID_REGEX.test(idOrCode.trim());

  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (payload.code !== undefined) updateData.code = codeToUse;
    if (payload.discount !== undefined) updateData.discount = Number(payload.discount);
    if (payload.limit !== undefined) updateData.limit = Number(payload.limit);
    if (payload.active !== undefined) updateData.active = Boolean(payload.active);
    if (payload.expiry !== undefined) updateData.expiry = payload.expiry || null;
    if (payload.minOrder !== undefined) updateData.min_order = Number(payload.minOrder);

    let query = supabase.from("coupons").update(updateData);
    if (isUuid) {
      query = query.or(`code.eq.${codeToUse},id.eq.${idOrCode.trim()}`);
    } else if (existing?.id && UUID_REGEX.test(existing.id)) {
      query = query.eq("id", existing.id);
    } else {
      query = query.eq("code", codeToUse);
    }

    const { data, error } = await query.select("*").single();

    if (error || !data) {
      if (error) {
        console.error("[Coupons] Supabase update coupon error:", error.message);
      }
      memoryCoupons = memoryCoupons.map((c) => {
        if (c.id === idOrCode || c.code === idOrCode.toUpperCase() || c.code === codeToUse) {
          return {
            ...c,
            code: codeToUse,
            discount: payload.discount !== undefined ? Number(payload.discount) : c.discount,
            limit: payload.limit !== undefined ? Number(payload.limit) : c.limit,
            active: payload.active !== undefined ? Boolean(payload.active) : c.active,
            expiry: payload.expiry !== undefined ? payload.expiry : c.expiry,
            minOrder: payload.minOrder !== undefined ? Number(payload.minOrder) : c.minOrder,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      return memoryCoupons.find((c) => c.code === codeToUse) || existing || (new Date() as any);
    }

    return mapFromDb(data);
  } catch (err: any) {
    console.error("[Coupons] Exception updating coupon:", err);
    memoryCoupons = memoryCoupons.map((c) => {
      if (c.id === idOrCode || c.code === idOrCode.toUpperCase() || c.code === codeToUse) {
        return {
          ...c,
          code: codeToUse,
          discount: payload.discount !== undefined ? Number(payload.discount) : c.discount,
          limit: payload.limit !== undefined ? Number(payload.limit) : c.limit,
          active: payload.active !== undefined ? Boolean(payload.active) : c.active,
          expiry: payload.expiry !== undefined ? payload.expiry : c.expiry,
          minOrder: payload.minOrder !== undefined ? Number(payload.minOrder) : c.minOrder,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    return memoryCoupons.find((c) => c.code === codeToUse) || existing || (new Date() as any);
  }
}

export async function toggleCouponActive(code: string): Promise<CouponData> {
  const coupon = await getCouponByCode(code);
  if (!coupon) throw new Error("Coupon not found");
  return updateCoupon(coupon.code || code, { active: !coupon.active });
}

export async function incrementCouponUses(code: string): Promise<void> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return;
  const newUses = coupon.uses + 1;

  try {
    await supabase
      .from("coupons")
      .update({ uses: newUses, updated_at: new Date().toISOString() })
      .eq("code", coupon.code);

    memoryCoupons = memoryCoupons.map((c) => (c.code === coupon.code ? { ...c, uses: newUses } : c));
  } catch {
    memoryCoupons = memoryCoupons.map((c) => (c.code === coupon.code ? { ...c, uses: newUses } : c));
  }
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const normalized = code.toUpperCase().trim();
  const isUuid = UUID_REGEX.test(code.trim());

  try {
    let query = supabase.from("coupons").delete();
    if (isUuid) {
      query = query.or(`code.eq.${normalized},id.eq.${code.trim()}`);
    } else {
      query = query.eq("code", normalized);
    }
    const { error } = await query;
    if (error) {
      console.error("[Coupons] Delete coupon error:", error.message);
    }
    memoryCoupons = memoryCoupons.filter((c) => c.code !== normalized && c.id !== code);
    return !error;
  } catch (err) {
    console.error("[Coupons] Exception deleting coupon:", err);
    memoryCoupons = memoryCoupons.filter((c) => c.code !== normalized && c.id !== code);
    return true;
  }
}

export async function validateCouponForCart(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  message?: string;
  discountPercent?: number;
  discountAmount?: number;
  code?: string;
}> {
  if (!code || !code.trim()) {
    return { valid: false, message: "Please enter a coupon code" };
  }

  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" };
  }

  if (!coupon.active) {
    return { valid: false, message: "This coupon is no longer active" };
  }

  if (coupon.uses >= coupon.limit) {
    return { valid: false, message: "This coupon usage limit has been reached" };
  }

  if (coupon.expiry) {
    const expiryDate = new Date(coupon.expiry);
    expiryDate.setHours(23, 59, 59, 999);
    if (!isNaN(expiryDate.getTime()) && Date.now() > expiryDate.getTime()) {
      return { valid: false, message: "This coupon has expired" };
    }
  }

  if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrder} required for this coupon`,
    };
  }

  const discountAmount = Math.round((subtotal * coupon.discount) / 100);

  return {
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discount,
    discountAmount,
    message: `✓ Coupon ${coupon.code} applied! (${coupon.discount}% off)`,
  };
}
