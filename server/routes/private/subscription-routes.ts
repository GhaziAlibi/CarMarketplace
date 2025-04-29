import { Express } from "express";
import { storage } from "../../storage";
import { requireAuth } from "../../auth";
import { SubscriptionTier, insertSubscriptionSchema } from "@shared/schema";
import Stripe from "stripe";
import { RouterConfig } from "../types";

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | undefined;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey);
}

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

    // Create or update subscription
    app.post("/api/subscriptions", requireAuth, async (req, res) => {
      try {
        // Validate request body
        const validationResult = insertSubscriptionSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Check if user already has a subscription
        const existingSubscription = await storage.getSubscriptionByUserId(req.user!.id);
        
        if (existingSubscription) {
          // Update existing subscription
          const updatedSubscription = await storage.updateSubscription(
            existingSubscription.id,
            {
              ...validationResult.data,
              userId: req.user!.id,
              active: true,
            }
          );
          return res.json(updatedSubscription);
        } else {
          // Create new subscription
          const newSubscription = await storage.createSubscription({
            ...validationResult.data,
            userId: req.user!.id,
            active: true,
          });
          return res.status(201).json(newSubscription);
        }
      } catch (error) {
        console.error("Failed to create/update subscription:", error);
        res.status(500).json({ error: "Failed to create/update subscription" });
      }
    });

    // Cancel subscription
    app.post("/api/subscriptions/cancel", requireAuth, async (req, res) => {
      try {
        const subscription = await storage.getSubscriptionByUserId(req.user!.id);
        if (!subscription) {
          return res.status(404).json({ error: "No active subscription found" });
        }
        
        // If using Stripe, also cancel the subscription there
        if (stripe && subscription.stripeSubscriptionId) {
          try {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
          } catch (stripeError) {
            console.error("Stripe subscription cancellation failed:", stripeError);
            // Continue with local cancellation anyway
          }
        }
        
        const cancelled = await storage.cancelSubscription(subscription.id);
        if (cancelled) {
          // Create a free tier subscription to replace the cancelled one
          await storage.createSubscription({
            userId: req.user!.id,
            tier: SubscriptionTier.FREE,
            active: true,
            stripeCustomerId: subscription.stripeCustomerId, // keep the customer ID
            stripeSubscriptionId: null,
            startDate: new Date(),
            endDate: null, // No end date for free tier
          });
          
          res.json({ success: true, message: "Subscription cancelled successfully" });
        } else {
          res.status(500).json({ error: "Failed to cancel subscription" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to cancel subscription" });
      }
    });

    // Create payment intent for subscription upgrade
    app.post("/api/create-subscription", requireAuth, async (req, res) => {
      try {
        if (!stripe) {
          return res.status(500).json({ error: "Stripe is not configured" });
        }
        
        const { tier, priceId } = req.body;
        
        if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
          return res.status(400).json({ error: "Invalid subscription tier" });
        }
        
        if (tier === SubscriptionTier.FREE) {
          return res.status(400).json({ error: "Cannot create payment intent for free tier" });
        }
        
        let stripeCustomerId = null;
        const existingSubscription = await storage.getSubscriptionByUserId(req.user!.id);
        
        // Use existing Stripe customer ID if available
        if (existingSubscription?.stripeCustomerId) {
          stripeCustomerId = existingSubscription.stripeCustomerId;
        } else {
          // Create a new customer
          const customer = await stripe.customers.create({
            email: req.user!.email,
            name: req.user!.username,
          });
          stripeCustomerId = customer.id;
        }
        
        // Create a simple payment intent instead of subscription for demo
        // For a full implementation, we would use Stripe Checkout or Stripe Elements
        const paymentIntent = await stripe.paymentIntents.create({
          amount: tier === SubscriptionTier.PREMIUM ? 1999 : 4999, // $19.99 or $49.99
          currency: "usd",
          customer: stripeCustomerId,
          metadata: {
            tier: tier,
            userId: req.user!.id.toString()
          }
        });
        
        // Get the client secret for the payment intent
        const clientSecret = paymentIntent.client_secret;
        
        res.json({
          paymentIntentId: paymentIntent.id,
          clientSecret: clientSecret,
          customerId: stripeCustomerId,
        });
      } catch (error) {
        console.error("Failed to create subscription payment intent:", error);
        res.status(500).json({ error: "Failed to create subscription payment intent" });
      }
    });
  }
};