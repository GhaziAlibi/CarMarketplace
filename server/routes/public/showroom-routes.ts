import { Express } from "express";
import { storage } from "../../storage";
import { UserRole, ShowroomStatus } from "@shared/schema";
import { RouterConfig } from "../types";

export const publicShowroomRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all showrooms - public endpoint with filtering
    app.get("/api/showrooms", async (req, res) => {
      try {
        const allShowrooms = await storage.getAllShowrooms();
        
        // If user is admin, return all showrooms
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        if (isAdmin) {
          return res.json(allShowrooms);
        }
        
        // For non-admin users, only return published showrooms
        const publishedShowrooms = allShowrooms.filter(showroom => showroom.status === ShowroomStatus.PUBLISHED);
        
        // If user is authenticated, also include their own showroom
        if (req.isAuthenticated() && req.user) {
          const userShowroom = await storage.getShowroomByUserId(req.user.id);
          if (userShowroom && !publishedShowrooms.some(s => s.id === userShowroom.id)) {
            publishedShowrooms.push(userShowroom);
          }
        }
        
        res.json(publishedShowrooms);
      } catch (error) {
        console.error("Error fetching showrooms:", error);
        res.status(500).json({ error: "Failed to get showrooms" });
      }
    });

    // Get featured showrooms - public endpoint
    app.get("/api/showrooms/featured", async (req, res) => {
      try {
        const allFeaturedShowrooms = await storage.getFeaturedShowrooms();
        
        // If user is admin, return all featured showrooms
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        if (isAdmin) {
          return res.json(allFeaturedShowrooms);
        }
        
        // For non-admin users, only return published featured showrooms
        const publishedShowrooms = allFeaturedShowrooms.filter(
          showroom => showroom.status === ShowroomStatus.PUBLISHED
        );
        
        res.json(publishedShowrooms);
      } catch (error) {
        res.status(500).json({ error: "Failed to get featured showrooms" });
      }
    });

    // Get showroom by ID - public endpoint with authorization check
    app.get("/api/showrooms/:id", async (req, res) => {
      try {
        const showroomId = parseInt(req.params.id);
        const showroom = await storage.getShowroom(showroomId);
        
        if (!showroom) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        // Check if showroom is published or if the request is from showroom owner or admin
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        const isOwner = req.isAuthenticated() && req.user?.id === showroom.userId;
        
        if (showroom.status !== ShowroomStatus.PUBLISHED && !isAdmin && !isOwner) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        res.json(showroom);
      } catch (error) {
        res.status(500).json({ error: "Failed to get showroom" });
      }
    });

    // Get cars by showroom ID - public endpoint with authorization check
    app.get("/api/showrooms/:id/cars", async (req, res) => {
      try {
        const showroomId = parseInt(req.params.id);
        const showroom = await storage.getShowroom(showroomId);
        
        if (!showroom) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        // Only return cars from published showrooms to non-admins and non-owners
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        const isOwner = req.isAuthenticated() && req.user?.id === showroom.userId;
        
        if (showroom.status !== ShowroomStatus.PUBLISHED && !isAdmin && !isOwner) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        const cars = await storage.getCarsByShowroom(showroomId);
        res.json(cars);
      } catch (error) {
        res.status(500).json({ error: "Failed to get showroom cars" });
      }
    });
  }
};