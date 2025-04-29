import { Express } from "express";
import { storage } from "../../storage";
import { requireAuth, requireRole } from "../../auth";
import { UserRole, SubscriptionTier, insertCarSchema } from "@shared/schema";
import { RouterConfig } from "../types";

export const privateCarRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Create car (only for sellers)
    app.post("/api/cars", requireRole(UserRole.SELLER), async (req, res) => {
      try {
        // Get seller's showroom
        const showroom = await storage.getShowroomByUserId(req.user!.id);
        if (!showroom) {
          return res.status(400).json({ error: "Seller must create a showroom first" });
        }
        
        // Check subscription limits
        const subscription = await storage.getSubscriptionByUserId(req.user!.id);
        if (!subscription) {
          return res.status(400).json({ error: "Seller must have an active subscription" });
        }
        
        if (subscription.tier === SubscriptionTier.FREE) {
          const carCount = await storage.getCarCountByShowroomId(showroom.id);
          if (carCount >= 3) {
            return res.status(403).json({ 
              error: "Free tier limited to 3 listings. Please upgrade your subscription." 
            });
          }
        }
        
        // Validate request body
        const validationResult = insertCarSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Create car with showroom ID
        const carData = {
          ...validationResult.data,
          showroomId: showroom.id,
          isFeatured: false, // Default to not featured
          images: validationResult.data.images && validationResult.data.images.length > 0 
            ? validationResult.data.images 
            : ["https://betterplaceholder.com/800x450?text=Car+Image&bg_color=122B45&text_color=ffffff"],
        };
        
        const car = await storage.createCar(carData);
        res.status(201).json(car);
      } catch (error) {
        console.error('Error creating car:', error);
        res.status(500).json({ error: "Failed to create car" });
      }
    });

    // Update car
    app.put("/api/cars/:id", requireAuth, async (req, res) => {
      try {
        const carId = parseInt(req.params.id);
        const car = await storage.getCar(carId);
        
        if (!car) {
          return res.status(404).json({ error: "Car not found" });
        }
        
        // Get the car's showroom
        const showroom = await storage.getShowroom(car.showroomId);
        if (!showroom) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        // Only the showroom owner or admin can update the car
        if (showroom.userId !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: "You don't have permission to update this car" });
        }
        
        // Prepare update data, preserving placeholder images if necessary
        const updateData = { ...req.body };
        
        // If images is being set to empty, use placeholder array
        if (updateData.images && (
            updateData.images.length === 0 || 
            updateData.images[0] === "" || 
            updateData.images[0] === null
        )) {
          updateData.images = ["https://betterplaceholder.com/800x450?text=Car+Image&bg_color=122B45&text_color=ffffff"];
        }
        
        const updatedCar = await storage.updateCar(carId, updateData);
        res.json(updatedCar);
      } catch (error) {
        res.status(500).json({ error: "Failed to update car" });
      }
    });

    // Delete car
    app.delete("/api/cars/:id", requireAuth, async (req, res) => {
      try {
        const carId = parseInt(req.params.id);
        const car = await storage.getCar(carId);
        
        if (!car) {
          return res.status(404).json({ error: "Car not found" });
        }
        
        // Get the car's showroom
        const showroom = await storage.getShowroom(car.showroomId);
        if (!showroom) {
          return res.status(404).json({ error: "Showroom not found" });
        }
        
        // Only the showroom owner or admin can delete the car
        if (showroom.userId !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: "You don't have permission to delete this car" });
        }
        
        const deleted = await storage.deleteCar(carId);
        if (deleted) {
          res.sendStatus(204);
        } else {
          res.status(500).json({ error: "Failed to delete car" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to delete car" });
      }
    });
  }
};