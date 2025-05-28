import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  onClear: () => void;
  onLoadExample: () => void;
  onTestError?: () => void; // Optional function to test error handling
  isGenerating: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
}

const MAX_PROMPT_LENGTH = 1000;

export default function PromptInput({
  onGenerate,
  onClear,
  onLoadExample,
  onTestError,
  isGenerating,
  prompt,
  setPrompt,
}: PromptInputProps) {
  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
    }
  };

  const handleCtrlEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-2">Describe Your App</h2>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
          onKeyDown={handleCtrlEnter}
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
          placeholder="Describe your app idea in plain English. For example: 'Build me a React dashboard with a data table and chart for tracking sales data'"
          disabled={isGenerating}
        />
        <div className="absolute right-3 bottom-3 flex items-center space-x-1 text-xs text-gray-500">
          <span>{prompt.length}</span>
          <span>/</span>
          <span>{MAX_PROMPT_LENGTH}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-3 space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate App</span>
            )}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Describe the app you want to create in natural language. Try to be as specific as possible about features, layouts, and functionality.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadExample}
            disabled={isGenerating}
          >
            Load Example
          </Button>
          {onTestError && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTestError}
              disabled={isGenerating}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
            >
              Load Demo App
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={isGenerating || !prompt}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
