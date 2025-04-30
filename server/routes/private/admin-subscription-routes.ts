import { Express } from "express";
import { storage } from "../../storage";
import { requireAdmin } from "../../auth";
import { insertSubscriptionSchema } from "@shared/schema";
import { RouterConfig } from "../types";

export const adminSubscriptionRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all subscriptions - admin only
    app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
      try {
        // Get all users
        const users = await storage.getAllUsers();
        
        // Get all subscriptions
        const subscriptions = [];
        
        for (const user of users) {
          const subscription = await storage.getSubscriptionByUserId(user.id);
          if (subscription) {
            const { password, ...userWithoutPassword } = user;
            subscriptions.push({
              ...subscription,
              user: userWithoutPassword
            });
          }
        }
        
        res.json(subscriptions);
      } catch (error) {
        console.error("Failed to get subscriptions:", error);
        res.status(500).json({ error: "Failed to get subscriptions" });
      }
    });

    // Get a specific subscription - admin only
    app.get("/api/admin/subscriptions/:userId", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        const subscription = await storage.getSubscriptionByUserId(userId);
        if (!subscription) {
          return res.status(404).json({ error: "Subscription not found" });
        }
        
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const { password, ...userWithoutPassword } = user;
        
        res.json({
          ...subscription,
          user: userWithoutPassword
        });
      } catch (error) {
        console.error("Failed to get subscription:", error);
        res.status(500).json({ error: "Failed to get subscription" });
      }
    });

    // Update a user's subscription - admin only
    app.put("/api/admin/subscriptions/:userId", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        // Validate request body
        const validationResult = insertSubscriptionSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Check if user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Check if subscription exists
        const existingSubscription = await storage.getSubscriptionByUserId(userId);
        
        if (existingSubscription) {
          // Update existing subscription
          const updatedSubscription = await storage.updateSubscription(
            existingSubscription.id,
            {
              ...validationResult.data,
              userId: userId,
              active: true,
              // Remove Stripe-specific fields
              stripeCustomerId: null,
              stripeSubscriptionId: null,
            }
          );
          return res.json(updatedSubscription);
        } else {
          // Create new subscription
          const newSubscription = await storage.createSubscription({
            ...validationResult.data,
            userId: userId,
            active: true,
            // Remove Stripe-specific fields
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          });
          return res.status(201).json(newSubscription);
        }
      } catch (error) {
        console.error("Failed to update subscription:", error);
        res.status(500).json({ error: "Failed to update subscription" });
      }
    });
  }
};