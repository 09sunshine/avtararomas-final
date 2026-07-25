import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  const status = (err as any).status ?? 500;
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.message,
  });
}
