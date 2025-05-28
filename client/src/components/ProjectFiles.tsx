import { useState } from "react";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import { FileNode } from "@/lib/types";

interface ProjectFilesProps {
  files: FileNode[];
  activeFile: string;
  onSelectFile: (filename: string) => void;
}

export default function ProjectFiles({
  files,
  activeFile,
  onSelectFile,
}: ProjectFilesProps) {
  const [showFileExplorer, setShowFileExplorer] = useState(true);

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="py-1" style={{ paddingLeft: `${depth * 0.5}rem` }}>
        <div
          onClick={() => {
            if (node.type === "file") {
              onSelectFile(node.name);
            } else {
              // Toggle expanded state for folders
              node.expanded = !node.expanded;
              // Force re-render
              onSelectFile(activeFile);
            }
          }}
          className={`flex items-center px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
            node.name === activeFile
              ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
              : ""
          }`}
        >
          {node.type === "folder" ? (
            <span className="mr-1 text-gray-500">
              {node.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          ) : (
            <File className="h-4 w-4 mr-1 text-gray-500" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>

        {/* Render children if folder is expanded */}
        {node.type === "folder" && node.expanded && node.children && (
          <div className="pl-4 my-1">
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex-1 overflow-auto p-2">
      <div className="flex items-center justify-between p-2">
        <h3 className="font-medium">Project Files</h3>
        <button
          onClick={() => setShowFileExplorer(!showFileExplorer)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {showFileExplorer ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {showFileExplorer && (
        <div className="mt-2">{renderFileTree(files)}</div>
      )}
    </div>
  );
}
