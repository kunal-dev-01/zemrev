// components/ImageTools/ImageResizer/Settings/ResizerFilePanel.tsx

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { CancelSvg, ErrorSvg, SettingsSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type { FileSettings, ProcessedFile, ToolConfig } from "@/services/imageService/types";
import { useState, useEffect } from "react";
import { ResizerSettingsPanel } from "./ResizerSettingsPanel";

interface ResizerFilePanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: FileSettings) => void;
  onRemove: () => void;
}

const STATUS_CONFIG = {
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

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const truncateFileName = (name: string, maxLength: number = 30): string => {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
  const truncated = nameWithoutExt.substring(0, maxLength - ext!.length - 4);
  return `${truncated}...${ext}`;
};

export const ResizerFilePanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
}: ResizerFilePanelProps) => {
  const isDark = useDarkMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsSettingsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  useEffect(() => {
    document.body.style.overflow = isSettingsOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSettingsOpen]);

  const status = STATUS_CONFIG[file.status];
  const isProcessing = file.status === "processing";
  const isError = file.status === "error";

  return (
    <>
      <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="flex items-center gap-3">
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

          <div className="flex-1 min-w-0">
            <h3
              className="text-sm leading-none font-medium text-zinc-800 dark:text-zinc-200 truncate"
              title={file.name}
            >
              {truncateFileName(file.name)}
            </h3>
            <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 inline-block">
              {formatBytes(file.size)}
            </p>
          </div>

          {file.status === "pending" && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
                <SettingsSvg />
              <span className="font-medium hidden sm:inline">Settings</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-3">
            <div
              className={`md:flex hidden items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap select-none cursor-default ${status.bg} ${status.color}`}
            >
              {status.icon}
              <span className="hidden sm:inline">{status.text}</span>
            </div>

            {!isProcessing && (
              <button
                onClick={onRemove}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
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

      {isSettingsOpen && (
        <ResizerSettingsPanel
          file={file}
          config={config}
          isClosing={isClosing}
          onUpdateSettings={onUpdateSettings}
          onClose={handleClose}
        />
      )}
    </>
  );
};