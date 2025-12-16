// components/ImageTools/ImageOptimizer/Settings/OptimizerFilePanel.tsx

import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/Layouts/Spinner";
import { FileImage } from "@/components/Svg/HomeSvg";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";

import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import { FileError, FileInfo, RemoveButton, SettingsToggleButton } from "@/components/Shared/FileUI";

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
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
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
          <FileInfo name={file.name} size={file.size} />
        </div>

        {/* Settings (Only in Pending State) */}
        {file.status === "pending" && (
          <div ref={settingsRef}>
            <SettingsToggleButton
              isOpen={isSettingsOpen}
              label="Settings"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
            />

            {/* Dropdown */}
            {isSettingsOpen && (
              <>
                <div
                  className="absolute right-0 top-full mt-1 z-20 w-[350px] max-w-[calc(100vw-3.3rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 origin-top-right ring-1 ring-black/5 dark:ring-white/5 space-y-3"
                  style={{
                    animation: "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }}
                >
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
              </>
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
          {!isProcessing && <RemoveButton onClick={onRemove} />}
        </div>
      </div>

      {/* Error Message */}
      {isError && file.error && <FileError error={file.error} />}
    </div>
  );
};