// client/src/utils/fileTreeConverter.ts
import { FileNode } from "@/lib/types";

// Function to convert flat file list to nested folder structure
export function convertToFileTree(files: any[]): FileNode[] {
  const fileTree: FileNode[] = [];

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
    
    if (pathParts.length === 1) {
      // Root level file
      fileTree.push({
        name: pathParts[0],
        path: filePath,
        type: 'file',
        content: file.content || '',
        language: getLanguageFromPath(filePath)
      });
    } else {
      // File in folder
      let currentLevel = fileTree;
      
      // Navigate/create folder structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        
        let folder = currentLevel.find(node => node.name === folderName && node.type === 'folder');
        
        if (!folder) {
          folder = {
            name: folderName,
            path: pathParts.slice(0, i + 1).join('/'),
            type: 'folder',
            expanded: true,
            children: []
          };
          currentLevel.push(folder);
        }
        
        currentLevel = folder.children!;
      }
      
      // Add the file to the final folder
      currentLevel.push({
        name: pathParts[pathParts.length - 1],
        path: filePath,
        type: 'file',
        content: file.content || '',
        language: getLanguageFromPath(filePath)
      });
    }
  }

  return fileTree;
}

function getLanguageFromPath(path: string): string {
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
}