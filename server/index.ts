import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from 'helmet';
import { securityHeaders, validateContentType, apiLimiters } from './middleware';

const app = express();

// Apply Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://*'],
      connectSrc: ["'self'", 'https://*'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", 'https://*.stripe.com'],
    },
  },
  crossOriginEmbedderPolicy: false, // For compatibility with some third-party services
}));

// Apply custom security headers
app.use(securityHeaders);

// Validate Content-Type headers for API requests
app.use(validateContentType);

// Apply global rate limiting to all requests
app.use(apiLimiters.standard);

// Apply stricter rate limiting to authentication endpoints
app.use('/api/login', apiLimiters.auth);
app.use('/api/register', apiLimiters.auth);

// Apply standard Express middleware
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Log the error with stack trace for debugging
    console.error('Server error:', err);
    
    // Determine error status code
    const status = err.status || err.statusCode || 500;
    
    // Prepare error message - provide specific messages only in development
    const isDev = process.env.NODE_ENV === 'development';
    let errorMessage = isDev ? (err.message || "Internal Server Error") : "Internal Server Error";
    
    // For validation errors, include details in development mode
    if (isDev && err.errors) {
      return res.status(status).json({
        error: errorMessage,
        details: err.errors
      });
    }
    
    // For security, don't expose database errors or stack traces in production
    if (err.code && (err.code.startsWith('PG') || err.code.startsWith('23') || err.code.startsWith('42'))) {
      errorMessage = isDev ? `Database error: ${err.message}` : "Database error occurred";
    }
    
    // Send appropriate error response
    res.status(status).json({ error: errorMessage });
    
    // If this is a critical error that should crash the process, throw it
    // Otherwise, the error is handled here and won't bubble up
    if (err.fatal) {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get port and host from environment variables, with defaults
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  // Use localhost (127.0.0.1) on Windows, otherwise use the HOST env var or default to 0.0.0.0
  const isWindows = process.platform === 'win32';
  const host = isWindows ? "127.0.0.1" : (process.env.HOST || "0.0.0.0");

  server.listen({
    port,
    host,
    // Remove reusePort option as it's not supported on Windows
    ...(isWindows ? {} : { reusePort: true }),
  }, () => {
    log(`serving on ${host}:${port}`);
    log(`NODE_ENV: ${process.env.NODE_ENV}`);
  });
})();
