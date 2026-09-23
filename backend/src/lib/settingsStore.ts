import { supabase } from "./supabase.js";

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  phone: string;
  gst: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  orderAlerts: boolean;
  stockAlerts: boolean;
  newsAlerts: boolean;
  instagram: string;
  facebook: string;
  maintenanceMode: boolean;
  updatedAt?: string;
}

const defaultSettings: StoreSettings = {
  storeName: "Avtar Aromas",
  supportEmail: "hello@avtararomas.com",
  phone: "+91 98765 43210",
  gst: "29ABCDE1234F1Z5",
  currency: "INR",
  freeShippingThreshold: 999,
  standardShippingFee: 149,
  orderAlerts: true,
  stockAlerts: true,
  newsAlerts: false,
  instagram: "@avtararomas",
  facebook: "avtararomas",
  maintenanceMode: false,
};

let memorySettings: StoreSettings = { ...defaultSettings };

function mapFromDb(row: any): StoreSettings {
  return {
    storeName: row.store_name ?? defaultSettings.storeName,
    supportEmail: row.support_email ?? defaultSettings.supportEmail,
    phone: row.phone ?? defaultSettings.phone,
    gst: row.gst ?? defaultSettings.gst,
    currency: row.currency ?? defaultSettings.currency,
    freeShippingThreshold: Number(row.free_shipping_threshold ?? defaultSettings.freeShippingThreshold),
    standardShippingFee: Number(row.standard_shipping_fee ?? defaultSettings.standardShippingFee),
    orderAlerts: Boolean(row.order_alerts ?? defaultSettings.orderAlerts),
    stockAlerts: Boolean(row.stock_alerts ?? defaultSettings.stockAlerts),
    newsAlerts: Boolean(row.news_alerts ?? defaultSettings.newsAlerts),
    instagram: row.instagram ?? defaultSettings.instagram,
    facebook: row.facebook ?? defaultSettings.facebook,
    maintenanceMode: Boolean(row.maintenance_mode ?? defaultSettings.maintenanceMode),
    updatedAt: row.updated_at,
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return memorySettings;
    }

    const loaded = mapFromDb(data);
    memorySettings = { ...loaded };
    return loaded;
  } catch {
    return memorySettings;
  }
}

export async function updateStoreSettings(payload: Partial<StoreSettings>): Promise<StoreSettings> {
  const updated: StoreSettings = {
    ...memorySettings,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  memorySettings = { ...updated };

  try {
    const dbPayload = {
      id: "default",
      store_name: updated.storeName,
      support_email: updated.supportEmail,
      phone: updated.phone,
      gst: updated.gst,
      currency: updated.currency,
      free_shipping_threshold: updated.freeShippingThreshold,
      standard_shipping_fee: updated.standardShippingFee,
      order_alerts: updated.orderAlerts,
      stock_alerts: updated.stockAlerts,
      news_alerts: updated.newsAlerts,
      instagram: updated.instagram,
      facebook: updated.facebook,
      maintenance_mode: updated.maintenanceMode,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("store_settings")
      .upsert(dbPayload, { onConflict: "id" })
      .select("*")
      .single();

    if (!error && data) {
      return mapFromDb(data);
    }
  } catch (err) {
    console.error("Failed to update store settings in DB:", err);
  }

  return updated;
}
