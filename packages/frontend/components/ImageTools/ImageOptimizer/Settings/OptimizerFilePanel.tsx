// components/ImageTools/ImageOptimizer/Settings/OptimizerFilePanel.tsx

"use client";

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { CancelSvg, ErrorSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";
import type { FileSettings, ProcessedFile, ToolConfig } from "@/services/imageService/types";

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
      text: "Optimizing...",
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

      {/* Header */}
      <div className="flex items-start gap-3">
        
        {/* Icon */}
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate" title={file.name}>
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Status badge + Remove */}
        <div className="flex items-center justify-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.bg} ${status.color}`}>
            {status.icon}
            <span>{status.text}</span>
          </div>

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

      {/* ERROR */}
      {isError && file.error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
        </div>
      )}

      {/* SETTINGS (only for pending files) */}
      {file.status === "pending" && (
        <div className="mt-3 space-y-3">

          <ToggleSwitch
            checked={file.settings.stripExif || false}
            onChange={(value) => onUpdateSettings({ stripExif: value })}
            label="Remove EXIF Data"
            description="Camera info, date, settings"
            color={config.primaryColor}
          />

          <ToggleSwitch
            checked={file.settings.stripGps || false}
            onChange={(value) => onUpdateSettings({ stripGps: value })}
            label="Remove GPS Location"
            description="Coordinates, place info"
            color={config.primaryColor}
          />

          <ToggleSwitch
            checked={file.settings.fixOrientation || false}
            onChange={(value) => onUpdateSettings({ fixOrientation: value })}
            label="Fix Image Orientation"
            description="Auto-correct rotated photos"
            color={config.primaryColor}
          />

        </div>
      )}
    </div>
  );
};
