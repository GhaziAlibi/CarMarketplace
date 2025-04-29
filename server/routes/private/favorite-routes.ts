import { Express } from "express";
import { storage } from "../../storage";
import { requireAuth } from "../../auth";
import { insertFavoriteSchema } from "@shared/schema";
import { RouterConfig } from "../types";

export const privateFavoriteRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all favorites for current user
    app.get("/api/favorites", requireAuth, async (req, res) => {
      try {
        const favorites = await storage.getFavoritesByUser(req.user!.id);
        res.json(favorites);
      } catch (error) {
        res.status(500).json({ error: "Failed to get favorites" });
      }
    });

    // Check if car is favorited by current user
    app.get("/api/favorites/car/:carId", requireAuth, async (req, res) => {
      try {
        const carId = parseInt(req.params.carId);
        if (isNaN(carId)) {
          return res.status(400).json({ error: "Invalid car ID" });
        }
        
        const isFavorite = await storage.isFavorite(req.user!.id, carId);
        res.json({ isFavorite });
      } catch (error) {
        res.status(500).json({ error: "Failed to check favorite status" });
      }
    });

    // Add car to favorites
    app.post("/api/favorites", requireAuth, async (req, res) => {
      try {
        // Validate request body
        const validationResult = insertFavoriteSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Check if already favorited
        const isFavorite = await storage.isFavorite(req.user!.id, validationResult.data.carId);
        if (isFavorite) {
          return res.status(400).json({ error: "Car already in favorites" });
        }
        
        // Create favorite
        const favoriteData = {
          ...validationResult.data,
          userId: req.user!.id,
        };
        
        const favorite = await storage.createFavorite(favoriteData);
        res.status(201).json(favorite);
      } catch (error) {
        res.status(500).json({ error: "Failed to add favorite" });
      }
    });

    // Remove car from favorites
    app.delete("/api/favorites/:id", requireAuth, async (req, res) => {
      try {
        const favoriteId = parseInt(req.params.id);
        const favorite = await storage.getFavorite(favoriteId);
        
        if (!favorite) {
          return res.status(404).json({ error: "Favorite not found" });
        }
        
        // Only the owner can remove a favorite
        if (favorite.userId !== req.user!.id) {
          return res.status(403).json({ error: "Not authorized to remove this favorite" });
        }
        
        const deleted = await storage.deleteFavorite(favoriteId);
        if (deleted) {
          res.sendStatus(204);
        } else {
          res.status(500).json({ error: "Failed to remove favorite" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to remove favorite" });
      }
    });
  }
};