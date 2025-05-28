// client/src/lib/types.ts - Updated with AI Provider
export type FrameworkType = "React" | "Vue" | "Angular";
export type StylingType = "Tailwind CSS" | "Material UI" | "Styled Components" | "CSS Modules";
export type StateManagementType = "React Hooks" | "Redux" | "Zustand" | "Context API";
export type BuildToolType = "Vite" | "Webpack" | "Create React App";
export type AIProvider = "openai" | "claude";

export interface ProjectSettings {
  framework: FrameworkType;
  styling: StylingType;
  stateManagement: StateManagementType;
  buildTool: BuildToolType;
  aiProvider?: AIProvider; // Add AI provider to project settings
}

export interface FileNode {
  name: string;
  path: string;
  content?: string;
  language?: string;
  type: "file" | "folder";
  children?: FileNode[];
  expanded?: boolean;
  active?: boolean;
}

export interface Dependency {
  name: string;
  version: string;
  category: "Core" | "Routing" | "Styling" | "State Management" | "Build Tool" | "UI" | "Visualization" | "Utility" | "Testing" | "Linting" | "CSS Processing";
}

// Note: We now import GeneratedApp interface from @shared/schema
// This is legacy and just for compatibility:
// export interface GeneratedApp {
//   files: FileNode[];
//   dependencies: Record<string, string>;
//   devDependencies: Record<string, string>;
//   creativityMetrics?: CreativityMetrics;
// }

export type PreviewSizeType = "mobile" | "tablet" | "desktop";

export type TabType = "editor" | "preview" | "dependencies";