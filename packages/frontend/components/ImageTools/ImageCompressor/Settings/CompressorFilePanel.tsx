// components/ImageTools/ImageCompressor/Settings/CompressorFilePanel.tsx

import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";
import { useState, useRef, useEffect } from "react";
import {
  FileError,
  FileInfo,
  RemoveButton,
  SettingsToggleButton,
} from "@/components/Shared/FileUI";
import { ImageToolIconBadge } from "@/components/Shared/FileUITwo";

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

  const isProcessing = file.status === "processing";
  const isError = file.status === "error";
  const label = file.settings.quality;

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3 transition-all duration-200 relative cursor-pointer">
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
          <div ref={qualityRef}>
            <SettingsToggleButton
              isOpen={isQualityOpen}
              label={label as number}
              onClick={() => setIsQualityOpen(!isQualityOpen)}
            />

            {isQualityOpen && (
              <>
                <div
                  className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 origin-top-right ring-1 ring-black/5 dark:ring-white/5 min-w-full md:min-w-[17vw]"
                  style={{
                    animation:
                      "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }}
                >
                  <div className="mb-2">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                      Quality
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {qualityOptions.map((option) => {
                      const isActive = file.settings.quality === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            onUpdateSettings({ quality: option.value });
                            setIsQualityOpen(false);
                          }}
                          className={`
                            relative flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all duration-200 cursor-pointer outline-none
                            ${
                              isActive
                                ? "border-transparent"
                                : "bg-transparent border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            }
                          `}
                          style={
                            {
                              backgroundColor: isActive
                                ? config.primaryColor
                                : undefined,
                              borderColor: isActive
                                ? config.primaryColor
                                : undefined,
                              "--tw-ring-color": config.primaryColor,
                            } as React.CSSProperties
                          }
                        >
                          <div>
                            <div
                              className={`font-bold text-sm ${
                                isActive
                                  ? "text-white"
                                  : "text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {option.label}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${
                                isActive
                                  ? "text-white/80"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
                              {option.desc}
                            </div>
                          </div>
                          <span
                            className={`text-sm font-bold ${
                              isActive
                                ? "text-white"
                                : "text-zinc-600 dark:text-zinc-300"
                            }`}
                          >
                            {option.value}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!isProcessing && <RemoveButton onClick={onRemove} />}
      </div>

      {isError && file.error && <FileError error={file.error} />}
    </div>
  );
};
