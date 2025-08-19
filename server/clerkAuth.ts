import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Clerk-compatible authentication middleware
// Since we're using Clerk on the frontend, we just need to validate the session
// and provide a simple auth check for API routes

export async function setupAuth(app: Express) {
  // No server-side auth setup needed for Clerk
  // Clerk handles authentication on the client side
  console.log("Clerk authentication configured - client-side only");
}

// Simple middleware to check if user is authenticated
// In a real implementation, you'd verify the Clerk session token
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // For now, we'll allow all requests since Clerk handles auth on the client
  // In production, you'd verify the Clerk JWT token here
  next();
};

// Placeholder for user extraction from Clerk
export const extractUserFromClerk = async (clerkUserId: string) => {
  // This would typically sync Clerk user data with your database
  const user = await storage.getUser(clerkUserId);
  if (!user) {
    // Create user if doesn't exist
    return await storage.upsertUser({
      id: clerkUserId,
      email: "", // Would be populated from Clerk
      firstName: "",
      lastName: "",
      profileImageUrl: "",
    });
  }
  return user;
};
