// client/src/services/ProjectService.ts
import { apiRequest } from "@/lib/queryClient";
import { GeneratedApp } from "@shared/schema";
import { ProjectSettings } from "@/lib/types";

export interface StoredProject {
  _id: string;
  name: string;
  prompt: string;
  userId?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  generatedApp: GeneratedApp;
  settings?: ProjectSettings;
  favorite?: boolean;
}

class ProjectService {
  // Fetch all projects
  async getAllProjects(): Promise<StoredProject[]> {
    try {
      const response = await apiRequest("GET", "/api/mongo/projects");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      const projects = await response.json();
      return projects;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }
  
  // Get a specific project by ID
  async getProject(id: string): Promise<StoredProject> {
    try {
      const response = await apiRequest("GET", `/api/mongo/projects/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      
      const project = await response.json();
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new project
  async createProject(
    name: string, 
    prompt: string, 
    generatedApp: GeneratedApp,
    settings?: ProjectSettings,
    userId?: string
  ): Promise<StoredProject> {
    try {
      const response = await apiRequest("POST", "/api/mongo/projects", {
        name,
        prompt,
        generatedApp,
        settings,
        userId
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }
      
      const newProject = await response.json();
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }
  
  // Update an existing project
  async updateProject(
    id: string,
    updates: {
      name?: string;
      prompt?: string;
      generatedApp?: GeneratedApp;
      settings?: ProjectSettings;
    }
  ): Promise<StoredProject> {
    try {
      const response = await apiRequest("PUT", `/api/mongo/projects/${id}`, updates);
      
      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }
      
      const updatedProject = await response.json();
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }
  
  // Delete a project
  async deleteProject(id: string): Promise<void> {
    try {
      const response = await apiRequest("DELETE", `/api/mongo/projects/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
  
  // Generate a new app with MongoDB caching
  async generateApp(prompt: string, settings: ProjectSettings, userId?: string): Promise<GeneratedApp> {
    try {
      const response = await apiRequest("POST", "/api/mongo/generate", {
        prompt,
        settings,
        userId
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate app: ${response.statusText}`);
      }
      
      const generatedApp = await response.json();
      return generatedApp;
    } catch (error) {
      console.error("Error generating app:", error);
      throw error;
    }
  }
  
  // Helper method to get recent projects
  async getRecentProjects(limit: number = 5): Promise<StoredProject[]> {
    const allProjects = await this.getAllProjects();
    
    // Sort by updatedAt in descending order and take the first `limit` items
    return allProjects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
}

// Export a singleton instance
export const projectService = new ProjectService();