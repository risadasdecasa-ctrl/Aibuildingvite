
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeAndRestructure = async (input: string): Promise<Record<string, string>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this code/link: "${input}". 
               Generate a standardized, Vercel-deployable Vite project structure.
               
               Requirements:
               1. index.html at root MUST have <div id="root"></div> and <script type="module" src="/src/main.jsx"></script>.
               2. package.json MUST include:
                  - "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }
                  - "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" }
                  - "devDependencies": { "vite": "^5.0.0", "@vitejs/plugin-react": "^4.2.0" }
               3. vite.config.js MUST use defineConfig from 'vite' and include plugin-react. Set "base: '/'" and "build: { outDir: 'dist' }".
               4. Move all logic to src/main.jsx and src/App.jsx.
               5. Ensure all import paths are relative and correct (e.g., import App from './App').

               Return the files as a JSON object where keys are file paths and values are file contents.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        description: "Vite Project Filesystem",
        properties: {
          "index.html": { type: Type.STRING },
          "package.json": { type: Type.STRING },
          "vite.config.js": { type: Type.STRING },
          "src/main.jsx": { type: Type.STRING },
          "src/App.jsx": { type: Type.STRING },
          "src/index.css": { type: Type.STRING },
          ".gitignore": { type: Type.STRING }
        },
        required: ["index.html", "package.json", "vite.config.js", "src/main.jsx"]
      }
    }
  });

  const files = JSON.parse(response.text);
  
  // Add a default .gitignore if the model missed it for better DX
  if (!files[".gitignore"]) {
    files[".gitignore"] = "node_modules\ndist\n.vercel\n.env";
  }

  return files;
};

export const createViteZip = async (files: Record<string, string>): Promise<Blob> => {
  // @ts-ignore - JSZip is loaded via script tag in index.html
  const zip = new window.JSZip();
  
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  return await zip.generateAsync({ 
    type: 'blob',
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
};
