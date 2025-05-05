import { Express } from "express";
import { storage } from "../../storage";
import { requireAdmin } from "../../auth";
import { RouterConfig } from "../types";
import { SubscriptionTier } from "@shared/schema";
import { z } from "zod";

// Schema for subscription update
const updateSubscriptionSchema = z.object({
  tier: z.enum([SubscriptionTier.FREE, SubscriptionTier.PREMIUM, SubscriptionTier.VIP]),
  status: z.enum(['active', 'inactive']).optional(),
  listingLimit: z.number().nullable().optional(),
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
    
    // Get all users with their subscription information (admin only)
    app.get("/api/admin/users-with-subscriptions", requireAdmin, async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        const usersWithSubscriptions = [];
        
        for (const user of users) {
          // Skip password for security
          const { password, ...userWithoutPassword } = user;
          
          // Get user's subscription
          const subscription = await storage.getSubscriptionByUserId(user.id);
          
          // Add to the result array
          usersWithSubscriptions.push({
            ...userWithoutPassword,
            subscription: subscription || null
          });
        }
        
        res.json(usersWithSubscriptions);
      } catch (error) {
        console.error("Error fetching users with subscriptions:", error);
        res.status(500).json({ error: "Failed to fetch users with subscription data" });
      }
    });
    
    // Get a specific user's subscription (admin only)
    app.get("/api/admin/users/:userId/subscription", requireAdmin, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        // First verify the user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const subscription = await storage.getSubscriptionByUserId(userId);
        if (!subscription) {
          // Return a 200 with null data to indicate no subscription exists (not a 404)
          // This allows the front-end to handle it as a "create new subscription" case
          return res.json(null);
        }
        
        res.json(subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
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
        const { tier, status, listingLimit, startDate: startDateStr, endDate: endDateStr } = req.body;
        
        // Validate tier
        if (tier && ![SubscriptionTier.FREE, SubscriptionTier.PREMIUM, SubscriptionTier.VIP].includes(tier)) {
          return res.status(400).json({ error: "Invalid subscription tier" });
        }
        
        // Check if upgrading to VIP tier - we need to enforce the 4 VIP limit
        if (tier === SubscriptionTier.VIP) {
          // Get existing subscription to check if it's already VIP
          const existingSubscription = await storage.getSubscriptionByUserId(userId);
          const isAlreadyVip = existingSubscription?.tier === SubscriptionTier.VIP;
          
          if (!isAlreadyVip) {
            // Count current active VIP subscriptions
            const users = await storage.getAllUsers();
            let vipCount = 0;
            
            for (const user of users) {
              const subscription = await storage.getSubscriptionByUserId(user.id);
              if (subscription && 
                  subscription.tier === SubscriptionTier.VIP && 
                  subscription.status === 'active') {
                vipCount++;
              }
            }
            
            // If there are already 4 VIP subscriptions, prevent adding more
            if (vipCount >= 4) {
              return res.status(400).json({ 
                error: "Maximum VIP limit reached", 
                message: "Only 4 VIP subscriptions are allowed at a time. Please downgrade another VIP subscription before adding a new one."
              });
            }
          }
        }
        
        // Prepare data for update
        const subscriptionData: any = {};
        if (tier !== undefined) {
          subscriptionData.tier = tier;
          
          // Set default listing limit based on tier if not explicitly provided
          if (listingLimit === undefined) {
            subscriptionData.listingLimit = tier === SubscriptionTier.FREE ? 3 : null; // null means unlimited
          }
        }
        
        // Handle optional fields
        if (status !== undefined) {
          if (status !== 'active' && status !== 'inactive') {
            return res.status(400).json({ error: "Status must be 'active' or 'inactive'" });
          }
          subscriptionData.status = status;
        }
        
        // Handle listing limit
        if (listingLimit !== undefined) {
          subscriptionData.listingLimit = listingLimit;
        }
        
        // Handle dates explicitly, allowing null values
        if (startDateStr) {
          try {
            subscriptionData.startDate = new Date(startDateStr);
          } catch (e) {
            return res.status(400).json({ error: "Invalid start date format" });
          }
        }
        
        // Handle null end date specifically (for unlimited subscription)
        if (endDateStr === null) {
          subscriptionData.endDate = null;
        } else if (endDateStr) {
          try {
            subscriptionData.endDate = new Date(endDateStr);
          } catch (e) {
            return res.status(400).json({ error: "Invalid end date format" });
          }
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
              const isFeatured = subscriptionData.tier === SubscriptionTier.VIP && subscriptionData.status !== 'inactive';
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
            status: subscriptionData.status ?? 'active',
            listingLimit: subscriptionData.listingLimit ?? (subscriptionData.tier === SubscriptionTier.FREE ? 3 : null),
            startDate: subscriptionData.startDate || now,
            endDate: subscriptionData.endDate !== undefined ? subscriptionData.endDate : null,
          });
          
          // Update showroom featured status if tier is VIP
          if (user.role === "seller") {
            const showroom = await storage.getShowroomByUserId(userId);
            if (showroom) {
              const isFeatured = newSubscription.tier === SubscriptionTier.VIP && newSubscription.status === 'active';
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
          status: 'inactive',
          endDate: new Date()
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