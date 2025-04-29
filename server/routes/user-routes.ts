import { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin, requireRole } from "../auth";
import { UserRole } from "@shared/schema";
import { RouterConfig } from "./types";

export const userRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
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
  }
};