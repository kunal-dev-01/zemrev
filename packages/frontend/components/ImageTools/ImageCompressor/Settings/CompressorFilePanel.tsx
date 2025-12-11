// components/ImageTools/ImageCompressor/Settings/CompressorFilePanel.tsx

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import {
  CancelSvg,
  ErrorSvg,
  ChevronDownSvg,
  SettingsSvg,
} from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import { useState, useRef, useEffect } from "react";

interface CompressorFilePanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: FileSettings) => void;
  onRemove: () => void;
}

export const CompressorFilePanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
}: CompressorFilePanelProps) => {
  const isDark = useDarkMode();
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const qualityRef = useRef<HTMLDivElement>(null);

  const qualityOptions = [
    { value: 100, label: "Maximum", desc: "Best quality" },
    { value: 90, label: "High", desc: "Recommended" },
    { value: 80, label: "Good", desc: "Balanced" },
    { value: 70, label: "Medium", desc: "Smaller size" },
    { value: 60, label: "Low", desc: "Web optimized" },
    { value: 50, label: "Very Low", desc: "Minimal size" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        qualityRef.current &&
        !qualityRef.current.contains(event.target as Node)
      ) {
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
      text: "Compressing...",
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
    const ext = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - ext!.length - 4);
    return `${truncated}...${ext}`;
  };

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 sm:p-3 rounded-lg shrink-0"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div
            style={{ color: config.primaryColor }}
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <FileImage />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-sm leading-none font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400">
            {formatBytes(file.size)}
          </p>
        </div>

        {file.status === "pending" && (
          <div ref={qualityRef}>
            <button
              onClick={() => setIsQualityOpen(!isQualityOpen)}
              className="w-full px-3 py-1 md:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5" style={{ color: config.primaryColor }}>
                  <SettingsSvg />
                </div>
                <span className="font-medium">{file.settings.quality}%</span>
              </div>
              <div className="w-5 h-5">
                <ChevronDownSvg />
              </div>
            </button>

            {isQualityOpen && (
              <div className="absolute z-10 right-0 mt-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl w-[400px] max-w-[calc(100vw-3rem)]">
                <div className="grid grid-cols-2 gap-1">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onUpdateSettings({ quality: option.value });
                        setIsQualityOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                        file.settings.quality === option.value
                          ? "text-white"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor:
                          file.settings.quality === option.value
                            ? config.primaryColor
                            : undefined,
                        borderColor:
                          file.settings.quality === option.value
                            ? config.primaryColor
                            : undefined,
                      }}
                    >
                      <div>
                        <div className="font-bold">{option.label}</div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {option.desc}
                        </div>
                      </div>
                      <span className="text-sm font-bold">{option.value}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <div
            className={`md:flex hidden items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap cursor-default select-none ${status.bg} ${status.color}`}
          >
            {status.icon}
            <span className="hidden sm:inline">{status.text}</span>
          </div>

          {!isProcessing && (
            <button
              onClick={onRemove}
              className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
              aria-label="Remove file"
            >
              <CancelSvg className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isError && file.error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
        </div>
      )}
    </div>
  );
};