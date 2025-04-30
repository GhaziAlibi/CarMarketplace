import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { requireAdmin } from "../../auth";
import { SubscriptionTier } from "@shared/schema";

export const adminSubscriptionRoutes = {
  registerRoutes: (app: Express) => {
    // Get subscription by user ID
    app.get("/api/admin/subscriptions/:userId", requireAdmin, async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
        
        const subscription = await storage.getSubscriptionByUserId(userId);
        
        if (!subscription) {
          return res.status(404).json({ message: "Subscription not found" });
        }
        
        return res.status(200).json(subscription);
      } catch (error: any) {
        console.error("Error fetching subscription:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });
    
    // Update subscription by user ID
    app.put("/api/admin/subscriptions/:userId", requireAdmin, async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
        
        const { tier, active, startDate, endDate, listingLimit } = req.body;
        
        // Validate tier
        if (tier && !Object.values(SubscriptionTier).includes(tier)) {
          return res.status(400).json({ message: "Invalid subscription tier" });
        }
        
        const subscription = await storage.getSubscriptionByUserId(userId);
        
        if (!subscription) {
          // Create new subscription if it doesn't exist
          const newSubscription = await storage.createSubscription({
            userId,
            tier: tier || SubscriptionTier.FREE,
            active: active !== undefined ? active : true,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
          });
          
          return res.status(201).json(newSubscription);
        }
        
        // Update existing subscription
        const updatedSubscription = await storage.updateSubscription(subscription.id, {
          tier: tier || subscription.tier,
          active: active !== undefined ? active : subscription.active,
          startDate: startDate ? new Date(startDate) : subscription.startDate,
          endDate: endDate ? new Date(endDate) : subscription.endDate,
        });
        
        return res.status(200).json(updatedSubscription);
      } catch (error: any) {
        console.error("Error updating subscription:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  }
};