import { Express } from "express";
import { publicCarRoutes } from "./car-routes";
import { publicShowroomRoutes } from "./showroom-routes";
import { publicAuthRoutes } from "./auth-routes";

// Register all public routes
export function registerPublicRoutes(app: Express): void {
  publicCarRoutes.registerRoutes(app);
  publicShowroomRoutes.registerRoutes(app);
  publicAuthRoutes.registerRoutes(app);
}