// components/ImageTools/ImageConverter/Settings/ConverterFilePanel.tsx

import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { ErrorSvg, SettingsSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import { useState, useEffect } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { FileError, FileInfo, RemoveButton } from "@/components/Shared/FileUI";

interface ConverterFilePanelProps {
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


export const ConverterFilePanel = ({
  file,
  config,
  onUpdateSettings,
  onRemove,
}: ConverterFilePanelProps) => {
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
      <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="flex items-center gap-4">
          {/* File Icon */}
          <div
            className="p-3 rounded-xl shrink-0"
            style={{
              backgroundColor: isDark
                ? config.dropzoneColorDark
                : config.dropzoneColor,
            }}
          >
            <div style={{ color: config.primaryColor }} className="w-6 h-6">
              <FileImage />
            </div>
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
           <FileInfo name={file.name} size={file.size} />
          </div>

          {/* Format Display & Settings Button */}
          {file.status === "pending" && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <SettingsSvg />
              <span>{file.settings.format?.toUpperCase()}</span>
            </button>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`md:flex hidden items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap cursor-default select-none ${status.bg} ${status.color}`}
            >
              {status.icon}
              <span className="hidden sm:inline">{status.text}</span>
            </div>

            {/* Remove Button */}
            {!isProcessing && (
              <RemoveButton onClick={onRemove} />
            )}
          </div>
        </div>

        {/* Error Message */}
        {isError && file.error && (
          <FileError error={file.error} />
        )}
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <SettingsPanel
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
