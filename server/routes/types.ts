import { Express, Request, Response, NextFunction } from "express";

export interface RouteHandler {
  (req: Request, res: Response, next?: NextFunction): Promise<void> | void;
}

export interface RouterConfig {
  registerRoutes: (app: Express) => void;
}