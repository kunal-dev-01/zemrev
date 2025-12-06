// components/ImageTools/ImageResizer/Shared/ResizerFilePanel.tsx

"use client";

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { CancelSvg, ErrorSvg, ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type { FileSettings, ProcessedFile, ToolConfig, ResizeMode } from "@/services/imageService/types";
import { useState, useRef, useEffect } from "react";

interface ResizerFilePanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: FileSettings) => void;
  onRemove: () => void;
}

export const ResizerFilePanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
}: ResizerFilePanelProps) => {
  const isDark = useDarkMode();
  const [isModeOpen, setIsModeOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);

  const resizeModes = [
    { value: "contain", label: "Contain", desc: "Fit within dimensions" },
    { value: "cover", label: "Cover", desc: "Fill dimensions (crop)" },
    { value: "stretch", label: "Stretch", desc: "Force exact size" },
    { value: "exact", label: "Exact", desc: "Exact dimensions" },
  ];

  // Preset dimensions
  const presets = [
    { label: "200x200", width: 200, height: 200 },
    { label: "500x500", width: 500, height: 500 },
    { label: "1024x1024", width: 1024, height: 1024 },
    { label: "1920x1080", width: 1920, height: 1080 },
    { label: "Custom", width: null, height: null },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(event.target as Node)) {
        setIsModeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const statusConfig = {
    pending: {
      icon: null,
      color: "text-zinc-600 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "Pending",
    },
    processing: {
      icon: (
        <div className="w-4 h-4">
          <Spinner />
        </div>
      ),
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "Resizing...",
    },
    completed: {
      icon: null,
      color: "text-green-600 dark:text-green-300",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "Completed",
    },
    error: {
      icon: (
        <div className="w-4 h-4">
          <ErrorSvg />
        </div>
      ),
      color: "text-red-400 dark:text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "Failed",
    },
  };

  const status = statusConfig[file.status];
  const isProcessing = file.status === "processing";
  const isError = file.status === "error";

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - ext!.length - 4);
    return `${truncated}...${ext}`;
  };

  return (
    <div className="dark:bg-zinc-900 bg-white border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 sm:p-4 transition-all duration-200">
      {/* Header Section */}
      <div className="flex items-start gap-3">
        {/* File Icon */}
        <div
          className="p-2.5 sm:p-3 rounded-lg shrink-0"
          style={{
            backgroundColor: isDark ? config.dropzoneColorDark : config.dropzoneColor,
          }}
        >
          <div style={{ color: config.primaryColor }} className="w-5 h-5 sm:w-6 sm:h-6">
            <FileImage />
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate" title={file.name}>
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.bg} ${status.color}`}>
            {status.icon}
            <span>{status.text}</span>
          </div>

          {/* Remove Button */}
          {!isProcessing && (
            <button
              onClick={onRemove}
              className="text-zinc-700 w-5 h-5 dark:text-zinc-300 shrink-0 cursor-pointer"
              aria-label="Remove file"
            >
              <CancelSvg />
            </button>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {isError && file.error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
        </div>
      )}

      {/* RESIZER SETTINGS (Only for pending files) */}
      {file.status === "pending" && (
        <div className="mt-3 space-y-3">
          {/* Preset Dimensions */}
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    if (preset.width && preset.height) {
                      onUpdateSettings({ width: preset.width, height: preset.height });
                    }
                  }}
                  className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    file.settings.width === preset.width && file.settings.height === preset.height
                      ? "text-white"
                      : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      file.settings.width === preset.width && file.settings.height === preset.height
                        ? config.primaryColor
                        : undefined,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                Width (px)
              </label>
              <input
                type="number"
                value={file.settings.width || ""}
                onChange={(e) => onUpdateSettings({ width: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200"
                placeholder="1920"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                Height (px)
              </label>
              <input
                type="number"
                value={file.settings.height || ""}
                onChange={(e) => onUpdateSettings({ height: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200"
                placeholder="1080"
              />
            </div>
          </div>

          {/* Resize Mode */}
          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Resize Mode
            </label>
            <div ref={modeRef} className="relative">
              <button
                onClick={() => setIsModeOpen(!isModeOpen)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all hover:border-zinc-300/50 dark:hover:border-zinc-700/50 cursor-pointer"
              >
                <span className="font-medium capitalize">{file.settings.mode}</span>
                <div className="w-5 h-5">
                  <ChevronDownSvg />
                </div>
              </button>

              {/* Mode Dropdown */}
              {isModeOpen && (
                <div className="absolute z-10 w-full mt-1 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                  <div className="space-y-1">
                    {resizeModes.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => {
                          onUpdateSettings({ mode: mode.value as ResizeMode });
                          setIsModeOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded text-sm font-medium text-left transition-all ${
                          file.settings.mode === mode.value
                            ? "text-white"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        }`}
                        style={{
                          backgroundColor:
                            file.settings.mode === mode.value
                              ? config.primaryColor
                              : undefined,
                        }}
                      >
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs opacity-75">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};