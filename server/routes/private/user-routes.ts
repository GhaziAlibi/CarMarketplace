import { Express } from "express";
import { storage } from "../../storage";
import { requireAuth, requireAdmin, requireRole, hashPassword } from "../../auth";
import { UserRole } from "@shared/schema";
import { RouterConfig } from "../types";

export const privateUserRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all users - admin only
    app.get("/api/users", requireAdmin, async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        console.log("getAllUsers result:", users);
        
        // Remove passwords from response
        const usersWithoutPassword = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        res.json(usersWithoutPassword);
      } catch (error) {
        console.error("Error in GET /api/users:", error);
        res.status(500).json({ error: "Failed to get users" });
      }
    });
    
    // Get only active users - admin only
    app.get("/api/users/active", requireAdmin, async (req, res) => {
      try {
        const users = await storage.getActiveUsers();
        
        // Remove passwords from response
        const usersWithoutPassword = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        res.json(usersWithoutPassword);
      } catch (error) {
        console.error("Error in GET /api/users/active:", error);
        res.status(500).json({ error: "Failed to get active users" });
      }
    });

    // Get users by role - admin only
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

    // Update user - requires authentication
    app.put("/api/users/:id", requireAuth, async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { password, ...updateData } = req.body;
        
        // Only allow users to update their own profile or admin to update any profile
        if (userId !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: "Unauthorized to update this user" });
        }
        
        // If updating password, hash it
        if (password) {
          const hashedPassword = await hashPassword(password);
          Object.assign(updateData, { password: hashedPassword });
        }
        
        const updatedUser = await storage.updateUser(userId, updateData);
        if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
      }
    });
    
    // Disable user - admin only
    app.post("/api/users/:id/disable", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        
        // Don't allow admins to disable themselves
        if (userId === req.user?.id) {
          return res.status(400).json({ error: "You cannot disable your own account" });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // If the user is a seller, also update their showroom status
        if (user.role === UserRole.SELLER) {
          const showroom = await storage.getShowroomByUserId(userId);
          if (showroom) {
            await storage.updateShowroom(showroom.id, { status: "draft" });
          }
        }
        
        const disabledUser = await storage.disableUser(userId);
        if (!disabledUser) {
          return res.status(500).json({ error: "Failed to disable user" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = disabledUser;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error disabling user:", error);
        res.status(500).json({ error: "Failed to disable user" });
      }
    });
    
    // Enable user - admin only
    app.post("/api/users/:id/enable", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const enabledUser = await storage.enableUser(userId);
        if (!enabledUser) {
          return res.status(500).json({ error: "Failed to enable user" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = enabledUser;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error enabling user:", error);
        res.status(500).json({ error: "Failed to enable user" });
      }
    });
  }
};