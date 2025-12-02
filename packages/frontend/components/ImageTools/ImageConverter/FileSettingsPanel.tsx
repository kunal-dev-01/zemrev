// ============================================================================
// FILE: src/components/ImageTools/ImageConverter/FileSettingsPanel.tsx
// PURPOSE: Individual file settings UI (format, quality)
// ============================================================================

"use client";

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import {CheckSvg, CancelSvg, DownloadSvg, ErrorSvg} from "@/components/Svg/CommonSvg";
import type { ProcessedFile, ToolConfig } from "@/services/imageService/types";

interface FileSettingsPanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: any) => void;
  onRemove: () => void;
  onDownload: () => void;
}

export const FileSettingsPanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
  onDownload,
}: FileSettingsPanelProps) => {
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
      icon: <Spinner />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "Converting...",
    },
    completed: {
      icon: <div className="w-5 h-5 text-emerald-400">
        <CheckSvg />
      </div>,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "Completed",
    },
    error: {
      icon: <div className="w-5 h-5 text-red-400 dark:text-red-600">
        <ErrorSvg/>
      </div>,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "Failed",
    },
  };

  const status = statusConfig[file.status];
  const isProcessing = file.status === "processing";
  const isCompleted = file.status === "completed";
  const isError = file.status === "error";

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-900">
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div
          className="p-3 rounded-lg shrink-0"
          style={{ backgroundColor: config.dropzoneColor }}
        >
          <div style={{ color: config.primaryColor }} className="w-6 h-6">
            <FileImage/>
          </div>
        </div>

        {/* File Info & Settings */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {formatBytes(file.size)}
              </p>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              {status.icon}
              {status.text}
            </div>
          </div>

          {/* Error Message */}
          {isError && file.error && (
            <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
            </div>
          )}

          {/* Settings (only for pending files) */}
          {file.status === "pending" && (
            <div className="grid grid-cols-2 gap-3">
              {/* Format */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Format
                </label>
                <select
                  value={file.settings.format}
                  onChange={(e) => onUpdateSettings({ format: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-200"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WEBP</option>
                  <option value="avif">AVIF</option>
                  <option value="gif">GIF</option>
                  <option value="bmp">BMP</option>
                  <option value="tiff">TIFF</option>
                  <option value="heic">HEIC</option>
                  <option value="heif">HEIF</option>
                </select>
              </div>

              {/* Quality */}
              {["jpeg", "jpg", "webp", "avif"].includes(file.settings.format!) && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Quality: {file.settings.quality}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={file.settings.quality}
                    onChange={(e) => onUpdateSettings({ quality: parseInt(e.target.value) })}
                    className="w-full"
                    style={{
                      accentColor: config.primaryColor,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Result Info */}
          {isCompleted && file.resultName && (
            <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                {file.resultName}
              </p>
              <button
                onClick={onDownload}
                className="px-3 py-1.5 rounded text-xs font-medium text-white transition-all"
                style={{ backgroundColor: config.primaryColor }}
              >
                <div className="w-5 h-5 inline-block mr-1 -mt-1">
                    <DownloadSvg />
                </div>
                Download
              </button>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {!isProcessing && (
          <button
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all shrink-0"
          >
            <div className="w-5 h-5 text-zinc-300">
                <CancelSvg />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};