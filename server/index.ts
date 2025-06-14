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

// Configure CORS
app.use(cors({
  origin: [
    'https://veertesting.vercel.app',
    'https://zerocode-anmol.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://veertesting-azjyxijc0-anmol-surekas-projects.vercel.app'
  ],
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

// Add a catch-all OPTIONS handler for CORS
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://veertesting.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

// Add a GET / route for root
      app.get('/', (req, res) => {
        res.json({ message: 'WDTAFG API Server' });
      });

// After all middleware and before export default app
// Ensure all API routes are registered before export
registerRoutes(app);

export default app;