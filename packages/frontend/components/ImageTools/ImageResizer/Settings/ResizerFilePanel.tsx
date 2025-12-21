// components/ImageTools/ImageResizer/Settings/ResizerFilePanel.tsx
import { SettingsSvg } from "@/components/Svg/CommonSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import { useState, useEffect } from "react";
import { ResizerSettingsPanel } from "./ResizerSettingsPanel";
import { FileError, FileInfo, RemoveButton } from "@/components/Shared/FileUI";
import { ImageToolIconBadge } from "@/components/Shared/FileUITwo";

interface ResizerFilePanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  onUpdateSettings: (settings: FileSettings) => void;
  onRemove: () => void;
}

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

  const isProcessing = file.status === "processing";
  const isError = file.status === "error";

  return (
    <>
      <div className="bg-transparent border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3">
        <div className="flex items-center gap-3">
          <ImageToolIconBadge
            primaryColor={config.primaryColor}
            bgColor={config.dropzoneColor}
            bgColorDark={config.dropzoneColorDark}
            isDark={isDark}
          />

          <div className="flex-1 min-w-0">
            <FileInfo name={file.name} size={file.size} />
          </div>

          {file.status === "pending" && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <SettingsSvg />
              <span className="md:block hidden text-sm">Settings</span>
            </button>
          )}

          {!isProcessing && <RemoveButton onClick={onRemove} />}
        </div>

        {isError && file.error && <FileError error={file.error} />}
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
