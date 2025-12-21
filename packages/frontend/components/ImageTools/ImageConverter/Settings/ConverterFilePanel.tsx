// components/ImageTools/ImageConverter/Settings/ConverterFilePanel.tsx

import { SettingsSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import { useState, useEffect } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { FileError, FileInfo, RemoveButton } from "@/components/Shared/FileUI";
import { ImageToolIconBadge } from "@/components/Shared/FileUITwo";

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

  const isProcessing = file.status === "processing";
  const isError = file.status === "error";

  return (
    <>
      <div className="bg-transparent border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3 transition-all duration-200 cursor-pointer">
        <div className="flex items-center gap-4">
          {/* File Icon */}
          <ImageToolIconBadge
            primaryColor={config.primaryColor}
            bgColor={config.dropzoneColor}
            bgColorDark={config.dropzoneColorDark}
            isDark={isDark}
          />

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <FileInfo name={file.name} size={file.size} />
          </div>

          {/* Format Display & Settings Button */}
          {file.status === "pending" && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <SettingsSvg />
              <span>{file.settings.format?.toUpperCase()}</span>
            </button>
          )}

          {/* Status Badge */}
          {!isProcessing && <RemoveButton onClick={onRemove} />}
        </div>

        {/* Error Message */}
        {isError && file.error && <FileError error={file.error} />}
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
