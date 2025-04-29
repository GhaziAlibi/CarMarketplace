import { Express, Request, Response } from "express";
import { UserRole } from "@shared/schema";
import { requireAdmin, hashPassword } from "../../auth";
import { storage } from "../../storage";
import { RouterConfig } from "../types";

export const privateAdminRoutes: RouterConfig = {
  registerRoutes(app: Express): void {
  // Create a new seller account (admin only)
  app.post("/api/admin/create-seller", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user with SELLER role
      const newUser = await storage.createUser({
        ...req.body,
        role: UserRole.SELLER,
        password: hashedPassword,
      });

      // Create a default showroom for the seller
      const showroom = await storage.createShowroom(
        {
          name: `${newUser.name}'s Showroom`,
          description: "Default showroom",
          logo: null,
          headerImage: null,
          address: null,
          city: "Unknown", // Required field
          country: "Unknown", // Required field
          email: newUser.email,
          phone: null,
          status: "draft",
          isFeatured: false,
        },
        newUser.id
      );

      // Remove password before sending response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ 
        user: userWithoutPassword,
        showroom
      });
    } catch (error: any) {
      console.error("Error creating seller:", error);
      res.status(500).json({ error: error.message || "Failed to create seller account" });
    }
  });
  }
}