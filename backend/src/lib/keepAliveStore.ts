import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface KeepAliveRecord {
  id: string;
  status: "success" | "warning" | "error" | "failed";
  responseStatus: number;
  durationMs: number;
  message: string;
  triggeredBy: string;
  details: Record<string, any>;
  createdAt: string;
}

const FALLBACK_FILE = path.resolve(process.cwd(), "data", "keep_alive_fallback.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function getFallbackLogs(): KeepAliveRecord[] {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read fallback keep-alive logs:", err);
  }
  return [];
}

export function saveFallbackLog(payload: {
  status: "success" | "warning" | "error" | "failed";
  response_status?: number;
  duration_ms?: number;
  message?: string;
  triggered_by?: string;
  details?: Record<string, any>;
}): KeepAliveRecord {
  const logs = getFallbackLogs();
  const newRecord: KeepAliveRecord = {
    id: crypto.randomUUID(),
    status: payload.status,
    responseStatus: payload.response_status ?? 200,
    durationMs: payload.duration_ms ?? 0,
    message: payload.message || "Keep-alive ping recorded",
    triggeredBy: payload.triggered_by || "schedule",
    details: payload.details || {},
    createdAt: new Date().toISOString(),
  };

  logs.unshift(newRecord);
  const trimmed = logs.slice(0, 100);

  try {
    ensureDirectoryExistence(FALLBACK_FILE);
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save fallback keep-alive log:", err);
  }

  return newRecord;
}

export function deleteFallbackLog(id: string): boolean {
  const logs = getFallbackLogs();
  const filtered = logs.filter((l) => l.id !== id);
  if (filtered.length === logs.length) return false;

  try {
    ensureDirectoryExistence(FALLBACK_FILE);
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to delete fallback keep-alive log:", err);
    return false;
  }
}
