import type { Request, Response, NextFunction } from "express";

// Admin credentials configuration
const ADMIN_EMAIL = "admin@email.com";
const ADMIN_PASSWORD = "Admin123";

/**
 * Check if a user is an admin based on their email
 */
export function isAdminUser(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Middleware to check if the current user is an admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const userEmail = (req.user as any).email;
  
  if (!isAdminUser(userEmail)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

/**
 * Check if a user object has admin privileges
 */
export function checkUserIsAdmin(user: any): boolean {
  return user && isAdminUser(user.email);
}

/**
 * Get admin user info for responses
 */
export function getAdminUserInfo() {
  return {
    email: ADMIN_EMAIL,
    isAdmin: true,
    role: "admin"
  };
}