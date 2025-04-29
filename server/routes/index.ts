import { Express } from "express";
import { registerPublicRoutes } from "./public";
import { registerPrivateRoutes } from "./private";

// Register all routes for the application
export function registerAllRoutes(app: Express): void {
  // Register public routes first
  registerPublicRoutes(app);
  
  // Then register private routes that require authentication
  registerPrivateRoutes(app);
}