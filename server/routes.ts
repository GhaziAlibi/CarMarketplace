import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole, requireAdmin, hashPassword } from "./auth";
import { UserRole, insertCarSchema, insertShowroomSchema, insertMessageSchema, insertFavoriteSchema, carSearchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Users routes
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/users/role/:role", requireAdmin, async (req, res) => {
    try {
      const role = req.params.role as UserRole;
      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const users = await storage.getUsersByRole(role);
      // Remove passwords from response
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users by role" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only admins can update other users
      if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: "You don't have permission to update this user" });
      }
      
      // If password is being updated, hash it
      if (req.body.password) {
        req.body.password = await hashPassword(req.body.password);
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Showroom routes
  app.get("/api/showrooms", async (req, res) => {
    try {
      const showrooms = await storage.getAllShowrooms();
      res.json(showrooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to get showrooms" });
    }
  });

  app.get("/api/showrooms/:id", async (req, res) => {
    try {
      const showroomId = parseInt(req.params.id);
      const showroom = await storage.getShowroom(showroomId);
      
      if (!showroom) {
        return res.status(404).json({ error: "Showroom not found" });
      }
      
      res.json(showroom);
    } catch (error) {
      res.status(500).json({ error: "Failed to get showroom" });
    }
  });

  app.post("/api/showrooms", requireRole(UserRole.SELLER), async (req, res) => {
    try {
      const parseResult = insertShowroomSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Validation Error", 
          details: parseResult.error.errors 
        });
      }
      
      // Check if user already has a showroom
      const existingShowroom = await storage.getShowroomByUserId(req.user.id);
      if (existingShowroom) {
        return res.status(400).json({ error: "User already has a showroom" });
      }
      
      const newShowroom = await storage.createShowroom(parseResult.data, req.user.id);
      res.status(201).json(newShowroom);
    } catch (error) {
      res.status(500).json({ error: "Failed to create showroom" });
    }
  });

  // Get the authenticated seller's showroom
  app.get("/api/seller/showroom", requireRole(UserRole.SELLER), async (req, res) => {
    try {
      const showroom = await storage.getShowroomByUserId(req.user.id);
      
      if (!showroom) {
        return res.status(404).json({ error: "Showroom not found" });
      }
      
      res.json(showroom);
    } catch (error) {
      res.status(500).json({ error: "Failed to get seller's showroom" });
    }
  });

  app.put("/api/showrooms/:id", requireAuth, async (req, res) => {
    try {
      const showroomId = parseInt(req.params.id);
      const showroom = await storage.getShowroom(showroomId);
      
      if (!showroom) {
        return res.status(404).json({ error: "Showroom not found" });
      }
      
      // Only the owner or admin can update the showroom
      if (showroom.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: "You don't have permission to update this showroom" });
      }
      
      const updatedShowroom = await storage.updateShowroom(showroomId, req.body);
      res.json(updatedShowroom);
    } catch (error) {
      res.status(500).json({ error: "Failed to update showroom" });
    }
  });
  
  // Allow PATCH method for partial updates
  app.patch("/api/showrooms/:id", requireAuth, async (req, res) => {
    try {
      const showroomId = parseInt(req.params.id);
      console.log(`Updating showroom ${showroomId} with data:`, req.body);
      
      const showroom = await storage.getShowroom(showroomId);
      
      if (!showroom) {
        console.log("Showroom not found with ID:", showroomId);
        return res.status(404).json({ error: "Showroom not found" });
      }
      
      // Only the owner or admin can update the showroom
      if (showroom.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        console.log("Permission denied. User ID:", req.user.id, "Showroom User ID:", showroom.userId);
        return res.status(403).json({ error: "You don't have permission to update this showroom" });
      }
      
      const updatedShowroom = await storage.updateShowroom(showroomId, req.body);
      console.log("Showroom updated successfully:", updatedShowroom);
      res.json(updatedShowroom);
    } catch (error) {
      console.error("Error updating showroom:", error);
      res.status(500).json({ error: "Failed to update showroom" });
    }
  });

  // Cars routes
  app.get("/api/cars", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cars" });
    }
  });

  app.get("/api/cars/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const featuredCars = await storage.getFeaturedCars(limit);
      res.json(featuredCars);
    } catch (error) {
      res.status(500).json({ error: "Failed to get featured cars" });
    }
  });

  app.get("/api/cars/search", async (req, res) => {
    try {
      const parseResult = carSearchSchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Validation Error", 
          details: parseResult.error.errors 
        });
      }
      
      const cars = await storage.searchCars(parseResult.data);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to search cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const car = await storage.getCar(carId);
      
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to get car" });
    }
  });

  app.get("/api/showrooms/:id/cars", async (req, res) => {
    try {
      const showroomId = parseInt(req.params.id);
      const showroom = await storage.getShowroom(showroomId);
      
      if (!showroom) {
        return res.status(404).json({ error: "Showroom not found" });
      }
      
      const cars = await storage.getCarsByShowroom(showroomId);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to get showroom cars" });
    }
  });

  app.post("/api/cars", requireRole(UserRole.SELLER), async (req, res) => {
    try {
      const parseResult = insertCarSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Validation Error", 
          details: parseResult.error.errors 
        });
      }
      
      // Get the user's showroom
      const showroom = await storage.getShowroomByUserId(req.user.id);
      if (!showroom) {
        return res.status(400).json({ error: "Seller must have a showroom to add cars" });
      }
      
      // Create car with showroom ID
      const carData = {
        ...parseResult.data,
        showroomId: showroom.id
      };
      
      const newCar = await storage.createCar(carData);
      res.status(201).json(newCar);
    } catch (error) {
      res.status(500).json({ error: "Failed to create car" });
    }
  });

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
      if (showroom.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: "You don't have permission to update this car" });
      }
      
      const updatedCar = await storage.updateCar(carId, req.body);
      res.json(updatedCar);
    } catch (error) {
      res.status(500).json({ error: "Failed to update car" });
    }
  });

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
      if (showroom.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
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

  // Admin routes for setting featured cars
  app.post("/api/cars/:id/featured", requireAdmin, async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const car = await storage.getCar(carId);
      
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      
      const featured = req.body.featured === undefined ? true : Boolean(req.body.featured);
      const updatedCar = await storage.updateCar(carId, { isFeatured: featured });
      
      res.json(updatedCar);
    } catch (error) {
      res.status(500).json({ error: "Failed to update featured status" });
    }
  });

  // Messages routes
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.get("/api/messages/conversation/:userId", requireAuth, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const conversation = await storage.getConversation(req.user.id, otherUserId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversation" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const parseResult = insertMessageSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Validation Error", 
          details: parseResult.error.errors 
        });
      }
      
      // Make sure sender ID is the current user
      const messageData = {
        ...parseResult.data,
        senderId: req.user.id
      };
      
      // Validate that receiver exists
      const receiver = await storage.getUser(messageData.receiverId);
      if (!receiver) {
        return res.status(404).json({ error: "Receiver not found" });
      }
      
      // Validate car if provided
      if (messageData.carId) {
        const car = await storage.getCar(messageData.carId);
        if (!car) {
          return res.status(404).json({ error: "Car not found" });
        }
      }
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.put("/api/messages/:id/read", requireAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      // Only the receiver can mark a message as read
      if (message.receiverId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to mark this message as read" });
      }
      
      const updatedMessage = await storage.updateMessage(messageId, { isRead: true });
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.user.id);
      
      // Get car details for each favorite
      const favoritesWithCars = await Promise.all(favorites.map(async (favorite) => {
        const car = await storage.getCar(favorite.carId);
        return {
          ...favorite,
          car
        };
      }));
      
      res.json(favoritesWithCars);
    } catch (error) {
      res.status(500).json({ error: "Failed to get favorites" });
    }
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const parseResult = insertFavoriteSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Validation Error", 
          details: parseResult.error.errors 
        });
      }
      
      // Make sure user ID is the current user
      const favoriteData = {
        ...parseResult.data,
        userId: req.user.id
      };
      
      // Check if car exists
      const car = await storage.getCar(favoriteData.carId);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      
      // Check if already favorited
      const isFavorite = await storage.isFavorite(req.user.id, favoriteData.carId);
      if (isFavorite) {
        return res.status(400).json({ error: "Car already in favorites" });
      }
      
      const newFavorite = await storage.createFavorite(favoriteData);
      res.status(201).json(newFavorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:id", requireAuth, async (req, res) => {
    try {
      const favoriteId = parseInt(req.params.id);
      const favorite = await storage.getFavorite(favoriteId);
      
      if (!favorite) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      // Only the owner can delete the favorite
      if (favorite.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to delete this favorite" });
      }
      
      const deleted = await storage.deleteFavorite(favoriteId);
      if (deleted) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ error: "Failed to delete favorite" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete favorite" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
