// client/src/components/RecentProjects.tsx
import { useState, useEffect } from "react";
import { projectService, StoredProject } from "../services/ProjectService";
import { Clock, ArrowRight, Trash2, RefreshCw } from "lucide-react";

interface RecentProjectsProps {
  onLoadProject: (id: string) => void;
  isDarkMode?: boolean;
  className?: string;
}

export default function RecentProjects({ 
  onLoadProject, 
  isDarkMode = true, 
  className = ""
}: RecentProjectsProps) {
  const [recentProjects, setRecentProjects] = useState<StoredProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeClasses = isDarkMode 
    ? {
        bg: "bg-gray-900",
        border: "border-gray-800",
        hover: "hover:bg-gray-800",
        text: "text-white",
        textSecondary: "text-gray-400",
      }
    : {
        bg: "bg-white",
        border: "border-gray-200",
        hover: "hover:bg-gray-100",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
      };

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projects = await projectService.getRecentProjects(5);
      setRecentProjects(projects);
    } catch (error) {
      console.error("Error loading recent projects:", error);
      setError("Failed to load recent projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the onClick of the parent
    
    try {
      await projectService.deleteProject(id);
      setRecentProjects(prev => prev.filter(project => project._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete the project");
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${themeClasses.bg} border ${themeClasses.border} rounded-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium">Recent Projects</h3>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-12 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${themeClasses.bg} border ${themeClasses.border} rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <h3 className="font-medium">Recent Projects</h3>
        </div>
        <button 
          onClick={loadProjects}
          className="p-1 text-gray-400 hover:text-gray-200 rounded-full"
          title="Refresh projects"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {recentProjects.length === 0 ? (
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          No recent projects found. Generate your first app to see it here!
        </p>
      ) : (
        <div className="space-y-2">
          {recentProjects.map(project => (
            <div 
              key={project._id}
              onClick={() => onLoadProject(project._id)}
              className={`p-3 border ${themeClasses.border} rounded-md ${themeClasses.hover} cursor-pointer group flex justify-between items-center`}
            >
              <div>
                <h4 className="font-medium text-sm">{project.name}</h4>
                <p className={`text-xs ${themeClasses.textSecondary}`}>
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => handleDelete(project._id, e)}
                  className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                  aria-label="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
