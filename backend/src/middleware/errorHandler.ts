import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/errors.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Ensure CORS headers are attached on error responses so browsers don't mask error details
  const origin = req.headers.origin;
  if (origin && !res.getHeader("Access-Control-Allow-Origin")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    console.error("Zod Validation Error:", details);
    return res.status(400).json({ error: `Validation Error: ${details}` });
  }

  console.error("Unhandled Error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ error: message });
}

