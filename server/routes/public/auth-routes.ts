import { Express } from "express";
import { RouterConfig } from "../types";

// This file is for public auth-related endpoints
// Note: Auth setup happens in setupAuth() in auth.ts, but
// we include this file for consistency with the routes structure

export const publicAuthRoutes: RouterConfig = {
  registerRoutes: (app: Express) => {
    // Get current user from session - public endpoint that returns user data or 401
    app.get("/api/user", (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      res.json(req.user);
    });
    
    // Note: actual login/logout/register endpoints are set up in setupAuth()
  }
};