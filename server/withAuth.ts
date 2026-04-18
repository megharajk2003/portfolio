import type { RequestHandler } from "express";
import { buildAuthDebug, shouldIncludeAuthDebug } from "./authDebug";

export const withAuth: RequestHandler = (req: any, res: any, next: any) => {
  if (req.user?.id) return next();
  const debug = shouldIncludeAuthDebug(req) ? buildAuthDebug(req) : undefined;
  return res.status(401).json({ message: "Unauthorized", debug });
};
