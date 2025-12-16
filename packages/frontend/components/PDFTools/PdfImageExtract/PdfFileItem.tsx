import { useState, useRef, useEffect } from "react";
import { InputField } from "@/components/Layouts/InputField";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileError,
  FileInfo,
  RemoveButton,
  SettingsToggleButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";

// ============================================================================
// TYPES
// ============================================================================

interface SizePreset {
  value: { min_width: number; min_height: number };
  label: string;
  desc: string;
}

interface PdfFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_PRESETS: SizePreset[] = [
  {
    value: { min_width: 50, min_height: 50 },
    label: "All Images",
    desc: "Extract everything (50x50+)",
  },
  {
    value: { min_width: 100, min_height: 100 },
    label: "Small+",
    desc: "Skip tiny images (100x100+)",
  },
  {
    value: { min_width: 200, min_height: 200 },
    label: "Medium+",
    desc: "Medium size images (200x200+)",
  },
  {
    value: { min_width: 500, min_height: 500 },
    label: "Large Only",
    desc: "High resolution only (500x500+)",
  },
];

// ============================================================================
// COMPONENT: PdfFileItem
// Handles individual file display and size settings
// ============================================================================

export const PdfFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState(
    file.settings.min_width?.toString() || "100"
  );
  const [customHeight, setCustomHeight] = useState(
    file.settings.min_height?.toString() || "100"
  );
  const settingsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePresetClick = (preset: SizePreset) => {
    updateSettings(file.id, preset.value);
    setCustomWidth(preset.value.min_width.toString());
    setCustomHeight(preset.value.min_height.toString());
    setIsSettingsOpen(false);
  };

  const handleCustomInput = () => {
    const width = parseInt(customWidth) || 100;
    const height = parseInt(customHeight) || 100;
    updateSettings(file.id, { min_width: width, min_height: height });
  };

  const getCurrentLabel = (): string => {
    const preset = SIZE_PRESETS.find(
      (p) =>
        p.value.min_width === file.settings.min_width &&
        p.value.min_height === file.settings.min_height
    );
    return preset?.label || "Custom";
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      <div className="flex items-center gap-3">
        {/* PDF Icon Box */}
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <FileInfo name={file.name} size={file.size} />
        </div>

        {/* Size Settings Dropdown */}
        <div ref={settingsRef}>
          <SettingsToggleButton
            isOpen={isSettingsOpen}
            label={getCurrentLabel()}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          />

          {isSettingsOpen && (
            <>
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:min-w-[15vw] min-w-full origin-top-right ring-1 ring-black/5 dark:ring-white/5"
                style={{
                  animation: "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {/* Preset Buttons */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                    Size Presets
                  </label>
                  <div className="space-y-2">
                    {SIZE_PRESETS.map((preset) => {
                      const isActive =
                        preset.value.min_width === file.settings.min_width &&
                        preset.value.min_height === file.settings.min_height;

                      return (
                        <button
                          key={preset.label}
                          onClick={() => handlePresetClick(preset)}
                          className={`
                            relative w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all duration-200 cursor-pointer outline-none
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
                              {preset.label}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${
                                isActive
                                  ? "text-white/80"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
                              {preset.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Inputs */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                    Custom Minimum Size (px)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="Width"
                      value={customWidth}
                      onChange={setCustomWidth}
                      onBlur={handleCustomInput}
                    />

                    <InputField
                      label="Height"
                      value={customHeight}
                      onChange={setCustomHeight}
                      onBlur={handleCustomInput}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Error Message */}
      {file.status === "error" && file.error && (
        <FileError error={file.error} />
      )}
    </div>
  );
};