// client/src/pages/templates.tsx 
// Fixed to enable proper scrolling
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, ArrowLeft, Search, User, LogOut, Plus, FileCode, Code } from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
 
interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  popularity: number;
  tags: string[];
}

interface TemplatesComponentProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  goToHome: () => void;
  onSelectTemplate: (templateId: string) => void;
  goToDocumentation?: () => void;
}

export default function TemplatesComponent({
  isDarkMode,
  toggleTheme,
  goToHome,
  onSelectTemplate,
  goToDocumentation
}: TemplatesComponentProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Handle logout
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You will be redirected to the landing page",
      duration: 1500,
    });
    
    // Short delay to show toast before logout
    setTimeout(() => {
      logout();
      navigate('/');
    }, 500);
  };
  
  /* Navigate to profile
  const goToProfile = () => {
    navigate('/profile');
  }; */
  
  // Apply a template and go back to home page
  const applyTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
  };
  
  // Popular templates data
  const templates: Template[] = [
    {
      id: "e-commerce",
      name: "E-Commerce Store",
      description: "A full-featured online store with product listings, shopping cart, and checkout flow",
      icon: "🛒",
      category: "business",
      popularity: 95,
      tags: ["business", "store", "shopping", "payments"]
    },
    {
      id: "dashboard",
      name: "Data Dashboard",
      description: "Interactive analytics dashboard with multiple charts, filterable tables, and real-time updates",
      icon: "📊",
      category: "data",
      popularity: 92,
      tags: ["data", "charts", "analytics", "dashboard"]
    },
    {
      id: "blog",
      name: "Blog Platform",
      description: "Modern blog with article listings, search, commenting system, and admin panel",
      icon: "✍️",
      category: "content",
      popularity: 88,
      tags: ["blog", "cms", "content", "writing"]
    },
    {
      id: "todo-app",
      name: "Todo App",
      description: "Task management app with categories, due dates, priorities, and drag-and-drop",
      icon: "✅",
      category: "productivity",
      popularity: 90,
      tags: ["productivity", "tasks", "organization"]
    },
    {
      id: "social-media",
      name: "Social Media App",
      description: "Social platform with news feed, user profiles, posts, and messaging",
      icon: "👥",
      category: "social",
      popularity: 87,
      tags: ["social", "messaging", "profiles", "feed"]
    },
    {
      id: "portfolio",
      name: "Portfolio Website",
      description: "Professional portfolio site to showcase your work and skills",
      icon: "💼",
      category: "personal",
      popularity: 85,
      tags: ["portfolio", "personal", "career"]
    },
    {
      id: "weather-app",
      name: "Weather App",
      description: "Weather forecast app with location search and 7-day predictions",
      icon: "🌤️",
      category: "utility",
      popularity: 82,
      tags: ["weather", "forecast", "utility"]
    },
    {
      id: "note-taking",
      name: "Note Taking App",
      description: "Note-taking application with rich text editing and organization features",
      icon: "📝",
      category: "productivity",
      popularity: 86,
      tags: ["notes", "productivity", "writing"]
    },
    {
      id: "chat-application",
      name: "Chat Application",
      description: "Real-time chat app with channels, direct messages, and file sharing",
      icon: "💬",
      category: "social",
      popularity: 84,
      tags: ["chat", "messaging", "social"]
    },
    {
      id: "calendar",
      name: "Calendar App",
      description: "Calendar application with event scheduling, reminders, and sharing",
      icon: "📅",
      category: "productivity",
      popularity: 81,
      tags: ["calendar", "scheduling", "productivity"]
    },
    {
      id: "recipe-app",
      name: "Recipe App",
      description: "Recipe collection app with search, favorites, and meal planning",
      icon: "🍳",
      category: "lifestyle",
      popularity: 79,
      tags: ["recipes", "food", "cooking"]
    },
    {
      id: "fitness-tracker",
      name: "Fitness Tracker",
      description: "Fitness tracking app with workout logging, progress charts, and goals",
      icon: "💪",
      category: "health",
      popularity: 80,
      tags: ["fitness", "health", "tracking"]
    },
  ];
  
  // Categories for filtering
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "business", name: "Business" },
    { id: "productivity", name: "Productivity" },
    { id: "social", name: "Social" },
    { id: "data", name: "Data & Analytics" },
    { id: "content", name: "Content" },
    { id: "personal", name: "Personal" },
    { id: "utility", name: "Utility" },
    { id: "health", name: "Health & Fitness" },
    { id: "lifestyle", name: "Lifestyle" },
  ];

  // Filter templates based on search query and active category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === "all" || 
      template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort templates by popularity
  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.popularity - a.popularity);
  
  // Theme classes
  const themeClasses = isDarkMode 
    ? {
        bg: "bg-gray-950",
        border: "border-gray-800",
        text: "text-white",
        textSecondary: "text-gray-400",
        sidebar: "bg-gray-950",
        input: "bg-gray-900",
        card: "bg-gray-900",
        highlight: "bg-gray-800",
        preview: "bg-gray-950",
        activeButton: "bg-blue-600 text-white",
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600",
        button: "bg-gray-800",
        buttonActive: "bg-blue-600",
        cardHover: "hover:bg-gray-800",
      }
    : {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
        sidebar: "bg-white",
        input: "bg-white",
        card: "bg-white",
        highlight: "bg-gray-100",
        preview: "bg-white",
        activeButton: "bg-blue-500 text-white",
        gradient: "bg-gradient-to-r from-blue-500 to-purple-500",
        button: "bg-gray-100",
        buttonActive: "bg-blue-500",
        cardHover: "hover:bg-gray-100",
      };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.bg} ${themeClasses.text} transition-colors duration-200`}>
      {/* Top Navigation Bar - Fixed header */}
      <header className={`${themeClasses.gradient} shadow-md py-3 px-4 transition-colors duration-200 sticky top-0 z-50`}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo and name */}
          <div className="flex items-center space-x-3">
            <img
              src="/zerocode_white.png"
              alt="ZeroCode Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={goToHome} 
              className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
            >
              <FileCode className="h-4 w-4" />
              <span>Templates</span>
            </button>
            <button 
              onClick={goToDocumentation}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
            >
              <Code className="h-4 w-4" />
              <span>Documentation</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-md bg-white bg-opacity-10 hover:bg-opacity-20 text-white transition-colors shadow-sm"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {/* User dropdown menu */}
            <div className="relative">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm cursor-pointer"
                    aria-label="User menu"
                  >
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </button>
                </DropdownMenuTrigger>
                {/* Manual dropdown implementation */}
                {dropdownOpen && (
                  <div
                    className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg ${themeClasses.card} border ${themeClasses.border} overflow-hidden z-50`}
                  >
                    <button
                      className={`flex w-full items-center text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left`}
                      
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </button>
                    <div className={`h-px ${themeClasses.border} my-1`}></div>
                    <button
                      className={`flex w-full items-center text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left text-red-500`}
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Back button and title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button 
                onClick={goToHome}
                className={`p-1 rounded-full ${themeClasses.button} ${themeClasses.text} transition-colors duration-150`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold">Popular Templates</h1>
            </div>
            
            {/* Search bar */}
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 px-3 pr-10 rounded-md text-sm ${themeClasses.input} ${themeClasses.text} focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200`}
              />
              <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.textSecondary}`} />
            </div>
          </div>
          
          {/* Category filter */}
          <div className="flex flex-wrap mb-6 gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-150 ${
                  activeCategory === category.id
                    ? `${themeClasses.buttonActive} text-white`
                    : `${themeClasses.button} ${themeClasses.text}`
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {sortedTemplates.map(template => (
              <div 
                key={template.id}
                onClick={() => applyTemplate(template.id)}
                className={`${themeClasses.card} border ${themeClasses.border} rounded-lg p-4 ${themeClasses.cardHover} cursor-pointer transition-all duration-200 hover:shadow-md transform hover:-translate-y-1 flex flex-col`}
              >
                <div className="flex items-start mb-2">
                  <div className="text-3xl mr-3">{template.icon}</div>
                  <div>
                    <h3 className={`font-medium text-base ${themeClasses.text}`}>{template.name}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-300 rounded-full h-1.5 mr-2 dark:bg-gray-700">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${template.popularity}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-500">{template.popularity}% popular</span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm ${themeClasses.textSecondary} mb-3 flex-1`}>
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <span key={tag} className={`text-sm px-2 py-0.5 rounded-full ${themeClasses.highlight} ${themeClasses.textSecondary}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty state */}
          {filteredTemplates.length === 0 && (
            <div className={`text-center py-10 ${themeClasses.textSecondary}`}>
              <p className="text-lg mb-2">No templates found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`${themeClasses.bg} border-t ${themeClasses.border} py-2 px-4 text-xs ${themeClasses.textSecondary} text-center transition-colors duration-200`}>
        ©2025 ZeroCode Labs. All Rights Reserved.
      </footer>
    </div>
  );
}