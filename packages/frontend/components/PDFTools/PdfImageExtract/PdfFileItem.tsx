import { useState, useRef, useEffect } from "react";
import {
  ChevronDownSvg,
  SettingsSvg,
} from "@/components/Svg/CommonSvg";
import { InputField } from "@/components/Layouts/InputField";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import { FileError, FileInfo, RemoveButton } from "@/components/Shared/FileUI";

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
            <PDFToImageSVg />
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <FileInfo name={file.name} size={file.size} />
        </div>

        {/* Size Settings Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="min-w-[120px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-1">
              <SettingsSvg />
              <span className="font-medium text-sm">{getCurrentLabel()}</span>
            </div>
            <ChevronDownSvg />
          </button>

          {isSettingsOpen && (
            <div className="absolute z-20 right-0 mt-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl md:w-[20vw]">
              {/* Preset Buttons */}
              <div className="space-y-1 mb-3">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Size Presets
                </label>
                {SIZE_PRESETS.map((preset) => {
                  const isActive =
                    preset.value.min_width === file.settings.min_width &&
                    preset.value.min_height === file.settings.min_height;

                  return (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className={`w-full px-3 py-2 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                        isActive
                          ? "text-white"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? config.primaryColor
                          : undefined,
                        borderColor: isActive ? config.primaryColor : undefined,
                      }}
                    >
                      <div>
                        <div className="font-bold">{preset.label}</div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {preset.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Inputs */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Custom Minimum Size (pixels)
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