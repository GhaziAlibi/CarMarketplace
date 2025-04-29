import { Express } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { insertMessageSchema } from "@shared/schema";
import { RouterConfig } from "./types";

export const messageRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get all messages for current user
    app.get("/api/messages", requireAuth, async (req, res) => {
      try {
        const messages = await storage.getMessagesByUser(req.user!.id);
        res.json(messages);
      } catch (error) {
        res.status(500).json({ error: "Failed to get messages" });
      }
    });

    // Get conversation between two users
    app.get("/api/messages/conversation/:userId", requireAuth, async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
        
        const conversation = await storage.getConversation(req.user!.id, userId);
        res.json(conversation);
      } catch (error) {
        res.status(500).json({ error: "Failed to get conversation" });
      }
    });

    // Send a message
    app.post("/api/messages", requireAuth, async (req, res) => {
      try {
        // Validate request body
        const validationResult = insertMessageSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ error: validationResult.error.message });
        }
        
        // Create message with sender ID
        const messageData = {
          ...validationResult.data,
          senderId: req.user!.id,
          isRead: false,
        };
        
        const message = await storage.createMessage(messageData);
        res.status(201).json(message);
      } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
      }
    });

    // Mark message as read
    app.put("/api/messages/:id/read", requireAuth, async (req, res) => {
      try {
        const messageId = parseInt(req.params.id);
        const message = await storage.getMessage(messageId);
        
        if (!message) {
          return res.status(404).json({ error: "Message not found" });
        }
        
        // Only the recipient can mark a message as read
        if (message.receiverId !== req.user!.id) {
          return res.status(403).json({ error: "Not authorized to mark this message as read" });
        }
        
        const updatedMessage = await storage.updateMessage(messageId, { isRead: true });
        res.json(updatedMessage);
      } catch (error) {
        res.status(500).json({ error: "Failed to mark message as read" });
      }
    });
  }
};