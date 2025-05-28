import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ProjectSettings } from "@/lib/types";

interface ProjectSettingsProps {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
}

export default function ProjectSettingsComponent({
  settings,
  onChange,
  isComplete,
  isError,
  errorMessage,
}: ProjectSettingsProps) {
  const handleChange = (
    key: keyof ProjectSettings,
    value: string
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Project Details</h3>
        {isComplete && (
          <div className="flex items-center text-xs text-green-500">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span>Generated successfully</span>
          </div>
        )}
        {isError && (
          <div className="flex items-center text-xs text-red-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Generation failed</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Framework
          </span>
          <div className="relative">
            <Select
              value={settings.framework}
              onValueChange={(value) => handleChange("framework", value)}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="React">React</SelectItem>
                <SelectItem value="Vue">Vue</SelectItem>
                <SelectItem value="Angular">Angular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Styling
          </span>
          <div className="relative">
            <Select
              value={settings.styling}
              onValueChange={(value) => handleChange("styling", value)}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select styling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tailwind CSS">Tailwind CSS</SelectItem>
                <SelectItem value="Material UI">Material UI</SelectItem>
                <SelectItem value="Styled Components">Styled Components</SelectItem>
                <SelectItem value="CSS Modules">CSS Modules</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            State Management
          </span>
          <div className="relative">
            <Select
              value={settings.stateManagement}
              onValueChange={(value) => handleChange("stateManagement", value)}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select state management" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="React Hooks">React Hooks</SelectItem>
                <SelectItem value="Redux">Redux</SelectItem>
                <SelectItem value="Zustand">Zustand</SelectItem>
                <SelectItem value="Context API">Context API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Build Tool
          </span>
          <div className="relative">
            <Select
              value={settings.buildTool}
              onValueChange={(value) => handleChange("buildTool", value)}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select build tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vite">Vite</SelectItem>
                <SelectItem value="Webpack">Webpack</SelectItem>
                <SelectItem value="Create React App">Create React App</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
