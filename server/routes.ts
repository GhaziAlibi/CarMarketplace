import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { registerAllRoutes } from "./routes/index";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Register all API routes
  registerAllRoutes(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server (if needed)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}