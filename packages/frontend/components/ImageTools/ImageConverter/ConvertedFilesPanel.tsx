"use client";

import { useState, useEffect } from "react";
import { HardDrive } from "@/components/Svg/HomeSvg";
import { DownloadSvg, TrashSvg, FolderOpenSvg } from "@/components/Svg/CommonSvg";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type { StoredFile, ToolConfig } from "@/services/imageService/types";

interface ConvertedFilesPanelProps {
  config: ToolConfig;
}

export const ConvertedFilesPanel = ({ config }: ConvertedFilesPanelProps) => {
  const isDark = useDarkMode();
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [stats, setStats] = useState({ fileCount: 0, totalSize: 0, usagePercent: 0 });

  // Load session files
  useEffect(() => {
    const loadFiles = () => {
      const files = sessionStorageUtils.getFilesByTool(config.type);
      const storageStats = sessionStorageUtils.getStats();
      setStoredFiles(files);
      setStats(storageStats);
    };

    loadFiles();
    const interval = setInterval(loadFiles, 2000);
    return () => clearInterval(interval);
  }, [config.type]);

  const handleDownload = async (id: string) => {
    await sessionStorageUtils.downloadFile(id);
  };

  const handleDelete = (id: string) => {
    sessionStorageUtils.deleteFile(id);
    setStoredFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all converted files?")) {
      sessionStorageUtils.clearAll();
      setStoredFiles([]);
    }
  };

  const handleDownloadAll = async () => {
    await sessionStorageUtils.downloadAll(config.type);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (storedFiles.length === 0) return null;

  return (
    <div
      className="
        border border-zinc-200 dark:border-zinc-800
        rounded-xl bg-white/50 dark:bg-zinc-900/40 
        md:p-6 p-2
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: isDark
                ? config.dropzoneColorDark
                : config.dropzoneColor,
            }}
          >
            <div className="w-5 h-5" style={{ color: config.primaryColor }}>
              <FolderOpenSvg />
            </div>
          </div>

          <div>
            <h2 className="md:text-xl text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Converted Files
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              {stats.fileCount} file{stats.fileCount !== 1 ? "s" : ""} •{" "}
              {formatBytes(stats.totalSize)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {storedFiles.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="px-4 py-1.5 rounded-full font-medium text-white flex items-center gap-2"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div className="w-5 h-5">
                <DownloadSvg />
              </div>
              Download All
            </button>
          )}

          <button
            onClick={handleClearAll}
            className="
              px-4 py-1.5 rounded-full font-medium 
              text-red-600 flex items-center gap-2 
              transition-all
            "
            style={{
              backgroundColor: isDark ? "rgba(255,0,0,0.15)" : "#ffe7e7",
            }}
          >
            <div className="w-5 h-5">
              <TrashSvg />
            </div>
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-2">
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 inline-block">
              <HardDrive />
            </div>
            Session Storage Usage
          </span>
          <span>{stats.usagePercent}%</span>
        </div>

        <div className="h-2 rounded-full overflow-hidden"
          style={{
            backgroundColor: isDark ? "#2a2a2a" : "#e5e5e5",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(stats.usagePercent, 100)}%`,
              backgroundColor:
                stats.usagePercent > 80 ? "#ef4444" : config.primaryColor,
            }}
          />
        </div>

        {stats.usagePercent > 80 && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Storage almost full. Files will auto-clear when adding new ones.
          </p>
        )}
      </div>

      {/* File List */}
      <div className="space-y-3">
        {storedFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 rounded-lg border
              bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {formatBytes(file.size)} • {formatDate(file.timestamp)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownload(file.id)}
                className="
                  px-3 py-1 rounded-full text-xs font-medium text-white 
                  transition-all flex items-center gap-2
                "
                style={{ backgroundColor: config.primaryColor }}
              >
                <div className="w-5 h-5">
                  <DownloadSvg />
                </div>
                <span className="md:block hidden">Download</span>
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                className="
                  w-6 h-6 cursor-pointer text-red-400 dark:text-red-500
                  hover:text-red-300 dark:hover:text-red-400 transition-all
                "
              >
                <TrashSvg />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
