// ============================================================================
// FILE: src/components/FileUploader.tsx
// PURPOSE: Reusable drag & drop + select button
// ============================================================================

"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  currentCount?: number;
  accept?: string;
  dropColor?: string;
  buttonColor?: string;
  showUrlOption?: boolean;
}

export const FileUploader = ({
  onFilesSelected,
  maxFiles = 5,
  currentCount = 0,
  accept = "image/*",
  dropColor = "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
  buttonColor = "bg-blue-500 hover:bg-blue-600",
  showUrlOption = true,
}: Props) => {
  
  const [isDragging, setIsDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isDisabled = currentCount >= maxFiles;
  
  // Handle files
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesSelected(Array.from(files));
  }, [onFilesSelected]);
  
  // Drag handlers
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  
  // URL upload
  const handleUrlUpload = async () => {
    if (!url.trim()) return;
    
    try {
      setLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      
      const blob = await res.blob();
      const filename = url.split("/").pop() || "image.jpg";
      const file = new File([blob], filename, { type: blob.type });
      
      onFilesSelected([file]);
      setUrl("");
      setShowUrl(false);
    } catch {
      alert("❌ Failed to load image from URL");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      
      {/* Drop Zone */}
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          w-full p-8 md:p-12 border-2 border-dashed rounded-xl transition-all
          ${isDragging ? dropColor : "border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/40"}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          
          {/* Icon */}
          <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          {/* Text */}
          <div className="text-center">
            <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
              {isDragging ? "Drop files here" : "Drag & drop images here"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {isDisabled ? "Maximum files reached" : `${currentCount}/${maxFiles} files`}
            </p>
          </div>
          
          {/* Buttons */}
          {!isDisabled && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => inputRef.current?.click()}
                className={`px-6 py-2.5 ${buttonColor} text-white rounded-lg font-medium transition-colors`}
              >
                Select from Device
              </button>
              
              {showUrlOption && (
                <button
                  onClick={() => setShowUrl(!showUrl)}
                  className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-colors"
                >
                  By URL
                </button>
              )}
            </div>
          )}
          
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
          disabled={isDisabled}
          className="hidden"
        />
      </div>
      
      {/* URL Input */}
      {showUrl && !isDisabled && (
        <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Enter Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleUrlUpload}
              disabled={loading || !url.trim()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Loading..." : "Add"}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};