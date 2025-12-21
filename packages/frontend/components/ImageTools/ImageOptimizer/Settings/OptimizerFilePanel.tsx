// components/ImageTools/ImageOptimizer/Settings/OptimizerFilePanel.tsx

import { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/Layouts/Spinner";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";

import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import {
  FileError,
  FileInfo,
  RemoveButton,
  SettingsToggleButton,
} from "@/components/Shared/FileUI";
import { ImageToolIconBadge } from "@/components/Shared/FileUITwo";

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
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isProcessing = file.status === "processing";
  const isError = file.status === "error";

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3 relative fade-in">
      <div className="flex items-center gap-3">
        {/* Thumbnail Icon */}
        <ImageToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

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
                  className="absolute right-0 top-full mt-1 z-20 md:min-w-[15vw] min-w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 origin-top-right ring-1 ring-black/5 dark:ring-white/5 space-y-3"
                  style={{
                    animation:
                      "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
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

        {!isProcessing && <RemoveButton onClick={onRemove} />}
      </div>

      {/* Error Message */}
      {isError && file.error && <FileError error={file.error} />}
    </div>
  );
};
