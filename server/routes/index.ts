import { Express } from "express";
import { userRoutes } from "./user-routes";
import { showroomRoutes } from "./showroom-routes";
import { carRoutes } from "./car-routes";
import { messageRoutes } from "./message-routes";
import { favoriteRoutes } from "./favorite-routes";
import { subscriptionRoutes } from "./subscription-routes";

export function registerAllRoutes(app: Express): void {
  // Register all route modules
  userRoutes.registerRoutes(app);
  showroomRoutes.registerRoutes(app);
  carRoutes.registerRoutes(app);
  messageRoutes.registerRoutes(app);
  favoriteRoutes.registerRoutes(app);
  subscriptionRoutes.registerRoutes(app);
}