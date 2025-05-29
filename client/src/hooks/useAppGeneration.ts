// client/src/hooks/useAppGeneration.ts - Fixed AI Provider routing
import { useState } from "react";
import { ProjectSettings } from "@/lib/types";
import { API_URL } from '../config/env';

interface UseAppGenerationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useAppGeneration({ onSuccess, onError }: UseAppGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [generatedApp, setGeneratedApp] = useState<any | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateApp = async (prompt: string, settings: ProjectSettings) => {
    setIsGenerating(true);
    setIsComplete(false);
    setError(null);
    setGeneratedApp(null);

    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log('🚀 Starting app generation:', { prompt, settings });
        console.log('🔍 AI Provider selected:', settings.aiProvider || 'openai (default)');
        
        // Choose endpoint based on AI provider
        const endpoint = settings.aiProvider === 'claude' 
          ? 'generate-react-structure-claude' 
          : 'generate-react-structure';
        
        // Remove trailing slash from API_URL if present and ensure no double /api
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const fullUrl = `${baseUrl}/${endpoint}`;
        
        console.log('📡 Making request to:', fullUrl);
        
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
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          credentials: 'include'
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ API Error Response:', errorData);
          
          // If it's a 504 Gateway Timeout, retry
          if (response.status === 504) {
            throw new Error('Gateway Timeout - Retrying...');
          }
          
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
        return; // Success - exit the retry loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`❌ Generation attempt ${retryCount + 1} failed:`, lastError);
        
        // If it's not the last retry, wait before trying again
        if (retryCount < MAX_RETRIES - 1) {
          console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`);
          await sleep(RETRY_DELAY);
        }
        
        retryCount++;
      }
    }

    // If we get here, all retries failed
    console.error('❌ All generation attempts failed:', lastError);
    setError(lastError);
    if (lastError) {
      onError?.(lastError);
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