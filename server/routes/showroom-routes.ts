import { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../auth";
import { UserRole, ShowroomStatus, insertShowroomSchema } from "@shared/schema";
import { RouterConfig } from "./types";

export const showroomRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all showrooms
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

    // Get featured showrooms
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

    // Get showroom by user ID
    app.get("/api/showrooms/user/:userId", requireAuth, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        
        // Only allow users to view their own showroom or admin to view any showroom
        if (userId !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: "Unauthorized to view this showroom" });
        }
        
        const showroom = await storage.getShowroomByUserId(userId);
        if (!showroom) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        res.json(showroom);
      } catch (error) {
        res.status(500).json({ error: "Failed to get showroom" });
      }
    });

    // Get showroom by ID
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

    // Create showroom (only for sellers)
    app.post("/api/showrooms", requireRole(UserRole.SELLER), async (req, res) => {
      try {
        // Check if seller already has a showroom
        const existingShowroom = await storage.getShowroomByUserId(req.user!.id);
        if (existingShowroom) {
          return res.status(400).json({ error: "Seller already has a showroom" });
        }
        
        // Validate request body
        const validationResult = insertShowroomSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Create showroom with default values for fields not provided
        const showroomWithDefaults = {
          ...validationResult.data,
          logo: validationResult.data.logo || "https://betterplaceholder.com/400x400?text=Logo&bg_color=122B45&text_color=ffffff",
          headerImage: validationResult.data.headerImage || "https://betterplaceholder.com/1200x400?text=Welcome&bg_color=122B45&text_color=ffffff",
          status: ShowroomStatus.PUBLISHED,
        };
        
        const showroom = await storage.createShowroom(showroomWithDefaults, req.user!.id);
        res.status(201).json(showroom);
      } catch (error) {
        console.error("Error creating showroom:", error);
        res.status(500).json({ error: "Failed to create showroom" });
      }
    });

    // Update showroom
    app.put("/api/showrooms/:id", requireAuth, async (req, res) => {
      try {
        const showroomId = parseInt(req.params.id);
        const showroom = await storage.getShowroom(showroomId);
        
        if (!showroom) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        // Only allow showroom owner or admin to update
        if (showroom.userId !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: "Unauthorized to update this showroom" });
        }
        
        // Prepare update data, preserve existing values for empty fields
        const updateData = { ...req.body };
        
        // If logo is being set to empty string or null, maintain the existing logo
        if (updateData.logo === "" || updateData.logo === null) {
          updateData.logo = showroom.logo || "https://betterplaceholder.com/400x400?text=Logo&bg_color=122B45&text_color=ffffff";
        }
        
        // If headerImage is being set to empty string or null, maintain the existing headerImage
        if (updateData.headerImage === "" || updateData.headerImage === null) {
          updateData.headerImage = showroom.headerImage || "https://betterplaceholder.com/1200x400?text=Welcome&bg_color=122B45&text_color=ffffff";
        }
        
        const updatedShowroom = await storage.updateShowroom(showroomId, updateData);
        console.log("Showroom updated successfully:", updatedShowroom);
        res.json(updatedShowroom);
      } catch (error) {
        console.error("Error updating showroom:", error);
        res.status(500).json({ error: "Failed to update showroom" });
      }
    });
  }
};