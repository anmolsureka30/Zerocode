// server/config/openai.ts - Configuration for maximum prompt adherence

import OpenAI from "openai";

export const OPENAI_CONFIG = {
  // Model selection - best for strict prompt following
  MODEL: "gpt-4-turbo",
  
  // Settings for maximum prompt adherence
  STRICT_SETTINGS: {
    temperature: 0.1,        // Very low for consistency
    top_p: 0.1,             // Low for deterministic output
    frequency_penalty: 0.1,  // Slight penalty for repetition
    presence_penalty: 0.0,   // No penalty for new topics
    max_tokens: 4000,        // Max tokens for GPT-4-turbo (within limit)
  },
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Validation rules
  VALIDATION: {
    REQUIRED_REACT_FILES: [
      'package.json',
      'tsconfig.json', 
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      'index.html',
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css'
    ],
    REQUIRED_DEPENDENCIES: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    REQUIRED_DEV_DEPENDENCIES: [
      '@types/react',
      '@types/react-dom',
      '@vitejs/plugin-react',
      'typescript',
      'vite',
      'tailwindcss'
    ],
    FORBIDDEN_CONTENT: [
      '// TODO',
      '// Add logic here',
      '// Implementation needed',
      '// Placeholder',
      'TODO:',
      'FIXME:',
      'PLACEHOLDER_',
      'ADD_YOUR_'
    ]
  }
};

// Error handling for OpenAI requests
export async function callOpenAIWithRetry(
  openai: OpenAI,
  requestConfig: any,
  maxRetries: number = OPENAI_CONFIG.MAX_RETRIES
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 OpenAI attempt ${attempt}/${maxRetries}`);
      
      const response = await openai.chat.completions.create({
        ...requestConfig,
        ...OPENAI_CONFIG.STRICT_SETTINGS
      });

      if (!response.choices[0]?.message?.content) {
        throw new Error("Empty response from OpenAI");
      }

      console.log(`✅ OpenAI request successful on attempt ${attempt}`);
      return response;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ OpenAI attempt ${attempt} failed:`, error.message);

      // Don't retry on certain errors
      if (error.code === 'invalid_api_key' || error.code === 'model_not_found') {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, OPENAI_CONFIG.RETRY_DELAY * attempt));
      }
    }
  }

  throw new Error(`OpenAI request failed after ${maxRetries} attempts: ${lastError?.message}`);
}

// Comprehensive validation function
export function validateGeneratedCode(structure: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Structure validation
  if (!structure || typeof structure !== 'object') {
    errors.push("Invalid structure: not an object");
    return { isValid: false, errors, warnings };
  }

  // Files validation
  if (!Array.isArray(structure.files)) {
    errors.push("Invalid files: not an array");
  } else {
    // Check required files
    const filePaths = structure.files.map((f: any) => f.path);
    for (const requiredFile of OPENAI_CONFIG.VALIDATION.REQUIRED_REACT_FILES) {
      if (!filePaths.includes(requiredFile)) {
        errors.push(`Missing required file: ${requiredFile}`);
      }
    }

    // Validate each file
    for (const file of structure.files) {
      if (!file.path || !file.content || !file.type) {
        errors.push(`Invalid file structure: ${JSON.stringify(file)}`);
        continue;
      }

      // Check for forbidden content (but allow "placeholder" in specific contexts)
      for (const forbidden of OPENAI_CONFIG.VALIDATION.FORBIDDEN_CONTENT) {
        if (forbidden === 'placeholder' || forbidden === 'PLACEHOLDER') {
          // Allow "placeholder" in specific contexts like HTML attributes
          const placeholderRegex = /placeholder[\s]*[=:]/i;
          const commentPlaceholder = /(\/\/|\/\*|\{\/\*).*placeholder/i;
          const variablePlaceholder = /const|let|var.*placeholder/i;
          
          if (commentPlaceholder.test(file.content) || variablePlaceholder.test(file.content)) {
            errors.push(`File ${file.path} contains forbidden placeholder content in comments or variables`);
          }
        } else if (file.content.includes(forbidden)) {
          errors.push(`File ${file.path} contains forbidden content: ${forbidden}`);
        }
      }

      // TypeScript validation - check for proper props interfaces
      if (file.path.endsWith('.tsx') && file.content.includes('children')) {
        // Check if React.FC with children has proper props interface
        const hasReactFC = file.content.includes('React.FC');
        const hasPropsWithChildren = file.content.includes('React.PropsWithChildren');
        const hasChildrenProp = file.content.includes('children:');
        const hasDestructuredChildren = file.content.includes('{ children }');
        
        if (hasReactFC && !hasPropsWithChildren && !hasChildrenProp && !hasDestructuredChildren) {
          errors.push(`React component ${file.path} uses children but missing proper TypeScript props interface`);
        }
      }

      // React component validation
      if (file.path.endsWith('.tsx') && file.path.includes('/components/')) {
        if (!file.content.includes('export default') && !file.content.includes('export const')) {
          errors.push(`React component ${file.path} missing export`);
        }
      }
    }
  }

  // Dependencies validation
  if (!structure.dependencies || typeof structure.dependencies !== 'object') {
    errors.push("Invalid dependencies: not an object");
  } else {
    for (const dep of OPENAI_CONFIG.VALIDATION.REQUIRED_DEPENDENCIES) {
      if (!structure.dependencies[dep]) {
        errors.push(`Missing required dependency: ${dep}`);
      }
    }
  }

  // Dev dependencies validation
  if (!structure.devDependencies || typeof structure.devDependencies !== 'object') {
    warnings.push("Missing devDependencies object");
  } else {
    for (const dep of OPENAI_CONFIG.VALIDATION.REQUIRED_DEV_DEPENDENCIES) {
      if (!structure.devDependencies[dep]) {
        warnings.push(`Missing recommended dev dependency: ${dep}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}