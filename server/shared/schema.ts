import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project model for storing generated projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  framework: text("framework").notNull(),
  styling: text("styling").notNull(),
  stateManagement: text("state_management").notNull(),
  buildTool: text("build_tool").notNull(),
  prompt: text("prompt").notNull(),
  files: jsonb("files").notNull(),
  createdAt: text("created_at").notNull(),
});

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Project schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Define the file structure type
export const fileSchema: z.ZodType<any> = z.object({
  name: z.string(),
  path: z.string(),
  content: z.string().optional(),
  language: z.string().optional(),
  type: z.enum(["file", "folder"]),
  children: z.lazy(() => z.array(fileSchema)).optional(),
});

export type FileNode = z.infer<typeof fileSchema>;

// Creativity metrics schema
export const creativityMetricsSchema = z.object({
  score: z.number().min(0).max(100),
  novelty: z.number().min(0).max(100),
  usefulness: z.number().min(0).max(100),
  elegance: z.number().min(0).max(100),
  robustness: z.number().min(0).max(100),
  description: z.string(),
});

export type CreativityMetrics = z.infer<typeof creativityMetricsSchema>;

// Generated app type
export const generatedAppSchema = z.object({
  files: z.array(fileSchema),
  dependencies: z.record(z.string(), z.string()),
  devDependencies: z.record(z.string(), z.string()),
  creativityMetrics: creativityMetricsSchema.optional(),
});

export type GeneratedApp = z.infer<typeof generatedAppSchema>;
