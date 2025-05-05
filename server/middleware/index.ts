export * from './validation';
export * from './rate-limit';

// Add security middleware to help protect against common web vulnerabilities
import { NextFunction, Request, Response } from 'express';

/**
 * Set security headers for all responses
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Disable client-side caching for sensitive routes
  if (req.path.startsWith('/api/auth') || 
      req.path.includes('/admin/') || 
      req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

/**
 * Validate Content-Type for API requests with bodies
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET, HEAD, OPTIONS requests which typically don't have bodies
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Only check API routes
  if (req.path.startsWith('/api')) {
    const contentType = req.get('Content-Type') || '';
    
    // Allow both application/json and multipart/form-data (for file uploads)
    if (!contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data') && 
        !contentType.includes('application/x-www-form-urlencoded')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'API requests must use application/json, multipart/form-data, or application/x-www-form-urlencoded'
      });
    }
  }
  
  next();
};