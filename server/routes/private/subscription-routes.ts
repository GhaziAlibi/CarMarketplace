import { Express } from "express";
import { storage } from "../../storage";
import { requireAuth } from "../../auth";
import { RouterConfig } from "../types";

export const privateSubscriptionRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get current user's subscription
    app.get("/api/subscriptions/my", requireAuth, async (req, res) => {
      try {
        const userId = req.user!.id;
        const subscription = await storage.getSubscriptionByUserId(userId);
        
        if (!subscription) {
          return res.status(404).json({ error: "No subscription found" });
        }
        
        res.json(subscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch subscription" });
      }
    });
    
    // Get subscription tiers information
    app.get("/api/subscription-tiers", async (req, res) => {
      try {
        // In a real application, this would come from the database
        // For now, we're hardcoding the subscription tiers
        const tiers = [
          {
            id: "free",
            name: "Free",
            price: 0,
            priceDisplay: "$0",
            listingLimit: 3,
            features: [
              "Up to 3 car listings",
              "Basic showroom profile",
              "Standard search visibility",
              "Email support"
            ]
          },
          {
            id: "premium",
            name: "Premium",
            price: 29.99,
            priceDisplay: "$29.99",
            listingLimit: null, // unlimited
            features: [
              "Unlimited car listings",
              "Enhanced showroom profile",
              "Priority search placement",
              "Phone support",
              "Detailed analytics"
            ]
          },
          {
            id: "vip",
            name: "VIP",
            price: 99.99,
            priceDisplay: "$99.99",
            listingLimit: null, // unlimited
            features: [
              "Unlimited car listings",
              "Premium showroom profile",
              "Top search placement",
              "Featured in VIP section",
              "Dedicated account manager",
              "Advanced analytics dashboard",
              "Marketing promotion package"
            ]
          }
        ];
        
        res.json(tiers);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch subscription tiers" });
      }
    });
  }
};