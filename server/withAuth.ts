import type { RequestHandler } from "express";

export const withAuth: RequestHandler = (req: any, res: any, next: any) => {
  if (req.user?.id) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

