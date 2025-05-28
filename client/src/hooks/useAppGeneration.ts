// client/src/hooks/useAppGeneration.ts - Fixed AI Provider routing
import { useState } from "react";
import { ProjectSettings } from "@/lib/types";
import { GeneratedApp } from "@shared/schema";

interface UseAppGenerationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAppGeneration({ onSuccess, onError }: UseAppGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);

  const generateApp = async (prompt: string, settings: ProjectSettings) => {
    setIsGenerating(true);
    setIsComplete(false);
    setError(null);
    setGeneratedApp(null);

    try {
      console.log('🚀 Starting app generation:', { prompt, settings });
      console.log('🔍 AI Provider selected:', settings.aiProvider || 'openai (default)');
      
      // Get API URL from environment or use default
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // Choose endpoint based on AI provider
      const endpoint = settings.aiProvider === 'claude' 
        ? '/api/generate-react-structure-claude' 
        : '/api/generate-react-structure';
      
      console.log('📡 Making request to:', `${apiUrl}${endpoint}`);
      console.log('📡 Using AI provider:', settings.aiProvider || 'openai');
      
      const requestBody = {
        prompt,
        settings: {
          framework: settings.framework || "React",
          styling: settings.styling || "Tailwind CSS",
          stateManagement: settings.stateManagement || "React Hooks",
          buildTool: settings.buildTool || "Vite",
          aiProvider: settings.aiProvider || 'openai'
        }
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Generation successful with AI provider:', settings.aiProvider || 'openai');
      console.log('✅ Response data:', data);

      // Validate that we have the expected structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: expected object');
      }

      if (!data.files || !Array.isArray(data.files)) {
        throw new Error('Invalid response format: files array missing');
      }

      // Ensure each file has the required properties
      const validatedFiles = data.files.map((file: any) => ({
        ...file,
        name: file.name || file.path?.split('/').pop() || 'unknown',
        path: file.path || file.name || 'unknown',
        type: file.type || 'file',
        content: file.content || ''
      }));

      const validatedData = {
        ...data,
        files: validatedFiles
      };

      setGeneratedApp(validatedData);
      setIsComplete(true);
      onSuccess?.(validatedData);
    } catch (err) {
      console.error('❌ Generation failed:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setIsGenerating(false);
    setIsComplete(false);
    setError(null);
    setGeneratedApp(null);
  };

  const loadDemoApp = () => {
    // Demo app functionality
    console.log('Loading demo app...');
  };

  return {
    generateApp,
    reset,
    loadDemoApp,
    isGenerating,
    isComplete,
    error,
    generatedApp,
  };
}