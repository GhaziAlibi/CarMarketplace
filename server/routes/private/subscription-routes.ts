import { Express } from "express";
import { storage } from "../../storage";
import { requireAuth } from "../../auth";
import { SubscriptionTier } from "@shared/schema";
import { RouterConfig } from "../types";

export const privateSubscriptionRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get current user's subscription
    app.get("/api/subscriptions/my", requireAuth, async (req, res) => {
      try {
        const subscription = await storage.getSubscriptionByUserId(req.user!.id);
        if (!subscription) {
          return res.status(404).json({ error: "No active subscription found" });
        }
        res.json(subscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to get subscription" });
      }
    });

    // Get subscription tiers info (pricing, features, etc.)
    app.get("/api/subscription-tiers", async (req, res) => {
      try {
        // Return static subscription tier information
        const tiers = [
          {
            id: "free",
            name: "Free",
            price: 0,
            priceDisplay: "$0",
            description: "Basic tier for new sellers",
            features: [
              "Up to 3 car listings",
              "Basic showroom profile",
              "Message system access"
            ],
            listingLimit: 3
          },
          {
            id: "premium",
            name: "Premium",
            price: 19.99,
            priceDisplay: "$19.99",
            description: "For professional sellers",
            features: [
              "Unlimited car listings",
              "Enhanced showroom profile",
              "Priority in search results",
              "Advanced analytics"
            ],
            listingLimit: null // unlimited
          },
          {
            id: "vip",
            name: "VIP",
            price: 49.99,
            priceDisplay: "$49.99",
            description: "For dealerships and premium sellers",
            features: [
              "Unlimited car listings",
              "Premium showroom profile",
              "Featured in VIP section",
              "Top placement in search results",
              "Advanced analytics",
              "Premium support"
            ],
            listingLimit: null // unlimited
          }
        ];
        
        res.json(tiers);
      } catch (error) {
        console.error("Failed to get subscription tiers:", error);
        res.status(500).json({ error: "Failed to get subscription tiers" });
      }
    });
  }
};