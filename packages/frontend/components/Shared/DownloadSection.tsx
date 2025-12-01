// ============================================================================
// FILE: src/components/DownloadSection.tsx
// PURPOSE: Download buttons for converted files
// ============================================================================

"use client";

import { ConvertedFile } from "@/services/imageService/types";
import { downloadSingle, downloadAll } from "@/utils/download.utils";
import { formatSize } from "@/utils/fileProcessor.utils";

interface Props {
  files: ConvertedFile[];
  onClearAll: () => void;
}

export const DownloadSection = ({ files, onClearAll }: Props) => {
  
  if (files.length === 0) return null;
  
  return (
    <div className="w-full mt-6">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Converted Files ({files.length})
        </h3>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {files.length > 1 && (
            <button
              onClick={() => downloadAll(files)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Download All
            </button>
          )}
          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
      
      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {files.map((file) => (
          <div
            key={file.id}
            className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40"
          >
            
            {/* Preview */}
            <div className="w-full aspect-video mb-3 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={file.downloadUrl}
                alt={file.filename}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {file.filename}
              </p>
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{formatSize(file.size)}</span>
                <span className="uppercase font-medium">{file.format}</span>
              </div>
            </div>
            
            {/* Download Button */}
            <button
              onClick={() => downloadSingle(file)}
              className="w-full mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Download
            </button>
            
          </div>
        ))}
        
      </div>
      
    </div>
  );
};