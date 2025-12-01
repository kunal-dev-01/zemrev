// ============================================================================
// FILE: src/components/FileList.tsx
// PURPOSE: Display uploaded files with preview
// ============================================================================

"use client";

import { UploadedFile } from "@/services/imageService/types";
import { formatSize } from "@/utils/fileProcessor.utils";
import { Spinner } from "../Layouts/Spinner";

interface Props {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const FileList = ({ files, onRemove, disabled = false }: Props) => {
  
  if (files.length === 0) return null;
  
  return (
    <div className="w-full mt-6">
      
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
        Uploaded Files ({files.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {files.map((file) => (
          <div
            key={file.id}
            className="relative p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40"
          >
            
            {/* Preview Image */}
            <div className="relative w-full aspect-video mb-3 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              
              {/* Processing Overlay */}
              {file.status === "processing" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 text-white">
                    <Spinner />
                  </div>
                </div>
              )}
              
              {/* Error Overlay */}
              {file.status === "error" && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    Failed
                  </span>
                </div>
              )}
              
              {/* Success Badge */}
              {file.status === "completed" && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  ✓ Done
                </div>
              )}
              
            </div>
            
            {/* File Info */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {file.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatSize(file.size)}
              </p>
              
              {file.error && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {file.error}
                </p>
              )}
            </div>
            
            {/* Remove Button */}
            <button
              onClick={() => onRemove(file.id)}
              disabled={disabled || file.status === "processing"}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-400 text-white rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
          </div>
        ))}
        
      </div>
      
    </div>
  );
};