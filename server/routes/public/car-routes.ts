import { Express } from "express";
import { storage } from "../../storage";
import { UserRole, ShowroomStatus, carSearchSchema } from "@shared/schema";
import { RouterConfig } from "../types";

export const publicCarRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get featured cars - public endpoint
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

    // Search cars - public endpoint
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

    // Get car by ID - public endpoint
    app.get("/api/cars/:id", async (req, res) => {
      try {
        const carId = parseInt(req.params.id);
        
        if (isNaN(carId)) {
          console.error(`Invalid car ID: ${req.params.id}`);
          return res.status(404).json({ error: "Car not found" });
        }
        
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

    // Get all cars - public endpoint with filtering
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
  }
};