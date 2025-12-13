// ============================================================================
// FILE: src/components/Shared/SessionFilesDisplay.tsx
// PURPOSE: Display completed files from session storage (Real-time, No Polling)
// ============================================================================


import { useEffect, useState, useCallback } from "react";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { DownloadSvg, FolderOpenSvg, TrashSvg } from "@/components/Svg/CommonSvg";
import { FileImage } from "@/components/Svg/HomeSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type { ToolConfig, ToolType, StoredFile } from "@/services/imageService/types";

interface SessionFilesDisplayProps {
  toolType: ToolType;
  config: ToolConfig;
}

export const SessionFilesDisplay = ({ toolType, config }: SessionFilesDisplayProps) => {
  const isDark = useDarkMode();
  const [sessionFiles, setSessionFiles] = useState<StoredFile[]>([]);

  // ============================================================================
  // LOAD FILES FROM SESSION STORAGE
  // ============================================================================
  const loadFiles = useCallback(() => {
    const files = sessionStorageUtils.getFiles(toolType);
    setSessionFiles(files);
  }, [toolType]);

  // ============================================================================
  // INITIAL LOAD
  // ============================================================================
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // ============================================================================
  // REAL-TIME UPDATES (Event-driven, NO POLLING!)
  // ============================================================================
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Only refresh if event is for this tool
      if (customEvent.detail?.toolType === toolType) {
        loadFiles();
      }
    };

    window.addEventListener('sessionStorageUpdated', handleUpdate);

    return () => {
      window.removeEventListener('sessionStorageUpdated', handleUpdate);
    };
  }, [toolType, loadFiles]);

  // ============================================================================
  // DOWNLOAD SINGLE FILE
  // ============================================================================
  const handleDownload = async (fileId: string) => {
    const fileMeta = sessionStorageUtils.getFile(toolType, fileId);
    if (!fileMeta) return;

    const blob = await sessionStorageUtils.getBlob(fileId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileMeta.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // DOWNLOAD ALL FILES
  // ============================================================================
  const handleDownloadAll = async () => {
    for (const [index, file] of sessionFiles.entries()) {
      setTimeout(() => handleDownload(file.id), index * 500);
    }
  };

  // ============================================================================
  // DELETE SINGLE FILE
  // ============================================================================
  const handleDelete = async (fileId: string) => {
    await sessionStorageUtils.deleteFile(toolType, fileId);
    // No need to manually update state - event will trigger loadFiles()
  };

  // ============================================================================
  // CLEAR ALL SESSION FILES
  // ============================================================================
  const handleClearAll = async () => {
    await sessionStorageUtils.clearTool(toolType);
    // No need to manually update state - event will trigger loadFiles()
  };

  // ============================================================================
  // FORMAT FILE SIZE
  // ============================================================================
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ============================================================================
  // FORMAT TIME AGO
  // ============================================================================
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // ============================================================================
  // TRUNCATE FILE NAME
  // ============================================================================
  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - (ext?.length || 0) - 4);
    return `${truncated}...${ext}`;
  };

  // ============================================================================
  // EARLY RETURN IF NO FILES
  // ============================================================================
  if (sessionFiles.length === 0) return null;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 mt-[1vh] md:mt-[1vw]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg"
            style={{
              backgroundColor: isDark
                ? config.dropzoneColorDark
                : config.dropzoneColor,
            }}
          >
            <div style={{ color: config.primaryColor }} className="w-6 h-6">
              <FolderOpenSvg />
            </div>
          </div>
          <div>
            <h3 className="ms:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Completed Files
            </h3>
            <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
              {sessionFiles.length} file{sessionFiles.length !== 1 ? "s" : ""} • Expires in 2 hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="px-4 py-1.5 rounded-xl font-medium text-white flex items-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: config.primaryColor }}
          >
            <span className="w-5 h-5">
              <DownloadSvg />
            </span>
            <span className="md:block hidden">Download All</span>
          </button>

          <button
            onClick={handleClearAll}
            className="px-4 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/40 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all"
          >
            <span className="w-5 h-5">
              <TrashSvg />
            </span>
            <span className="md:block hidden">Clear All</span>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {sessionFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="px-4 py-2 rounded-xl shrink-0"
                style={{
                  backgroundColor: isDark
                    ? config.dropzoneColorDark
                    : config.dropzoneColor,
                }}
              >
                <div style={{ color: config.primaryColor }} className="w-5 h-5">
                  <FileImage />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-zinc-800 dark:text-zinc-200 truncate"
                  title={file.name}
                >
                  {truncateFileName(file.name)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatSize(file.size)} • {formatTimeAgo(file.timestamp)}
                </p>
              </div>
            </div>

            <div className="flex items-center ml-2">
              <button
                onClick={() => handleDownload(file.id)}
                className="py-1.5 px-3 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Download"
              >
                <DownloadSvg className={`w-5 h-5 text-[${config.primaryColor}]`} />
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                className="py-1.5 px-3 rounded-xl transition-all hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 cursor-pointer"
                title="Delete"
              >
                <TrashSvg className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};