// server/config/claude.ts - Configuration for Claude 3.7 Sonnet

import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_CONFIG = {
  // Model selection - Claude 3.7 Sonnet
  MODEL: "claude-3-7-sonnet-20250219",
  
  // Settings for maximum prompt adherence
  STRICT_SETTINGS: {
    max_tokens: 15000,       // Set to 15k as requested
    temperature: 0.1,        // Very low for consistency
  },
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Validation rules (same as OpenAI for consistency)
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

// Error handling for Claude requests
export async function callClaudeWithRetry(
  anthropic: Anthropic,
  requestConfig: any,
  maxRetries: number = CLAUDE_CONFIG.MAX_RETRIES
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Claude attempt ${attempt}/${maxRetries}`);
      
      const response = await anthropic.messages.create({
        ...requestConfig,
        ...CLAUDE_CONFIG.STRICT_SETTINGS
      });

      if (!response.content || response.content.length === 0) {
        throw new Error("Empty response from Claude");
      }

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error("Unexpected response type from Claude");
      }

      console.log(`✅ Claude request successful on attempt ${attempt}`);
      return response;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Claude attempt ${attempt} failed:`, error.message);

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, CLAUDE_CONFIG.RETRY_DELAY * attempt));
      }
    }
  }

  throw new Error(`Claude request failed after ${maxRetries} attempts: ${lastError?.message}`);
}

// Comprehensive validation function (same as OpenAI for consistency)
export function validateClaudeGeneratedCode(structure: any): {
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
    for (const requiredFile of CLAUDE_CONFIG.VALIDATION.REQUIRED_REACT_FILES) {
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

      // Check for forbidden content
      for (const forbidden of CLAUDE_CONFIG.VALIDATION.FORBIDDEN_CONTENT) {
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
    for (const dep of CLAUDE_CONFIG.VALIDATION.REQUIRED_DEPENDENCIES) {
      if (!structure.dependencies[dep]) {
        errors.push(`Missing required dependency: ${dep}`);
      }
    }
  }

  // Dev dependencies validation
  if (!structure.devDependencies || typeof structure.devDependencies !== 'object') {
    warnings.push("Missing devDependencies object");
  } else {
    for (const dep of CLAUDE_CONFIG.VALIDATION.REQUIRED_DEV_DEPENDENCIES) {
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