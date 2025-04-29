import { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../auth";
import { UserRole, ShowroomStatus, SubscriptionTier, insertCarSchema, carSearchSchema } from "@shared/schema";
import { RouterConfig } from "./types";

export const carRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all cars
    app.get("/api/cars", async (req, res) => {
      try {
        // Get all cars
        const allCars = await storage.getAllCars();
        
        // If user is admin, return all cars
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        if (isAdmin) {
          return res.json(allCars);
        }
        
        // For non-admin users, filter cars from published showrooms
        const publishedShowrooms = await storage.getShowroomsByStatus(ShowroomStatus.PUBLISHED);
        const publishedShowroomIds = publishedShowrooms.map(showroom => showroom.id);
        
        // If user is authenticated, add their own showroom regardless of status
        if (req.isAuthenticated() && req.user) {
          const userShowroom = await storage.getShowroomByUserId(req.user.id);
          if (userShowroom && !publishedShowroomIds.includes(userShowroom.id)) {
            publishedShowroomIds.push(userShowroom.id);
          }
        }
        
        // Filter cars to only include those from published showrooms or user's own showroom
        const filteredCars = allCars.filter(car => publishedShowroomIds.includes(car.showroomId));
        res.json(filteredCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ error: "Failed to get cars" });
      }
    });

    // Get featured cars
    app.get("/api/cars/featured", async (req, res) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const allFeaturedCars = await storage.getFeaturedCars(limit);
        
        // If user is admin, return all featured cars regardless of showroom status
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        if (isAdmin) {
          return res.json(allFeaturedCars);
        }
        
        // For non-admin users, filter featured cars from published showrooms
        const publishedShowrooms = await storage.getShowroomsByStatus(ShowroomStatus.PUBLISHED);
        const publishedShowroomIds = publishedShowrooms.map(showroom => showroom.id);
        
        // If user is authenticated, add their own showroom regardless of status
        if (req.isAuthenticated() && req.user) {
          const userShowroom = await storage.getShowroomByUserId(req.user.id);
          if (userShowroom && !publishedShowroomIds.includes(userShowroom.id)) {
            publishedShowroomIds.push(userShowroom.id);
          }
        }
        
        // Filter featured cars to only include those from published showrooms or user's own showroom
        const filteredFeaturedCars = allFeaturedCars.filter(
          car => publishedShowroomIds.includes(car.showroomId)
        );
        
        res.json(filteredFeaturedCars);
      } catch (error) {
        res.status(500).json({ error: "Failed to get featured cars" });
      }
    });

    // Search cars
    app.post("/api/cars/search", async (req, res) => {
      try {
        // Validate search params
        const validationResult = carSearchSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Get all matching cars
        const allMatchingCars = await storage.searchCars(validationResult.data);
        
        // If user is admin, return all matching cars
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        if (isAdmin) {
          return res.json(allMatchingCars);
        }
        
        // For non-admin users, filter cars from published showrooms
        const publishedShowrooms = await storage.getShowroomsByStatus(ShowroomStatus.PUBLISHED);
        const publishedShowroomIds = publishedShowrooms.map(showroom => showroom.id);
        
        // If user is authenticated, add their own showroom regardless of status
        if (req.isAuthenticated() && req.user) {
          const userShowroom = await storage.getShowroomByUserId(req.user.id);
          if (userShowroom && !publishedShowroomIds.includes(userShowroom.id)) {
            publishedShowroomIds.push(userShowroom.id);
          }
        }
        
        // Filter matching cars to only include those from published showrooms or user's own showroom
        const filteredMatchingCars = allMatchingCars.filter(
          car => publishedShowroomIds.includes(car.showroomId)
        );
        
        res.json(filteredMatchingCars);
      } catch (error) {
        res.status(500).json({ error: "Failed to search cars" });
      }
    });

    // Get car by ID
    app.get("/api/cars/:id", async (req, res) => {
      try {
        const carId = parseInt(req.params.id);
        const car = await storage.getCar(carId);
        
        if (!car) {
          return res.status(404).json({ error: "Car not found" });
        }
        
        // Check if car belongs to a published showroom
        const showroom = await storage.getShowroom(car.showroomId);
        if (!showroom) {
          return res.status(404).json({ error: "Car not found" });
        }
        
        const isAdmin = req.isAuthenticated() && req.user?.role === UserRole.ADMIN;
        const isOwner = req.isAuthenticated() && req.user?.id === showroom.userId;
        
        if (showroom.status !== ShowroomStatus.PUBLISHED && !isAdmin && !isOwner) {
          return res.status(404).json({ error: "Car not found" });
        }
        
        res.json(car);
      } catch (error) {
        console.error('Error in GET /api/cars/:id route:', error);
        res.status(500).json({ error: "Failed to get car" });
      }
    });

    // Get cars by showroom ID
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