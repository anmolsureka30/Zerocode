import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4-turbo"; // Best for strict prompt adherence

// Strict prompt template for maximum adherence
const STRICT_REACT_PROMPT = `
You are an expert React developer. Your task is to generate a COMPLETE React application structure with ALL necessary files and functional code.

CRITICAL REQUIREMENTS - FOLLOW EXACTLY:
1. Generate COMPLETE, FUNCTIONAL code for every file - NO placeholders, NO TODO comments
2. Use React 18+ with TypeScript and functional components ONLY
3. Use Tailwind CSS for ALL styling - NO custom CSS files
4. Include React Router for navigation
5. Use React hooks for state management (useState, useEffect, useContext)
6. Every component must be fully implemented with actual functionality
7. All imports must be correct and all referenced components must exist
8. Include proper TypeScript interfaces and types for ALL props
9. Add comprehensive error handling and loading states
10. Make the application fully responsive and accessible

MANDATORY FILE STRUCTURE:
src/
├── App.tsx (main app component with routing)
├── main.tsx (entry point)
├── index.css (Tailwind imports only)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   └── ui/ (reusable UI components)
├── pages/ (route components)
├── hooks/ (custom React hooks)
├── types/ (TypeScript interfaces)
├── utils/ (utility functions)
├── context/ (React Context providers)
└── services/ (API calls)

ROOT FILES (MUST BE INCLUDED):
├── package.json (with ALL necessary dependencies)
├── tsconfig.json (TypeScript configuration)
├── tailwind.config.js (Tailwind configuration)
├── postcss.config.js (PostCSS configuration)
├── vite.config.ts (Vite configuration)
└── index.html (HTML template)

CRITICAL: You MUST generate ALL these files. Every single file listed above is REQUIRED.

RESPONSE FORMAT - MUST BE EXACTLY THIS:
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "complete functional React component code",
      "type": "file"
    }
  ],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}

ULTRA-STRICT OUTPUT RULES:
- Return ONLY valid JSON - NO markdown, NO explanations, NO text before/after
- Every file must have complete, runnable code with REAL functionality
- All components must have proper TypeScript prop interfaces defined
- All imports must be correct and all referenced components must exist
- Include ALL configuration files needed for a working React app
- Use semantic HTML and proper accessibility attributes
- Include proper error boundaries and loading states
- Make all forms fully functional with validation and state management
- Add responsive design with Tailwind utility classes
- Include proper routing setup with React Router
- Use REAL sample data (not placeholders) - create meaningful examples
- Every button, form, and interaction must be fully functional
- Define proper TypeScript interfaces for component props, especially for children prop

ABSOLUTELY FORBIDDEN:
- NO placeholder code, comments, or text like "Add logic here", "TODO", "placeholder", "PLACEHOLDER"
- NO incomplete implementations or partial code
- NO missing imports or exports
- NO custom CSS files (Tailwind only)
- NO class components (functional only)
- NO outdated React patterns
- NO dummy data - use realistic sample data instead
- NO generic names like "placeholder" in any form
`;

export async function planAppFiles(
  refinedPrompt: string, 
  framework = "React", 
  styling = "Tailwind CSS", 
  stateManagement = "React Hooks", 
  buildTool = "Vite"
): Promise<any> {
  
  // Combine the strict prompt with user requirements
  const fullPrompt = STRICT_REACT_PROMPT + `

USER REQUIREMENTS:
${refinedPrompt}

TECHNICAL SPECIFICATIONS:
- Framework: ${framework}
- Styling: ${styling}
- State Management: ${stateManagement}
- Build Tool: ${buildTool}

Generate a complete, production-ready React application based on the user requirements above.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an expert React developer who creates complete, functional applications. Follow all instructions exactly and return only valid JSON." 
        },
        { 
          role: "user", 
          content: fullPrompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Very low for maximum consistency
      max_tokens: 4000, // Max for GPT-4-turbo
      top_p: 0.1, // Low for more deterministic output
    });

    const appJson = response.choices[0].message.content;
    if (!appJson) {
      throw new Error("OpenAI did not return any content");
    }

    let parsed;
    try {
      parsed = JSON.parse(appJson);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error(`Invalid JSON response from OpenAI: ${parseError}`);
    }

    // Strict validation of response structure
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error("Invalid response structure: missing or invalid files array");
    }

    if (!parsed.dependencies || typeof parsed.dependencies !== 'object') {
      throw new Error("Invalid response structure: missing or invalid dependencies object");
    }

    // Validate each file has required properties
    for (const file of parsed.files) {
      if (!file.path || !file.content || !file.type) {
        throw new Error(`Invalid file structure: ${JSON.stringify(file)}`);
      }
    }

    // Add default dependencies if missing
    if (!parsed.dependencies.react) {
      parsed.dependencies = {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.8.0",
        ...parsed.dependencies
      };
    }

    if (!parsed.devDependencies) {
      parsed.devDependencies = {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@vitejs/plugin-react": "^4.0.0",
        "typescript": "^5.0.0",
        "vite": "^4.4.0",
        "tailwindcss": "^3.3.0",
        "postcss": "^8.4.24",
        "autoprefixer": "^10.4.14"
      };
    } else {
      // Ensure @types/react-dom is included
      if (!parsed.devDependencies["@types/react-dom"]) {
        parsed.devDependencies["@types/react-dom"] = "^18.2.0";
      }
    }

    console.log(`✅ Generated ${parsed.files.length} files successfully`);
    return parsed;

  } catch (error: any) {
    console.error("Error in planAppFiles:", error);
    throw new Error(`Failed to generate app structure: ${error.message}`);
  }
}