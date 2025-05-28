// client/src/pages/home.tsx - Complete file with AI provider selection
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, RefreshCw, Plus, LogOut, User, Zap, Sparkles, Code, FileCode, ChevronDown } from "lucide-react";
import { useAppGeneration } from "@/hooks/useAppGeneration";
import { 
  TabType, 
  ProjectSettings, 
  FileNode, 
  Dependency,
  FrameworkType,
  StylingType,
  StateManagementType,
  BuildToolType,
  AIProvider
} from "@/lib/types";
import { GeneratedApp } from "@shared/schema";
import ChatInterface from "@/components/Chatinterface";
import ProjectFiles from "@/components/ProjectFiles";
import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import DependenciesView from "@/components/DependenciesView";
import CreativityMeter from "@/components/CreativityMeter";
import TemplatesComponent from "./templates";
import Documentation from "./Documentation";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add onProfileClick prop to the Home component
interface HomeProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

// Default files structure
const DEFAULT_FILES: FileNode[] = [
  { 
    name: "package.json", 
    path: "/package.json", 
    type: "file", 
    language: "json",
    content: `{
  "name": "generated-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}`
  },
  { 
    name: "src", 
    path: "/src", 
    type: "folder", 
    expanded: true, 
    children: [
      { 
        name: "App.jsx", 
        path: "/src/App.jsx", 
        type: "file", 
        language: "jsx",
        content: `import React from 'react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Generated App</h1>
      </header>
      <main>
        <p>Your app content will appear here</p>
      </main>
    </div>
  )
}

export default App`
      },
      { 
        name: "main.jsx", 
        path: "/src/main.jsx", 
        type: "file", 
        language: "jsx",
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`
      }
    ]
  }
];

// Default dependencies
const DEFAULT_DEPENDENCIES: Dependency[] = [
  { name: "react", version: "^18.2.0", category: "Core" },
  { name: "react-dom", version: "^18.2.0", category: "Core" }
];

const DEFAULT_DEV_DEPENDENCIES: Dependency[] = [
  { name: "vite", version: "^4.3.0", category: "Build Tool" }
];

export default function Home({ isDarkMode: propIsDarkMode, toggleTheme: propToggleTheme, onLogout, onProfileClick }: HomeProps) {
  // ====== ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL CALLS ======
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [activeFile, setActiveFile] = useState("App.jsx");
  const [isDarkMode, setIsDarkMode] = useState(propIsDarkMode !== undefined ? propIsDarkMode : true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiProviderDropdownOpen, setAiProviderDropdownOpen] = useState(false);
  const [selectedAIProvider, setSelectedAIProvider] = useState<AIProvider>("openai");
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    framework: "React" as FrameworkType,
    styling: "Tailwind CSS" as StylingType,
    stateManagement: "React Hooks" as StateManagementType,
    buildTool: "Vite" as BuildToolType,
  });
  
  // State for resizable panels
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Files and dependencies state
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [dependencies, setDependencies] = useState<Dependency[]>(DEFAULT_DEPENDENCIES);
  const [devDependencies, setDevDependencies] = useState<Dependency[]>(DEFAULT_DEV_DEPENDENCIES);

  // App generation logic - this is also a hook and must be at the top
  const { 
    generateApp, 
    reset,
    loadDemoApp,
    isGenerating, 
    isComplete, 
    error,
    generatedApp
  } = useAppGeneration({
    onSuccess: (data) => {
      console.log('✅ Generation success:', data);
      
      if (data.files && Array.isArray(data.files)) {
        // Convert flat files to nested folder structure
        const convertToNestedStructure = (files: any[]): FileNode[] => {
          const fileTree: FileNode[] = [];
          const folderMap = new Map<string, FileNode>();

          // Sort files to ensure folders are created before their contents
          const sortedFiles = [...files].sort((a, b) => {
            const pathA = a.path || a.name || '';
            const pathB = b.path || b.name || '';
            const depthA = pathA.split('/').length;
            const depthB = pathB.split('/').length;
            return depthA - depthB;
          });

          for (const file of sortedFiles) {
            const filePath = file.path || file.name || '';
            const pathParts = filePath.split('/');
            
            // Get language from file extension
            const getLanguage = (path: string) => {
              const extension = path.split('.').pop()?.toLowerCase() || '';
              const extensionMap: Record<string, string> = {
                tsx: 'typescript',
                ts: 'typescript', 
                jsx: 'jsx',
                js: 'javascript',
                css: 'css',
                html: 'html',
                json: 'json',
                md: 'markdown'
              };
              return extensionMap[extension] || 'text';
            };
            
            if (pathParts.length === 1) {
              // Root level file
              fileTree.push({
                name: pathParts[0],
                path: filePath,
                type: 'file',
                content: file.content || '',
                language: getLanguage(filePath)
              });
            } else {
              // File in folder - create nested structure
              let currentLevel = fileTree;
              let currentPath = '';
              
              // Navigate/create folder structure
              for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
                
                let folder = currentLevel.find(node => node.name === folderName && node.type === 'folder');
                
                if (!folder) {
                  folder = {
                    name: folderName,
                    path: currentPath,
                    type: 'folder',
                    expanded: true,
                    children: []
                  };
                  currentLevel.push(folder);
                  folderMap.set(currentPath, folder);
                }
                
                currentLevel = folder.children!;
              }
              
              // Add the file to the final folder
              currentLevel.push({
                name: pathParts[pathParts.length - 1],
                path: filePath,
                type: 'file',
                content: file.content || '',
                language: getLanguage(filePath)
              });
            }
          }

          return fileTree;
        };

        const nestedFiles = convertToNestedStructure(data.files);
        setFiles(nestedFiles);
        console.log('[Home] Files after generation:', nestedFiles);
        // Set active file to main entry file after generation
        const mainEntry = ["App.tsx", "App.jsx", "main.tsx", "main.jsx", "index.tsx", "index.jsx"];
        let found = null;
        for (const entry of mainEntry) {
          found = nestedFiles.find(f => f.name === entry && f.type === 'file');
          if (found) break;
        }
        if (found) {
          setActiveFile(found.name);
        } else if (nestedFiles.length > 0) {
          // Fallback to first file
          const firstFile = nestedFiles.find(f => f.type === 'file');
          if (firstFile) setActiveFile(firstFile.name);
        }
        
        setActiveTab("preview"); // Switch to preview tab after generation
      }
      
      // Process dependencies
      const mainDeps: Dependency[] = [];
      const devDeps: Dependency[] = [];
      
      if (data.dependencies) {
        Object.entries(data.dependencies).forEach(([name, version]) => {
          let category: Dependency["category"] = "Utility";
          if (name === "react" || name === "react-dom") category = "Core";
          else if (name.includes("router")) category = "Routing";
          else if (name.includes("ui") || name.includes("component")) category = "UI";
          else if (name.includes("redux") || name.includes("state") || name.includes("store")) category = "State Management";
          else if (name.includes("chart") || name.includes("graph") || name.includes("d3")) category = "Visualization";
          
          mainDeps.push({ name: String(name), version: String(version), category });
        });
      }
      
      if (data.devDependencies) {
        Object.entries(data.devDependencies).forEach(([name, version]) => {
          let category: Dependency["category"] = "Utility";
          if (name.includes("vite") || name.includes("webpack")) category = "Build Tool";
          else if (name.includes("eslint")) category = "Linting";
          else if (name.includes("jest") || name.includes("test")) category = "Testing";
          else if (name.includes("postcss") || name.includes("autoprefixer")) category = "CSS Processing";
          
          devDeps.push({ name: String(name), version: String(version), category });
        });
      }
      
      setDependencies(mainDeps);
      setDevDependencies(devDeps);
    },
    onError: (error) => {
      console.error('❌ Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====== ALL useEffect HOOKS MUST ALSO BE AT THE TOP ======
  
  // Apply theme changes to body
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  // Handle template selection
  useEffect(() => {
    if (selectedTemplate) {
      const templatePrompt = getTemplatePrompt(selectedTemplate);
      if (templatePrompt) {
        setPrompt(templatePrompt);
        console.log(`Template selected: ${selectedTemplate}`);
        console.log(`Prompt: ${templatePrompt}`);
        setTimeout(() => {
          handleUserPrompt(templatePrompt);
          toast({
            title: "Template Selected",
            description: `Creating a ${selectedTemplate.replace('-', ' ')} application using ${selectedAIProvider === 'openai' ? 'OpenAI' : 'Claude'}.`,
            duration: 3000,
          });
        }, 100);
        setSelectedTemplate(null);
      }
    }
  }, [selectedTemplate, selectedAIProvider]);

  // ====== ALL FUNCTION DEFINITIONS ======
  
  // Handle resize functionality with improved smoothness
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = leftPanelWidth;
    document.body.style.cursor = 'col-resize';
    
    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = '1000';
    overlay.style.cursor = 'col-resize';
    document.body.appendChild(overlay);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    
    requestAnimationFrame(() => {
      const containerWidth = contentRef.current?.offsetWidth || 1000;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.min(Math.max(startWidthRef.current + (delta / containerWidth) * 100, 30), 70);
      setLeftPanelWidth(newWidth);
    });
  };

  const stopResize = () => {
    resizingRef.current = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
    
    const overlay = document.getElementById('resize-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  };

  const toggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      setIsDarkMode(prev => !prev);
      
      toast({
        title: `Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode`,
        description: `The interface is now in ${!isDarkMode ? 'dark' : 'light'} mode.`,
        duration: 2000,
      });
    }
  };
  
  const handleNewProject = () => {
    setPrompt("");
    setFiles([...DEFAULT_FILES]);
    setDependencies([...DEFAULT_DEPENDENCIES]);
    setDevDependencies([...DEFAULT_DEV_DEPENDENCIES]);
    setActiveFile("App.jsx");
    setActiveTab("preview");
    
    reset();
    setChatKey(prev => prev + 1);
    
    toast({
      title: "New Project Started",
      description: "Enter a description to generate your app.",
      duration: 3000,
    });
  };
  
  const handleLogout = () => {
    if (onLogout) {
      toast({
        title: "Logging out",
        description: "You will be redirected to the login screen",
        duration: 1500,
      });
      
      setTimeout(() => {
        onLogout();
      }, 500);
    }
  };

  const handleAIProviderChange = (provider: AIProvider) => {
    setSelectedAIProvider(provider);
    setAiProviderDropdownOpen(false);
    
    toast({
      title: "AI Provider Changed",
      description: `Now using ${provider === 'openai' ? 'OpenAI GPT-4' : 'Claude 3.7 Sonnet'} for code generation.`,
      duration: 3000,
    });
  };
  
  const goToTemplates = () => {
    setShowTemplates(true);
    setShowDocumentation(false);
  };
  
  const goToDocumentation = () => {
    setShowDocumentation(true);
    setShowTemplates(false);
  };
  
  const goToHome = () => {
    setShowTemplates(false);
    setShowDocumentation(false);
  };
  
  const handleTemplateSelect = (templateId: string) => {
    console.log(`Template selected: ${templateId}`);
    setSelectedTemplate(templateId);
    setShowTemplates(false);
  };
  
  const getTemplatePrompt = (templateId: string): string => {
    const templates: Record<string, string> = {
      'e-commerce': 'Create an e-commerce app with product listings, shopping cart, and checkout flow. Include user authentication and payment processing. The app should have a home page with featured products, product detail pages, shopping cart, and checkout process. Use React for the frontend and handle state management efficiently.',
      'dashboard': 'Build me a data dashboard with multiple charts, filterable tables, and a sidebar navigation. The dashboard should support real-time updates. Include line charts, bar charts, and data tables with sorting and filtering capabilities. The dashboard should have a responsive layout and dark mode support.',
      'blog': 'Generate a blog application with article listings, search functionality, and a commenting system. Include an admin panel for creating and editing posts. The blog should have a clean, modern design with categories, tags, and featured posts. Include user authentication for commenting.',
      'todo-app': 'Create a modern todo app with task categories, due dates, and priority levels. Include drag and drop reordering and dark mode support. The app should allow users to create, edit, delete, and mark tasks as complete. Implement filters for showing active, completed, or all tasks.',
      'social-media': 'Build a social media app with a news feed, user profiles, and the ability to create posts with images. Include a direct messaging feature. The app should have a responsive design and support user authentication. Implement likes, comments, and sharing for posts.',
      'portfolio': 'Create a professional portfolio website with a home page, about section, projects showcase, skills section, and contact form. The design should be modern, responsive, and customizable. Include smooth scrolling and animations for a polished user experience.',
      'weather-app': 'Build a weather forecast application with current conditions and 7-day predictions. Include location search functionality, temperature display in both Celsius and Fahrenheit, and weather icons. The app should have a clean, intuitive interface with responsive design.',
      'note-taking': 'Develop a note-taking application with rich text editing, organization features, and search functionality. Allow users to create, edit, and delete notes. Implement categories or tags for organization and a responsive design that works on all devices.',
      'chat-application': 'Create a real-time chat application with channels, direct messages, and file sharing capabilities. Implement user authentication and online status indicators. The app should have a responsive design with support for emoji reactions and message threading.',
      'calendar': 'Build a calendar application with event scheduling, reminders, and sharing features. Allow users to create, edit, and delete events with custom colors. Implement different views (day, week, month) and recurring event support.',
      'recipe-app': 'Develop a recipe collection app with search, favorites, and meal planning features. Include detailed recipe views with ingredients, instructions, and nutrition information. Implement a responsive design with filtering options for dietary restrictions.',
      'fitness-tracker': 'Create a fitness tracking app with workout logging, progress charts, and goal setting. Allow users to track different types of exercises, set personal records, and view progress over time. Implement a responsive design with visualization of fitness data.',
    };
    
    if (!templates[templateId]) {
      console.warn(`No prompt found for template ID: ${templateId}. Using default prompt.`);
      return 'Create a React web application with a modern, responsive design using best practices for state management, routing, and component structure. The app should have a clean UI with intuitive navigation.';
    }
    
    return templates[templateId];
  };

  const [systemMessage, setSystemMessage] = useState<string>("");

  // New: handle user prompt for chat bot
  const handleUserPrompt = async (userPrompt: string) => {
    setSystemMessage(""); // Clear previous system message
    try {
      // Show a temporary thinking message (optional)
      setSystemMessage("Thinking...");
      // Call the conversation feedback endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await fetch(`${apiUrl}/api/conversation/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refinedPrompt: userPrompt })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setSystemMessage(data.message);
        // After a short delay, trigger app generation
        setTimeout(() => {
          generateApp(userPrompt, { ...projectSettings, aiProvider: selectedAIProvider });
        }, 1200);
      } else {
        setSystemMessage(data.error ? String(data.error) : 'Failed to get feedback.');
      }
    } catch (err: any) {
      setSystemMessage('Error contacting feedback API. ' + (err?.message || String(err)));
    }
  };

  const handleGenerate = (promptText: string) => {
    console.log('🚀 Generating app with prompt:', promptText, 'using AI provider:', selectedAIProvider);
    generateApp(promptText, { ...projectSettings, aiProvider: selectedAIProvider });
  };

  const handleClearChat = () => {
    setPrompt("");
    setChatKey(prev => prev + 1);
    
    toast({
      title: "Chat Cleared",
      description: "Chat history has been cleared.",
      duration: 2000,
    });
  };

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
      };

  // ====== CONDITIONAL RENDERING - MOVED TO THE END ======
  // This should be the ONLY place with conditional returns
  
  if (showTemplates) {
    return (
      <TemplatesComponent 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        goToHome={goToHome}
        onSelectTemplate={handleTemplateSelect}
        goToDocumentation={goToDocumentation}
      />
    );
  }

  if (showDocumentation) {
    return (
      <Documentation
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        goToHome={goToHome}
        goToTemplates={goToTemplates}
      />
    );
  }

  // Main component render
  return (
    <div className={`h-screen flex flex-col ${themeClasses.bg} ${themeClasses.text} overflow-hidden transition-colors duration-200`}>
      {/* Top Navigation Bar */}
      <header className={`${themeClasses.gradient} shadow-md py-3 px-4 transition-colors duration-200`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/zerocode_white.png"
              alt="ZeroCode Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={handleNewProject} 
              className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
            <button 
              onClick={goToTemplates} 
              className="flex items-center space-x-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-md transition-colors duration-150 shadow-sm"
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
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
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
                {dropdownOpen && (
                  <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg ${themeClasses.card} border ${themeClasses.border} overflow-hidden z-50`}>
                    <button 
                      className="flex w-full items-center text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left"
                      
                    > 
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </button>
                    <button className="flex w-full items-center text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left">
                      <Sparkles className="h-4 w-4 mr-2" />
                      <span>Subscription</span>
                    </button>
                    <button className="flex w-full items-center text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </button>
                    <div className={`h-px ${themeClasses.border} my-1`}></div>
                    <button
                      className="flex w-full items-center text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left text-red-500"
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

      <div id="main-container" ref={contentRef} className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left panel for chat interface */}
        <div 
          className={`h-full overflow-hidden flex flex-col ${themeClasses.bg} transition-colors duration-200 border-r ${themeClasses.border}`}
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className={`flex items-center px-4 py-2 ${themeClasses.bg} ${themeClasses.border} border-b space-x-2`}>
            <button 
              onClick={handleNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md flex items-center space-x-1 text-xs transition-colors duration-150"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </button>

            {/* AI Provider Dropdown */}
            <div className="relative">
              <DropdownMenu open={aiProviderDropdownOpen} onOpenChange={setAiProviderDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={`flex items-center space-x-1 px-2 py-1.5 text-xs rounded-md transition-colors duration-150 ${themeClasses.card} border ${themeClasses.border} hover:${themeClasses.highlight}`}
                    aria-label="Select AI Provider"
                  >
                    <span className="text-xs font-medium">
                      {selectedAIProvider === 'openai' ? 'OpenAI' : 'Claude'}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                {aiProviderDropdownOpen && (
                  <div className={`absolute left-0 mt-1 w-32 rounded-md shadow-lg ${themeClasses.card} border ${themeClasses.border} overflow-hidden z-50`}>
                    <button
                      className={`flex w-full items-center text-xs px-3 py-2 hover:${themeClasses.highlight} cursor-pointer text-left ${selectedAIProvider === 'openai' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => handleAIProviderChange('openai')}
                    >
                      <span className="font-medium">OpenAI</span>
                      {selectedAIProvider === 'openai' && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                    <button
                      className={`flex w-full items-center text-xs px-3 py-2 hover:${themeClasses.highlight} cursor-pointer text-left ${selectedAIProvider === 'claude' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => handleAIProviderChange('claude')}
                    >
                      <span className="font-medium">Claude</span>
                      {selectedAIProvider === 'claude' && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  </div>
                )}
              </DropdownMenu>
            </div>
          </div>
          
          <ChatInterface
            key={`chat-${chatKey}`}
            onGenerate={handleGenerate}
            onClear={handleClearChat}
            isGenerating={isGenerating}
            prompt={prompt}
            setPrompt={setPrompt}
            isDarkMode={isDarkMode}
            externalSystemMessage={systemMessage}
            onUserPrompt={handleUserPrompt}
          />
        </div>
            
        {/* Resize handle */}
        <div 
          className={`w-1 ${isDarkMode ? 'bg-gray-800 hover:bg-blue-500' : 'bg-gray-200 hover:bg-blue-400'} cursor-col-resize z-10 hover:w-1.5 transition-all duration-150 ease-in-out`}
          onMouseDown={startResize}
        ></div>
            
        {/* Right panel for preview and editor */}
        <div 
          className="h-full flex flex-col overflow-hidden flex-1"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Tabs */}
          <div className={`flex items-center border-b ${themeClasses.border} px-4 ${themeClasses.bg} h-10 transition-colors duration-200`}>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-sm border-b-2 transition-colors duration-150 ${
                activeTab === "preview"
                  ? "border-blue-500 text-blue-500"
                  : `border-transparent ${themeClasses.textSecondary} hover:text-gray-200`
              }`}
            >
              Live Preview
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 text-sm border-b-2 transition-colors duration-150 ${
                activeTab === "editor"
                  ? "border-blue-500 text-blue-500"
                  : `border-transparent ${themeClasses.textSecondary} hover:text-gray-200`
              }`}
            >
              Code Editor
            </button>
            
            <button
              className="ml-auto p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Refresh preview"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {activeTab === "editor" && files && files.length > 0 && (
              <div className="flex h-full">
                <div className={`w-56 border-r ${themeClasses.border} ${themeClasses.sidebar} overflow-auto transition-colors duration-200`}>
                  <ProjectFiles
                    files={files}
                    activeFile={activeFile}
                    onSelectFile={(filename) => setActiveFile(filename)}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    files={files}
                    activeFile={activeFile}
                  />
                </div>
              </div>
            )}
            
            {activeTab === "preview" && (
              <div className="h-full w-full flex-1 overflow-hidden flex flex-col" style={{ minHeight: '0' }}>
                <LivePreview
                  isGenerating={isGenerating}
                  isComplete={isComplete}
                  isError={!!error}
                  onRegenerateClick={() => handleGenerate(prompt)}
                  generatedFiles={files}
                  generatedApp={generatedApp ?? undefined}
                  aiProvider={selectedAIProvider}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`${themeClasses.bg} border-t ${themeClasses.border} py-2 px-4 text-xs ${themeClasses.textSecondary} text-center transition-colors duration-200`}>
        ©2025 ZeroCode Labs. All Rights Reserved.
      </footer>
    </div>
  );
}