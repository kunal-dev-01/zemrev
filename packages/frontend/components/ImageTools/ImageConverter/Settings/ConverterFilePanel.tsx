// components/ImageTools/ImageConverter/Settings/ConverterFilePanel.tsx

"use client";

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { CancelSvg, ErrorSvg, ChevronDownSvg, QualitySvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type { FileSettings, ProcessedFile, ToolConfig } from "@/services/imageService/types";
import { useState, useRef, useEffect } from "react";

interface ConverterFilePanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: FileSettings) => void;
  onRemove: () => void;
}

export const ConverterFilePanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
}: ConverterFilePanelProps) => {
  const isDark = useDarkMode();
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const formatRef = useRef<HTMLDivElement>(null);
  const qualityRef = useRef<HTMLDivElement>(null);

  const formats = [
    { value: "jpeg", label: "JPEG" },
    { value: "png", label: "PNG" },
    { value: "webp", label: "WEBP" },
    { value: "avif", label: "AVIF" },
    { value: "gif", label: "GIF" },
    { value: "bmp", label: "BMP" },
    { value: "tiff", label: "TIFF" },
    { value: "heic", label: "HEIC" },
    { value: "heif", label: "HEIF" },
  ];

  const qualityOptions = [
    { value: 100, label: "Maximum" },
    { value: 90, label: "High" },
    { value: 80, label: "Good" },
    { value: 70, label: "Medium" },
    { value: 60, label: "Low" },
    { value: 50, label: "Very Low" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(event.target as Node)) {
        setIsFormatOpen(false);
      }
      if (qualityRef.current && !qualityRef.current.contains(event.target as Node)) {
        setIsQualityOpen(false);
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
      text: "Converting...",
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
  const showQuality = ["jpeg", "jpg", "webp", "avif"].includes(file.settings.format!);

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

      {/* CONVERTER SETTINGS (Only for pending files) */}
      {file.status === "pending" && (
        <div className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Format Selector */}
            <div>
              <div ref={formatRef} className="relative">
                <button
                  onClick={() => setIsFormatOpen(!isFormatOpen)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all hover:border-zinc-300/50 dark:hover:border-zinc-700/50 cursor-pointer"
                >
                  <span className="font-medium">{file.settings.format?.toUpperCase()}</span>
                  <div className="w-5 h-5">
                    <ChevronDownSvg />
                  </div>
                </button>

                {/* Format Dropdown */}
                {isFormatOpen && (
                  <div className="absolute z-10 w-full mt-1 p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <div className="grid grid-cols-3 gap-1">
                      {formats.map((format) => (
                        <button
                          key={format.value}
                          onClick={() => {
                            onUpdateSettings({ format: format.value } as FileSettings);
                            setIsFormatOpen(false);
                          }}
                          className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                            file.settings.format === format.value
                              ? "text-white"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          }`}
                          style={{
                            backgroundColor:
                              file.settings.format === format.value
                                ? config.primaryColor
                                : undefined,
                          }}
                        >
                          {format.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Selector (only for lossy formats) */}
            {showQuality && (
              <div>
                <div ref={qualityRef} className="relative">
                  <button
                    onClick={() => setIsQualityOpen(!isQualityOpen)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all hover:border-zinc-300/50 dark:hover:border-zinc-700/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5" style={{ color: config.primaryColor }}>
                        <QualitySvg />
                      </div>
                      <span className="font-medium">{file.settings.quality}%</span>
                    </div>
                    <div className="w-5 h-5">
                      <ChevronDownSvg />
                    </div>
                  </button>

                  {/* Quality Dropdown */}
                  {isQualityOpen && (
                    <div className="absolute z-10 w-full mt-1 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div className="space-y-1 grid grid-cols-2 gap-1">
                        {qualityOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onUpdateSettings({ quality: option.value });
                              setIsQualityOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded text-sm font-medium text-left transition-all flex items-center justify-between ${
                              file.settings.quality === option.value
                                ? "text-white"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            }`}
                            style={{
                              backgroundColor:
                                file.settings.quality === option.value
                                  ? config.primaryColor
                                  : undefined,
                            }}
                          >
                            <span>{option.label}</span>
                            <span className="text-xs opacity-75">{option.value}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};