import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertProjectSchema } from "./shared/schema.js";
import { fromZodError } from "zod-validation-error";
import { planAppFiles } from "./lib/openaiAppPlannerAgent.js";
import { planAppFilesWithClaude } from "./lib/claudeAppPlannerAgent.js";
import { generateFileCode, readDirectoryAsFileNodes } from "./lib/openaiFileCodegenAgent.js";
import { fixAppErrors } from "./lib/openaiErrorFixAgent.js";
import OpenAI from "openai";
import { handleChatbotEdit } from "./lib/chatbotAgent.js";
import { getAppIdeaFeedback, getUpdateFeedback } from "./lib/conversationalBotAgent.js";
import { ObjectId } from "mongodb";
import clientPromise from "./lib/mongodb.js";
import authRouter, { authenticateToken } from "./lib/authRoutes.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type FileNode } from "./shared/schema.js";

// Polyfill for __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions for backend validation - Fixed type annotations
function extractComponentNames(code: string): string[] {
  const matches = code.match(/<([A-Z][A-Za-z0-9_]*)\b/g) || [];
  return Array.from(new Set(matches.map((m: string) => m.replace('<', ''))));
}

function getAllComponentNames(files: { name: string }[]): string[] {
  return files
    .filter((f: { name: string }) => /\.(js|jsx|ts|tsx)$/.test(f.name))
    .map((f: { name: string }) => f.name.replace(/\..*$/, ''));
}

// Flexible validation function for React structure
function validateGeneratedCodeFlexible(structure: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!structure || typeof structure !== 'object') {
    errors.push("Invalid structure: not an object");
    return { isValid: false, errors, warnings };
  }

  // Files validation
  if (!Array.isArray(structure.files)) {
    errors.push("Invalid files: not an array");
    return { isValid: false, errors, warnings };
  }

  if (structure.files.length === 0) {
    errors.push("No files generated");
    return { isValid: false, errors, warnings };
  }

  // Check for essential file patterns (flexible matching)
  const filePaths = structure.files.map((f: any) => f.path || f.name || '');
  
  // Look for package.json (flexible path)
  const hasPackageJson = filePaths.some((path: string) => path.includes('package.json'));
  if (!hasPackageJson) {
    warnings.push("No package.json found");
  }

  // Look for main app file
  const hasApp = filePaths.some((path: string) => 
    path.includes('App.tsx') || path.includes('App.jsx') || path.includes('App.js')
  );
  if (!hasApp) {
    warnings.push("No App component found");
  }

  // Look for entry point
  const hasMain = filePaths.some((path: string) => 
    path.includes('main.tsx') || path.includes('main.jsx') || 
    path.includes('index.tsx') || path.includes('index.jsx')
  );
  if (!hasMain) {
    warnings.push("No main entry point found");
  }

  // Validate each file has basic properties
  for (const file of structure.files) {
    if (!file.path && !file.name) {
      errors.push("File missing path/name property");
      continue;
    }

    if (file.type !== 'file' && file.type !== 'folder') {
      warnings.push(`Unusual file type: ${file.type} for ${file.path || file.name}`);
    }

    // Only check content for files, not folders
    if (file.type === 'file' && (!file.content || file.content.trim() === '')) {
      warnings.push(`File ${file.path || file.name} has no content`);
    }
  }

  // Dependencies validation (lenient)
  if (!structure.dependencies || typeof structure.dependencies !== 'object') {
    warnings.push("No dependencies object found");
  } else {
    const hasReact = Object.keys(structure.dependencies).some(dep => 
      dep.includes('react') || dep === 'react'
    );
    if (!hasReact) {
      warnings.push("React dependency not found");
    }
  }

  return {
    isValid: errors.length === 0, // Only errors fail validation, warnings are OK
    errors,
    warnings
  };
}

interface DebugLogEntry {
  attempt: number;
  errors: any;
  result: {
    success: boolean;
    files?: FileNode[];
    error?: string | null;
    debugInfo?: any;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = app.use("/api", (req, res, next) => {
    console.log('📨 API Request:', req.method, req.path);
    next();
  });

  // Register authentication routes
  app.use("/api/auth", authRouter);

  // Test route for checking basic API functionality
  app.get("/api/test", (req: Request, res: Response) => {
    res.json({ message: "API is working" });
  });

  // Project CRUD endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const result = insertProjectSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const existingProject = await storage.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updatedProject = await storage.updateProject(id, req.body);
      res.json(updatedProject);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const result = await storage.deleteProject(id);
      if (!result) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // App generation endpoints
  app.post("/api/generate-react-structure", async (req: Request, res: Response) => {
    try {
      console.log('🚀 Generating app with OpenAI');
      const { prompt, settings } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      // Set a longer timeout for the response
      res.setTimeout(120000); // 2 minutes

      console.log('📝 Processing prompt:', prompt);
      console.log('⚙️ Settings:', settings);

      const result = await planAppFiles(prompt, settings);
      
      // Validate the result before sending
      if (!result || !result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid generation result structure');
      }

      console.log('✅ Generation successful, files generated:', result.files.length);
      res.json(result);
    } catch (error: any) {
      console.error('❌ OpenAI generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate app structure",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.post("/api/generate-react-structure-claude", async (req: Request, res: Response) => {
    try {
      console.log('🚀 Generating app with Claude');
      const { prompt, settings } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }

      // Set a longer timeout for the response
      res.setTimeout(120000); // 2 minutes

      console.log('📝 Processing prompt:', prompt);
      console.log('⚙️ Settings:', settings);

      const result = await planAppFilesWithClaude(prompt, settings);
      
      // Validate the result before sending
      if (!result || !result.files || !Array.isArray(result.files)) {
        throw new Error('Invalid generation result structure');
      }

      console.log('✅ Generation successful, files generated:', result.files.length);
      res.json(result);
    } catch (error: any) {
      console.error('❌ Claude generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate app structure",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Waitlist submission endpoint
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const { name, email, phone } = req.body;
      
      // Basic validation
      if (!name || !email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name and email are required' 
        });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter a valid email address' 
        });
      }
      
      console.log('Waitlist submission received:', { name, email, phone });
      
      try {
        // Use the clientPromise
        const client = await clientPromise;
        const db = client.db('zerocode');
        
        // Check if email already exists in waitlist
        const existingEntry = await db.collection('waitlist').findOne({ email });
        if (existingEntry) {
          return res.status(400).json({ 
            success: false, 
            message: 'This email is already on our waitlist' 
          });
        }
        
        // Create waitlist entry object
        const waitlistEntry = {
          name,
          email,
          phone: phone || null,
          submittedAt: new Date(),
          status: 'pending', // pending, invited, registered
          source: 'landing_page'
        };
        
        // Insert waitlist entry
        console.log('Attempting to insert waitlist entry into MongoDB...');
        const result = await db.collection('waitlist').insertOne(waitlistEntry);
        console.log('MongoDB waitlist insert result:', result);
        
        // Return success
        return res.status(201).json({
          success: true,
          message: 'Successfully added to waitlist! We\'ll notify you when we launch.',
          entryId: result.insertedId
        });
      } catch (dbError: any) {
        console.error('DATABASE ERROR (waitlist):', dbError);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error while adding to waitlist',
          error: dbError.message
        });
      }
    } catch (error: any) {
      console.error('WAITLIST SUBMISSION ERROR:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error during waitlist submission',
        error: error.message
      });
    }
  });

  // Generate files using OpenAI from a refined plan (updated with strict validation)
  app.post("/api/generate-files-openai", async (req: Request, res: Response) => {
    try {
      const { refinedPrompt, settings = {} } = req.body;
      
      if (!refinedPrompt) {
        return res.status(400).json({ error: "refinedPrompt is required" });
      }

      console.log('🔄 Generating files with OpenAI:', { refinedPrompt, settings });

      // Use strict React generation
      const generatedApp = await planAppFiles(
        refinedPrompt,
        settings.framework || "React",
        settings.styling || "Tailwind CSS",
        settings.stateManagement || "React Hooks",
        settings.buildTool || "Vite"
      );

      // Validate the generated structure
      const validation = validateGeneratedCodeFlexible(generatedApp);
      
      if (!validation.isValid) {
        throw new Error(`Generated structure validation failed: ${validation.errors.join(', ')}`);
      }

      res.json(generatedApp);
    } catch (error: any) {
      console.error("Error in generate-files-openai:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // NEW: Generate files using Claude from a refined plan
  app.post("/api/generate-files-claude", async (req: Request, res: Response) => {
    try {
      const { refinedPrompt, settings = {} } = req.body;
      
      if (!refinedPrompt) {
        return res.status(400).json({ error: "refinedPrompt is required" });
      }

      console.log('🔄 Generating files with Claude:', { refinedPrompt, settings });

      // Use Claude for React generation
      const generatedApp = await planAppFilesWithClaude(
        refinedPrompt,
        settings.framework || "React",
        settings.styling || "Tailwind CSS",
        settings.stateManagement || "React Hooks",
        settings.buildTool || "Vite"
      );

      // Validate the generated structure
      const validation = validateGeneratedCodeFlexible(generatedApp);
      
      if (!validation.isValid) {
        throw new Error(`Generated structure validation failed: ${validation.errors.join(', ')}`);
      }

      res.json(generatedApp);
    } catch (error: any) {
      console.error("Error in generate-files-claude:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });
  
  // Error fixing endpoint - uses updated error fix agent
  app.post("/api/fix-errors", async (req: Request, res: Response) => {
    try {
      const { errors, files, framework, livePreviewError, aiProvider, iterative } = req.body;

      if (iterative) {
        let currentErrors = errors || [];
        let currentFiles = files;
        let attempt = 0;
        const maxAttempts = 3;
        const debugLog: DebugLogEntry[] = [];

        while (attempt < maxAttempts) {
          const result = await fixAppErrors(
            currentErrors,
            currentFiles,
            framework,
            livePreviewError,
            aiProvider
          );
          debugLog.push({ attempt: attempt + 1, errors: currentErrors, result });
          if (!result.success) {
            return res.status(400).json({ 
              error: result.error,
              debugInfo: result.debugInfo,
              debugLog
            });
          }
          // Check for new errors in the fixed files (simulate preview run)
          // For now, just check if result.files is different and if errors remain
          currentFiles = result.files || [];
          // In a real system, you might want to run a static check or preview simulation here
          // For now, break if no errors remain
          if (!livePreviewError && (!currentErrors || (Array.isArray(currentErrors) && currentErrors.length === 0))) {
            break;
          }
          // For demo: stop if files did not change
          if (JSON.stringify(currentFiles) === JSON.stringify(files)) {
            break;
          }
          attempt++;
        }
        return res.json({ success: true, files: currentFiles, debugLog });
      } else {
        const result = await fixAppErrors(
          errors || [],
          files,
          framework,
          livePreviewError,
          aiProvider
        );

        if (!result.success) {
          return res.status(400).json({ 
            error: result.error,
            debugInfo: result.debugInfo 
          });
        }

        res.json(result);
      }
    } catch (error: any) {
      console.error("Error in fix-errors:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // Chatbot Edit Agent Endpoint
  app.post("/api/chatbot-edit", async (req, res) => {
    try {
      const { message, codeFiles, conversationHistory } = req.body;
      const result = await handleChatbotEdit({ message, codeFiles, conversationHistory });
      res.json(result);
    } catch (error: any) {
      console.error("Error in chatbot-edit:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // Initial app idea feedback
  app.post("/api/conversation/initiate", async (req: Request, res: Response) => {
    try {
      const { refinedPrompt, aiProvider = 'openai' } = req.body;
      
      if (!refinedPrompt) {
        return res.status(400).json({ error: 'Missing refinedPrompt in request body' });
      }

      console.log('🤖 Processing conversation initiation with AI provider:', aiProvider);
      
      // Get feedback using the conversational bot agent
      const feedback = await getAppIdeaFeedback(refinedPrompt);
      
      if (!feedback) {
        throw new Error('Failed to generate feedback');
      }

      res.json({ 
        message: feedback,
        aiProvider: aiProvider.toLowerCase()
      });
    } catch (error: any) {
      console.error('❌ Error in conversation initiation:', error);
      res.status(500).json({ 
        error: 'Failed to process request',
        details: error.message 
      });
    }
  });

  // Update feedback
  app.post("/api/conversation/update", async (req: Request, res: Response) => {
    try {
      const { updatePrompt, appStateSummary, aiProvider = 'openai' } = req.body;
      
      if (!updatePrompt || !appStateSummary) {
        return res.status(400).json({ error: "updatePrompt and appStateSummary are required" });
      }

      console.log('🤖 Processing conversation update with AI provider:', aiProvider);
      
      const feedback = await getUpdateFeedback(updatePrompt, appStateSummary);
      
      if (!feedback) {
        throw new Error('Failed to generate update feedback');
      }

      res.json({ 
        message: feedback,
        aiProvider: aiProvider.toLowerCase()
      });
    } catch (error: any) {
      console.error("Error in conversation/update:", error);
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  });

  // MongoDB Connection Test Route
  app.get("/api/mongo-status", async (req: Request, res: Response) => {
    try {
      const client = await clientPromise;
      await client.db("admin").command({ ping: 1 });
      res.status(200).json({ status: "connected" });
    } catch (error: any) {
      console.error("MongoDB connection error:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // MongoDB Projects API Routes
  app.get("/api/mongo/projects", async (req: Request, res: Response) => {
    try {
      const client = await clientPromise;
      const db = client.db("zerocode");
      const projects = db.collection("projects");
      const userId = req.query.userId || 'anonymous';
      const userProjects = await projects.find({ userId }).sort({ updatedAt: -1 }).toArray();
      return res.status(200).json(userProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
  });

  app.get("/api/mongo/projects/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Invalid project ID" });
      let objectId;
      try { objectId = new ObjectId(id); } catch (error) { return res.status(400).json({ message: "Invalid project ID format" }); }
      const client = await clientPromise;
      const db = client.db("zerocode");
      const projects = db.collection("projects");
      const project = await projects.findOne({ _id: objectId });
      if (!project) return res.status(404).json({ message: "Project not found" });
      return res.status(200).json(project);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ message: "Error fetching project", error: error.message });
    }
  });

  app.post("/api/mongo/projects", async (req: Request, res: Response) => {
    try {
      const { name, prompt, generatedApp, userId = 'anonymous' } = req.body;
      if (!name || !prompt || !generatedApp) return res.status(400).json({ message: "Name, prompt, and generatedApp are required" });
      const newProject = { name, prompt, generatedApp, userId, createdAt: new Date(), updatedAt: new Date() };
      const client = await clientPromise;
      const db = client.db("zerocode");
      const projects = db.collection("projects");
      const result = await projects.insertOne(newProject);
      return res.status(201).json({ _id: result.insertedId, ...newProject });
    } catch (error: any) {
      console.error("Error creating project:", error);
      return res.status(500).json({ message: "Error creating project", error: error.message });
    }
  });

  app.put("/api/mongo/projects/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, prompt, generatedApp } = req.body;
      if (!id) return res.status(400).json({ message: "Invalid project ID" });
      let objectId;
      try { objectId = new ObjectId(id); } catch (error) { return res.status(400).json({ message: "Invalid project ID format" }); }
      const client = await clientPromise;
      const db = client.db("zerocode");
      const projects = db.collection("projects");
      const existingProject = await projects.findOne({ _id: objectId });
      if (!existingProject) return res.status(404).json({ message: "Project not found" });
      const updateData = { $set: { ...(name && { name }), ...(prompt && { prompt }), ...(generatedApp && { generatedApp }), updatedAt: new Date() } };
      await projects.updateOne({ _id: objectId }, updateData);
      const updatedProject = await projects.findOne({ _id: objectId });
      return res.status(200).json(updatedProject);
    } catch (error: any) {
      console.error("Error updating project:", error);
      return res.status(500).json({ message: "Error updating project", error: error.message });
    }
  });

  app.delete("/api/mongo/projects/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Invalid project ID" });
      let objectId;
      try { objectId = new ObjectId(id); } catch (error) { return res.status(400).json({ message: "Invalid project ID format" }); }
      const client = await clientPromise;
      const db = client.db("zerocode");
      const projects = db.collection("projects");
      const existingProject = await projects.findOne({ _id: objectId });
      if (!existingProject) return res.status(404).json({ message: "Project not found" });
      await projects.deleteOne({ _id: objectId });
      return res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      return res.status(500).json({ message: "Error deleting project", error: error.message });
    }
  });

  // MongoDB App Generation Route (updated with AI provider support)
  app.post("/api/mongo/generate", async (req: Request, res: Response) => {
    try {
      const { prompt, settings = {}, userId = 'anonymous' } = req.body;
      if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
      
      const aiProvider = settings.aiProvider || 'openai';
      console.log('🚀 Generate request with MongoDB caching:', { prompt, settings, aiProvider });
      
      const client = await clientPromise;
      const db = client.db("zerocode");
      const generationsCollection = db.collection("generations");
      
      // Check for existing generation (include AI provider in the query)
      const existingGeneration = await generationsCollection.findOne({ 
        prompt,
        'settings.framework': settings.framework || 'React',
        'settings.styling': settings.styling || 'Tailwind CSS',
        'settings.stateManagement': settings.stateManagement || 'React Hooks',
        'settings.aiProvider': aiProvider,
      });
      
      if (existingGeneration && existingGeneration.generatedApp) {
        console.log('✅ Using cached generation result for', aiProvider);
        await generationsCollection.updateOne(
          { _id: existingGeneration._id },
          { $set: { lastAccessed: new Date() } }
        );
        return res.status(200).json(existingGeneration.generatedApp);
      }
      
      // Generate new app with selected AI provider
      console.log(`🔄 Generating new app with ${aiProvider === 'claude' ? 'Claude 3.7 Sonnet' : 'OpenAI GPT-4'}`);
      
      const generatedApp = aiProvider === 'claude' 
        ? await planAppFilesWithClaude(
            prompt,
            settings.framework || "React",
            settings.styling || "Tailwind CSS",
            settings.stateManagement || "React Hooks",
            settings.buildTool || "Vite"
          )
        : await planAppFiles(
            prompt,
            settings.framework || "React",
            settings.styling || "Tailwind CSS",
            settings.stateManagement || "React Hooks",
            settings.buildTool || "Vite"
          );
      
      // Validate the generated app
      const validation = validateGeneratedCodeFlexible(generatedApp);
      if (!validation.isValid) {
        console.error(`❌ Generated app failed validation (${aiProvider}):`, validation.errors);
        return res.status(400).json({ 
          error: "Generated app validation failed",
          details: validation.errors 
        });
      }
      
      // Cache the generation (include AI provider)
      await generationsCollection.insertOne({
        prompt,
        settings: {
          framework: settings.framework || 'React',
          styling: settings.styling || 'Tailwind CSS',
          stateManagement: settings.stateManagement || 'React Hooks',
          buildTool: settings.buildTool || 'Vite',
          aiProvider: aiProvider
        },
        generatedApp,
        userId,
        createdAt: new Date(),
        lastAccessed: new Date()
      });
      
      console.log(`✅ App generated and cached successfully with ${generatedApp.files.length} files using ${aiProvider}`);
      return res.status(200).json(generatedApp);
      
    } catch (error: any) {
      console.error('❌ Error generating app with MongoDB caching:', error);
      res.status(500).json({ message: 'Failed to generate app', error: error.message });
    }
  });

  // Utility: Compute cosine similarity between two vectors
  function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum: number, ai: number, i: number) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum: number, ai: number) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum: number, bi: number) => sum + bi * bi, 0));
    return dot / (normA * normB);
  }

  // Utility: Get embedding for a string
  async function getEmbedding(text: string): Promise<number[]> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  }

  const httpServer = createServer(app);
  return httpServer;
}