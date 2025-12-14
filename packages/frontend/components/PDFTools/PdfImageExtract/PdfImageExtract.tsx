// ============================================================================
// FILE: src/components/PDFTools/PdfImageExtract/PdfImageExtract.tsx
// PURPOSE: PDF Image Extractor - Extract images from PDFs as ZIP
// ============================================================================

import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import {
  CancelSvg,
  TrashSvg,
  ChevronDownSvg,
  SettingsSvg,
} from "@/components/Svg/CommonSvg";
import { useExtractImages } from "@/hooks/pdfHooks/useExtractImages.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";

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
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and size settings
// ============================================================================

const PdfFileItem = ({
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

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const truncateFileName = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop() || "";
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4);
    return `${truncated}...${ext}`;
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
          <h3
            className="text-sm leading-none font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400 mt-1">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Size Settings Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="min-w-[120px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-2">
              <SettingsSvg/>
              <span className="font-medium text-sm">{getCurrentLabel()}</span>
            </div>
            <ChevronDownSvg />
          </button>

          {isSettingsOpen && (
            <div className="absolute z-20 right-0 mt-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl w-[320px] shadow-xl">
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
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
                      Width
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      onBlur={handleCustomInput}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
                      Height
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      onBlur={handleCustomInput}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
          aria-label="Remove file"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      {/* Error Message */}
      {file.status === "error" && file.error && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfImageExtract = () => {
  const config = PDF_TOOL_CONFIGS["pdf-extract-images"];
  const isDark = useDarkMode();

  const {
    files,
    extracting,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateSettings,
    extractAll,
    clearAll,
  } = useExtractImages();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(newFiles);
    },
    [addFiles]
  );

  const handleGoogleDrive = useCallback(async () => {
    await addFromGoogleDrive();
  }, [addFromGoogleDrive]);

  const handleDropbox = useCallback(async () => {
    await addFromDropbox();
  }, [addFromDropbox]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canExtract = files.length > 0 && !extracting;
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag Drop Zone */}
      <PdfDragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onGooglePick={handleGoogleDrive}
        onDropboxPick={handleDropbox}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {files.length} file{files.length !== 1 ? "s" : ""} ready • ZIP output
              </p>
            </div>

            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
            </button>
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file) => (
              <PdfFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Extract Button */}
          {canExtract && (
            <GlassButton
              loading={extracting}
              primaryColor={config.primaryColor}
              onClick={extractAll}
            >
              {extracting
                ? "Extracting Images..."
                : `Extract Images (${files.length} file${files.length !== 1 ? "s" : ""})`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="extract-images" config={config} />
    </div>
  );
};

export default PdfImageExtract;