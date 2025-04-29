import { Express } from "express";
import { requireAuth } from "../../auth";
import { privateUserRoutes } from "./user-routes";
import { privateCarRoutes } from "./car-routes";
import { privateShowroomRoutes } from "./showroom-routes";
import { privateMessageRoutes } from "./message-routes";
import { privateFavoriteRoutes } from "./favorite-routes";
import { privateSubscriptionRoutes } from "./subscription-routes";
import { privateAdminRoutes } from "./admin-routes";

// Register all private routes
export function registerPrivateRoutes(app: Express): void {
  // Middleware to ensure authentication for specific paths
  app.use("/api/users/:id", requireAuth);
  
  // Register all private route handlers
  privateUserRoutes.registerRoutes(app);
  privateCarRoutes.registerRoutes(app);
  privateShowroomRoutes.registerRoutes(app);
  privateMessageRoutes.registerRoutes(app);
  privateFavoriteRoutes.registerRoutes(app);
  privateSubscriptionRoutes.registerRoutes(app);
  privateAdminRoutes.registerRoutes(app);
}