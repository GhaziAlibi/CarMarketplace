import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter to prevent abuse
 * Note: For production use, consider using a Redis-based solution for distributed systems
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory
// key: IP address or user ID
// value: { count: number of requests, resetTime: when to reset the counter }
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  // Using forEach instead of for...of to avoid TypeScript issues
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Run every minute

/**
 * Rate limiting middleware to prevent API abuse
 * 
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds
 * @param useUserIdIfAvailable Whether to use user ID instead of IP address if available
 * @returns Express middleware function
 */
export const rateLimit = (
  maxRequests: number = 100,
  windowMs: number = 60 * 1000, // 1 minute by default
  useUserIdIfAvailable: boolean = true
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get a unique identifier for the requester (IP or user ID)
    let requesterId = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Use user ID if available and configured to do so
    if (useUserIdIfAvailable && req.user && 'id' in req.user) {
      requesterId = `user:${req.user.id}`;
    }
    
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(requesterId);
    if (!entry || entry.resetTime <= now) {
      // Create new entry if none exists or if the previous one has expired
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Increment request count
    entry.count++;
    
    // Update the store
    rateLimitStore.set(requesterId, entry);
    
    // Set headers to help clients manage their requests
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
    
    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
    
    next();
  };
};

/**
 * Higher limits for specific endpoints
 */
export const apiLimiters = {
  // Default API rate limit
  standard: rateLimit(100, 60 * 1000), // 100 requests per minute
  
  // More strict limit for authentication endpoints to prevent brute force
  auth: rateLimit(10, 60 * 1000), // 10 attempts per minute
  
  // More permissive for public listing endpoints
  publicListings: rateLimit(300, 60 * 1000), // 300 requests per minute
  
  // Very strict for sensitive operations (password reset, etc.)
  sensitive: rateLimit(5, 60 * 1000) // 5 requests per minute
};