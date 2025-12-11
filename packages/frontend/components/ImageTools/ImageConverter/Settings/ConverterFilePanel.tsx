// components/ImageTools/ImageConverter/Settings/ConverterFilePanel.tsx

"use client";

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { CancelSvg, ErrorSvg, ChevronDownSvg, QualitySvg } from "@/components/Svg/CommonSvg";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";
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
    { value: "tiff", label: "TIFF" },
    { value: "heic", label: "HEIC" },
    { value: "heif", label: "HEIF" },
  ];

  const qualityOptions = [
    { value: 100, label: "Maximum", desc: "Best quality" },
    { value: 90, label: "High", desc: "Recommended" },
    { value: 80, label: "Good", desc: "Balanced" },
    { value: 70, label: "Medium", desc: "Smaller size" },
    { value: 60, label: "Low", desc: "Web optimized" },
    { value: 50, label: "Very Low", desc: "Minimal size" },
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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Main Content - Horizontal Layout */}
      <div className="flex items-center gap-4">
        {/* File Icon */}
        <div
          className="p-3 rounded-xl shrink-0"
          style={{
            backgroundColor: isDark ? config.dropzoneColorDark : config.dropzoneColor,
          }}
        >
          <div style={{ color: config.primaryColor }} className="w-6 h-6">
            <FileImage />
          </div>
        </div>

        {/* File Info - Single Line */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={file.name}>
            {file.name}
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            {formatBytes(file.size)}
          </span>
        </div>

        {/* Format & Quality Selectors (Only Pending) */}
        {file.status === "pending" && (
          <div className="flex items-center gap-2">
            {/* Format Dropdown */}
            <div ref={formatRef} className="relative">
              <button
                onClick={() => setIsFormatOpen(!isFormatOpen)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
                style={{
                  borderColor: isFormatOpen ? config.primaryColor : undefined,
                }}
              >
                <span>{file.settings.format?.toUpperCase()}</span>
                <div className="w-4 h-4">
                  <ChevronDownSvg />
                </div>
              </button>

              {/* Format Dropdown Menu */}
              {isFormatOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {formats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => {
                          onUpdateSettings({ format: format.value } as FileSettings);
                          setIsFormatOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          file.settings.format === format.value
                            ? "text-white shadow-md"
                            : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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

            {/* Quality Dropdown (Only for lossy formats) */}
            {showQuality && (
              <div ref={qualityRef} className="relative">
                <button
                  onClick={() => setIsQualityOpen(!isQualityOpen)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
                  style={{
                    borderColor: isQualityOpen ? config.primaryColor : undefined,
                  }}
                >
                  <div className="w-4 h-4" style={{ color: config.primaryColor }}>
                    <QualitySvg />
                  </div>
                  <span>{file.settings.quality}%</span>
                  <div className="w-4 h-4">
                    <ChevronDownSvg />
                  </div>
                </button>

                {/* Quality Dropdown Menu */}
                {isQualityOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 p-2">
                    <div className="space-y-1">
                      {qualityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onUpdateSettings({ quality: option.value });
                            setIsQualityOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between ${
                            file.settings.quality === option.value
                              ? "text-white shadow-sm"
                              : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          }`}
                          style={{
                            backgroundColor:
                              file.settings.quality === option.value
                                ? config.primaryColor
                                : undefined,
                          }}
                        >
                          <div>
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-xs opacity-75">{option.desc}</div>
                          </div>
                          <span className="text-xs font-bold">{option.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Strip Metadata Toggle */}
            <div className="px-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <ToggleSwitch
                checked={file.settings.stripMetadata ?? true}
                onChange={(value) => onUpdateSettings({ stripMetadata: value })}
                color={config.primaryColor}
              />
            </div>
          </div>
        )}

        {/* Status Badge (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${status.bg} ${status.color}`}>
            {status.icon}
            <span>{status.text}</span>
          </div>

          {/* Remove Button */}
          {!isProcessing && (
            <button
              onClick={onRemove}
              className="p-2 text-zinc-700 border border-zinc-200 dark:border-zinc-700 dark:text-zinc-300 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all"
              aria-label="Remove file"
            >
              <CancelSvg className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile: Only Remove Button */}
        {!isProcessing && (
          <button
            onClick={onRemove}
            className="md:hidden p-2 text-zinc-700 border border-zinc-200 dark:border-zinc-700 dark:text-zinc-300 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all"
            aria-label="Remove file"
          >
            <CancelSvg className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {isError && file.error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{file.error}</p>
        </div>
      )}
    </div>
  );
};