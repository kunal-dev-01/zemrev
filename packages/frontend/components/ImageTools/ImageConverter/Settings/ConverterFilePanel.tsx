// components/ImageTools/ImageConverter/Settings/ConverterFilePanel.tsx

"use client";

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { CancelSvg, ErrorSvg, ChevronDownSvg, SettingsSvg } from "@/components/Svg/CommonSvg";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);

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
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (formatRef.current && !formatRef.current.contains(event.target as Node)) {
        setIsFormatOpen(false);
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
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl md:p-3 p-2 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
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

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm leading-none font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={file.name}>
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 px-1 bg-zinc-200 dark:bg-zinc-800 rounded-sm inline-block">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Format Display & Settings */}
        {file.status === "pending" && (
          <div className="hidden md:flex items-center justify-center gap-2 flex-1">
            {/* Format Button */}
            <div ref={formatRef} className="relative ">
            <button
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center justify-between gap-2"
            >
              <span className="text-sm font-semibold">{file.settings.format?.toUpperCase()}</span>
              <ChevronDownSvg className={`w-4 h-4 transition-transform ${isFormatOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Format Dropdown */}
            {isFormatOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                    OUTPUT FORMAT
                  </p>
                  <div className="grid grid-cols-3 gap-2">
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
              </div>
            )}
          </div>

            {/* Settings Button */}
            <div ref={settingsRef} className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isSettingsOpen ? config.primaryColor : undefined,
                  backgroundColor: isSettingsOpen ? `${config.primaryColor}15` : undefined,
                }}
              >
                <SettingsSvg />
              </button>

              {/* Settings Dropdown */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* Quality Selection */}
                  {showQuality && (
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                        QUALITY
                      </p>
                      <div className="space-y-1">
                        {qualityOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onUpdateSettings({ quality: option.value });
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

                  {/* Strip Metadata Toggle */}
                  <div className="p-4">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                      METADATA
                    </p>
                    <ToggleSwitch
                      checked={file.settings.stripMetadata ?? true}
                      onChange={(value) => onUpdateSettings({ stripMetadata: value })}
                      label="Strip Metadata"
                      description="Remove EXIF data from image"
                      color={config.primaryColor}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {/* Remove Button */}
          {!isProcessing && (
            <button
              onClick={onRemove}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
              aria-label="Remove file"
            >
              <CancelSvg className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Format & Settings Buttons */}
      {file.status === "pending" && (
        <div className="md:hidden flex items-center gap-2 mt-3">
          {/* Format Button */}
          <div ref={formatRef} className="relative flex-1">
            <button
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center justify-between"
            >
              <span className="text-sm font-semibold">{file.settings.format?.toUpperCase()}</span>
              <ChevronDownSvg className={`w-4 h-4 transition-transform ${isFormatOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Format Dropdown */}
            {isFormatOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                    OUTPUT FORMAT
                  </p>
                  <div className="grid grid-cols-3 gap-2">
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
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200"
              style={{
                borderColor: isSettingsOpen ? config.primaryColor : undefined,
                backgroundColor: isSettingsOpen ? `${config.primaryColor}15` : undefined,
              }}
            >
              <SettingsSvg />
            </button>

            {/* Settings Dropdown */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Quality Selection */}
                {showQuality && (
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                      QUALITY
                    </p>
                    <div className="space-y-1">
                      {qualityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onUpdateSettings({ quality: option.value });
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

                {/* Strip Metadata Toggle */}
                <div className="p-4">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                    METADATA
                  </p>
                  <ToggleSwitch
                    checked={file.settings.stripMetadata ?? true}
                    onChange={(value) => onUpdateSettings({ stripMetadata: value })}
                    label="Strip Metadata"
                    description="Remove EXIF data from image"
                    color={config.primaryColor}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {isError && file.error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{file.error}</p>
        </div>
      )}
    </div>
  );
};