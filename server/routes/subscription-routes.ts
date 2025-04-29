import { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireRole } from "../auth";
import { UserRole, SubscriptionTier, insertSubscriptionSchema } from "@shared/schema";
import { RouterConfig } from "./types";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY ? 
  new Stripe(process.env.STRIPE_SECRET_KEY) : 
  null;

export const subscriptionRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get current user's subscription
    app.get("/api/subscriptions/my", requireAuth, async (req, res) => {
      try {
        const subscription = await storage.getSubscriptionByUserId(req.user!.id);
        if (!subscription) {
          return res.status(404).json({ error: "No subscription found" });
        }
        
        res.json(subscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to get subscription" });
      }
    });

    // Create payment intent for subscription
    app.post("/api/subscriptions/create-payment-intent", requireAuth, async (req, res) => {
      try {
        if (!stripe) {
          return res.status(500).json({ error: "Stripe configuration missing" });
        }
        
        const { tier } = req.body;
        if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
          return res.status(400).json({ error: "Invalid subscription tier" });
        }
        
        // Determine amount based on tier
        let amount = 0;
        switch (tier) {
          case SubscriptionTier.PREMIUM:
            amount = 2900; // $29.00
            break;
          case SubscriptionTier.VIP:
            amount = 4900; // $49.00
            break;
          default:
            amount = 0; // Free tier
        }
        
        if (amount === 0) {
          return res.status(400).json({ error: "Cannot create payment intent for free tier" });
        }
        
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            userId: req.user!.id.toString(),
            tier,
          },
        });
        
        res.json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: "Failed to create payment intent" });
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
          const updatedSubscription = await storage.updateSubscription(existingSubscription.id, {
            ...validationResult.data,
            userId: req.user!.id,
            active: true,
          });
          
          return res.json(updatedSubscription);
        }
        
        // Create new subscription with user ID
        const subscriptionData = {
          ...validationResult.data,
          userId: req.user!.id,
          active: true,
        };
        
        const subscription = await storage.createSubscription(subscriptionData);
        res.status(201).json(subscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to create subscription" });
      }
    });

    // Cancel subscription
    app.post("/api/subscriptions/cancel", requireAuth, async (req, res) => {
      try {
        const subscription = await storage.getSubscriptionByUserId(req.user!.id);
        if (!subscription) {
          return res.status(404).json({ error: "No subscription found" });
        }
        
        // Only the subscription owner or admin can cancel
        if (subscription.userId !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: "Not authorized to cancel this subscription" });
        }
        
        // For paid subscriptions, handle Stripe cancellation if needed
        if (subscription.tier !== SubscriptionTier.FREE && subscription.stripeSubscriptionId && stripe) {
          try {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
          } catch (stripeError) {
            console.error('Error cancelling Stripe subscription:', stripeError);
            // Continue with local cancellation even if Stripe fails
          }
        }
        
        // Mark as inactive in our database
        const updatedSubscription = await storage.updateSubscription(subscription.id, {
          active: false,
        });
        
        res.json(updatedSubscription);
      } catch (error) {
        res.status(500).json({ error: "Failed to cancel subscription" });
      }
    });

    // Stripe webhook for subscription events
    app.post("/api/webhooks/stripe", async (req, res) => {
      try {
        if (!stripe) {
          return res.status(500).json({ error: "Stripe configuration missing" });
        }
        
        const sig = req.headers['stripe-signature'] as string;
        if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
          return res.status(400).json({ error: "Missing signature or webhook secret" });
        }
        
        let event;
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err) {
          return res.status(400).json({ error: "Invalid signature" });
        }
        
        // Handle specific Stripe events
        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const { userId, tier } = paymentIntent.metadata || {};
          
          if (userId && tier) {
            const user = await storage.getUser(parseInt(userId));
            if (user) {
              // Update or create subscription
              const existingSubscription = await storage.getSubscriptionByUserId(user.id);
              if (existingSubscription) {
                await storage.updateSubscription(existingSubscription.id, {
                  tier: tier as SubscriptionTier,
                  active: true,
                });
              } else {
                await storage.createSubscription({
                  userId: user.id,
                  tier: tier as SubscriptionTier,
                  active: true,
                });
              }
            }
          }
        } else {
          console.log(`Received Stripe event: ${event.type}`);
        }
        
        res.sendStatus(200);
      } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        res.status(500).json({ error: "Failed to process webhook" });
      }
    });
  }
};