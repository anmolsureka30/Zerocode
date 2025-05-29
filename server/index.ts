import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import fetch from 'node-fetch';
import * as authModule from "./routes/auth.js"; // Changed to import entire module

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

globalThis.fetch = fetch as any;
const app = express();

// Get allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'https://ebfiwb.vercel.app',
      'https://just0code.com',
      'https://frontend-three-beta-55.vercel.app'
    ];

// Add CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`⚠️ Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
    
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', (req, res) => {
  res.status(204).end();
});

// Add error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Request blocked by CORS policy',
      origin: req.headers.origin
    });
  }
  
  // Handle other errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({ 
    error: true,
    message,
    path: req.path,
    method: req.method
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger middleware
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

// Test route to verify API is working
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'API is working' });
});

// Register authentication routes with error handling
if (authModule && authModule.router) {
  console.log('Found auth router, registering routes');
  app.use('/api/auth', authModule.router);
} else {
  console.error('Auth router not found or invalid!');
  // Provide a dummy handler
  app.use('/api/auth', (req: Request, res: Response) => {
    res.status(500).json({ message: 'Auth routes not properly configured' });
  });
}

// The rest of your async setup should be in this IIFE
(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      // In production, we don't need to serve static files since frontend is separate
      app.get('/', (req, res) => {
        res.json({ message: 'WDTAFG API Server' });
      });
    }

    // Use PORT environment variable with fallback to 5001
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();