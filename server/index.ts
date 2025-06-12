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
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'https://ebfiwb.vercel.app',
      'https://just0code.com',
      'https://frontend-three-beta-55.vercel.app',
      'https://veertesting.vercel.app',
    ];

// Add development origins in development mode
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:5173');
}

console.log('🔒 Allowed CORS origins:', allowedOrigins);

// Move CORS middleware to the very top
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400,
  preflightContinue: false
}));

// Then add body parsers
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

export default app;