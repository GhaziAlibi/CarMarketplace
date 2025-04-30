import { Express } from "express";
import { storage } from "../../storage";
import { requireAdmin } from "../../auth";
import { RouterConfig } from "../types";
import { SubscriptionTier } from "@shared/schema";
import { z } from "zod";

// Schema for subscription update
const updateSubscriptionSchema = z.object({
  tier: z.enum([SubscriptionTier.FREE, SubscriptionTier.PREMIUM, SubscriptionTier.VIP]),
  active: z.boolean().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
});

export const privateAdminSubscriptionRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all subscriptions (admin only)
    app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
      try {
        // Since getAllSubscriptions isn't implemented, we'll get users and fetch their subscriptions
        const users = await storage.getAllUsers();
        const subscriptions = [];
        
        for (const user of users) {
          const subscription = await storage.getSubscriptionByUserId(user.id);
          if (subscription) {
            subscriptions.push(subscription);
          }
        }
        
        res.json(subscriptions);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch subscriptions" });
      }
    });
    
    // Get a specific user's subscription (admin only)
    app.get("/api/admin/users/:userId/subscription", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        const subscription = await storage.getSubscriptionByUserId(userId);
        if (!subscription) {
          return res.status(404).json({ error: "Subscription not found" });
        }
        
        res.json(subscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch subscription" });
      }
    });
    
    // Update a user's subscription (admin only)
    app.put("/api/admin/users/:userId/subscription", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        // Parse and validate the request body manually instead of using Zod transform
        // to avoid type issues with Date conversion
        const { tier, active, startDate: startDateStr, endDate: endDateStr } = req.body;
        
        // Validate tier
        if (tier && ![SubscriptionTier.FREE, SubscriptionTier.PREMIUM, SubscriptionTier.VIP].includes(tier)) {
          return res.status(400).json({ error: "Invalid subscription tier" });
        }
        
        // Prepare data for update
        const subscriptionData: any = { tier };
        
        // Handle optional fields
        if (active !== undefined) {
          subscriptionData.active = active;
        }
        
        if (startDateStr) {
          try {
            subscriptionData.startDate = new Date(startDateStr);
          } catch (e) {
            return res.status(400).json({ error: "Invalid start date format" });
          }
        }
        
        if (endDateStr) {
          try {
            subscriptionData.endDate = new Date(endDateStr);
          } catch (e) {
            return res.status(400).json({ error: "Invalid end date format" });
          }
        } else if (endDateStr === null) {
          subscriptionData.endDate = null;
        }
        
        // Check if user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Get existing subscription
        const existingSubscription = await storage.getSubscriptionByUserId(userId);
        
        if (existingSubscription) {
          // Update existing subscription
          const updatedSubscription = await storage.updateSubscription(
            existingSubscription.id, 
            subscriptionData
          );
          
          if (!updatedSubscription) {
            return res.status(500).json({ error: "Failed to update subscription" });
          }
          
          // Update showroom featured status if tier is VIP
          if (user.role === "seller") {
            const showroom = await storage.getShowroomByUserId(userId);
            if (showroom) {
              const isFeatured = subscriptionData.tier === SubscriptionTier.VIP && subscriptionData.active !== false;
              await storage.updateShowroom(showroom.id, {
                isFeatured
              });
            }
          }
          
          res.json(updatedSubscription);
        } else {
          // Create new subscription
          const now = new Date();
          const newSubscription = await storage.createSubscription({
            userId,
            tier: subscriptionData.tier,
            active: subscriptionData.active ?? true,
            startDate: subscriptionData.startDate || now,
            endDate: subscriptionData.endDate !== undefined ? subscriptionData.endDate : null,
          });
          
          // Update showroom featured status if tier is VIP
          if (user.role === "seller") {
            const showroom = await storage.getShowroomByUserId(userId);
            if (showroom) {
              const isFeatured = newSubscription.tier === SubscriptionTier.VIP && newSubscription.active;
              await storage.updateShowroom(showroom.id, {
                isFeatured
              });
            }
          }
          
          res.status(201).json(newSubscription);
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to update subscription" });
      }
    });
    
    // Cancel a user's subscription (admin only)
    app.post("/api/admin/users/:userId/subscription/cancel", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        // Check if user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Get subscription
        const subscription = await storage.getSubscriptionByUserId(userId);
        if (!subscription) {
          return res.status(404).json({ error: "Subscription not found" });
        }
        
        // Set subscription to inactive instead of deleting it
        const updatedSubscription = await storage.updateSubscription(subscription.id, {
          active: false
        });
        
        // Remove featured status if applicable
        if (user.role === "seller") {
          const showroom = await storage.getShowroomByUserId(userId);
          if (showroom && showroom.isFeatured) {
            await storage.updateShowroom(showroom.id, {
              isFeatured: false
            });
          }
        }
        
        res.json(updatedSubscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to cancel subscription" });
      }
    });
  }
};