// components/ImageTools/ImageOptimizer/Settings/OptimizerFilePanel.tsx

import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import {
  CancelSvg,
  ErrorSvg,
  SettingsSvg,
  ChevronDownSvg,
} from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";

import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";

interface OptimizerFilePanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: FileSettings) => void;
  onRemove: () => void;
}

export const OptimizerFilePanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
}: OptimizerFilePanelProps) => {
  const isDark = useDarkMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // CLOSE SETTINGS ON OUTSIDE CLICK
  // ============================================================================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================
  // HELPERS
  // ============================================================================
  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const truncateFileName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) return name;

    const ext = name.split(".").pop();
    const base = name.substring(0, name.lastIndexOf("."));
    const trimLength = maxLength - (ext?.length ?? 0) - 4;

    return `${base.substring(0, trimLength)}...${ext}`;
  };

  const statusConfig = {
    pending: {
      text: "Pending",
      color: "text-zinc-600 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800",
      icon: null,
    },
    processing: {
      text: "Optimizing...",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: (
        <div className="w-4 h-4">
          <Spinner />
        </div>
      ),
    },
    completed: {
      text: "Completed",
      color: "text-green-600 dark:text-green-300",
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: null,
    },
    error: {
      text: "Failed",
      color: "text-red-400 dark:text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: (
        <div className="w-4 h-4">
          <ErrorSvg />
        </div>
      ),
    },
  };

  const status = statusConfig[file.status];
  const isProcessing = file.status === "processing";
  const isError = file.status === "error";

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      <div className="flex items-center gap-3">
        {/* Thumbnail Icon */}
        <div
          className="p-2.5 sm:p-3 rounded-lg shrink-0"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div style={{ color: config.primaryColor }} className="w-5 h-5 sm:w-6 sm:h-6">
            <FileImage />
          </div>
        </div>

        {/* Filename + Size */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>

          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 inline-block">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Settings (Only in Pending State) */}
        {file.status === "pending" && (
          <div ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between gap-2 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SettingsSvg />
                <span className="hidden sm:inline font-medium">Settings</span>
              </div>
              <ChevronDownSvg />
            </button>

            {/* Dropdown */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-1 w-[350px] max-w-[calc(100vw-3.3rem)] p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl z-10 space-y-3">
                <ToggleSwitch
                  checked={file.settings.stripExif || false}
                  onChange={(v) => onUpdateSettings({ stripExif: v })}
                  label="Remove EXIF Data"
                  description="Camera info, date, settings"
                  color={config.primaryColor}
                />

                <ToggleSwitch
                  checked={file.settings.stripGps || false}
                  onChange={(v) => onUpdateSettings({ stripGps: v })}
                  label="Remove GPS Location"
                  description="Coordinates, place info"
                  color={config.primaryColor}
                />

                <ToggleSwitch
                  checked={file.settings.fixOrientation || false}
                  onChange={(v) => onUpdateSettings({ fixOrientation: v })}
                  label="Fix Image Orientation"
                  description="Auto-correct rotated photos"
                  color={config.primaryColor}
                />
              </div>
            )}
          </div>
        )}

        {/* Status + Remove */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div
            className={`md:flex hidden items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap select-none cursor-default ${status.bg} ${status.color}`}
          >
            {status.icon}
            <span className="hidden sm:inline">{status.text}</span>
          </div>

          {/* Delete button */}
          {!isProcessing && (
            <button
              onClick={onRemove}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <CancelSvg className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {isError && file.error && (
        <div className="mt-3 p-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
        </div>
      )}
    </div>
  );
};
