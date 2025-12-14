// ============================================================================
// FILE: src/components/PDFTools/PdfCrop/PdfCrop.tsx
// PURPOSE: PDF Crop Component - Crop PDF pages with visual preview
// ============================================================================

import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import {
  CancelSvg,
  TrashSvg,
  ChevronDownSvg,
} from "@/components/Svg/CommonSvg";
import { useCropPdf } from "@/hooks/pdfHooks/useCropPdf.hook";
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

interface CropPreset {
  value: string;
  label: string;
  desc: string;
  settings: {
    crop_x: number;
    crop_y: number;
    crop_width: number;
    crop_height: number;
  };
}

interface PdfFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateFileSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CROP_PRESETS: CropPreset[] = [
  {
    value: "letter",
    label: "Letter Size",
    desc: "8.5 x 11 inches",
    settings: { crop_x: 0, crop_y: 0, crop_width: 612, crop_height: 792 },
  },
  {
    value: "a4",
    label: "A4 Size",
    desc: "210 x 297 mm",
    settings: { crop_x: 0, crop_y: 0, crop_width: 595, crop_height: 842 },
  },
  {
    value: "margin-trim",
    label: "Trim Margins",
    desc: "Remove 0.5 inch margins",
    settings: { crop_x: 36, crop_y: 36, crop_width: 540, crop_height: 720 },
  },
  {
    value: "custom",
    label: "Custom",
    desc: "Set custom dimensions",
    settings: { crop_x: 50, crop_y: 50, crop_width: 500, crop_height: 700 },
  },
];

// ============================================================================
// SUB-COMPONENT: CropVisualizer
// Visual representation of crop area
// ============================================================================

const CropVisualizer = ({ settings }: { settings: PdfFileSettings }) => {
  const pageWidth = 612; // Letter width in points
  const pageHeight = 792; // Letter height in points
  const scale = 0.3; // Scale for display

  const cropX = settings.crop_x || 0;
  const cropY = settings.crop_y || 0;
  const cropWidth = settings.crop_width || 500;
  const cropHeight = settings.crop_height || 700;

  return (
    <div className="flex items-center justify-center py-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="relative" style={{ width: pageWidth * scale, height: pageHeight * scale }}>
        {/* Full Page */}
        <div className="absolute inset-0 bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-sm shadow-lg" />
        
        {/* Crop Area */}
        <div
          className="absolute bg-blue-500/20 border-2 border-blue-500 rounded-sm"
          style={{
            left: cropX * scale,
            top: cropY * scale,
            width: cropWidth * scale,
            height: cropHeight * scale,
          }}
        >
          {/* Corner Markers */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </div>

        {/* Dimensions Label */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
          {cropWidth} × {cropHeight} pts
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and crop settings
// ============================================================================

const PdfFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
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

  const handlePresetClick = (preset: CropPreset) => {
    setSelectedPreset(preset.value);
    updateFileSettings(file.id, preset.settings);
    if (preset.value !== "custom") {
      setIsSettingsOpen(false);
    }
  };

  const handleCustomInput = (
    field: keyof PdfFileSettings,
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    updateFileSettings(file.id, { [field]: numValue });
    setSelectedPreset("custom");
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
    const preset = CROP_PRESETS.find((p) => p.value === selectedPreset);
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

        {/* Crop Settings Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="min-w-[120px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✂️</span>
              <span className="font-medium text-sm">{getCurrentLabel()}</span>
            </div>
            <ChevronDownSvg />
          </button>

          {isSettingsOpen && (
            <div className="absolute z-20 right-0 mt-1 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl w-[380px] shadow-xl">
              {/* Visual Preview */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Crop Preview
                </label>
                <CropVisualizer settings={file.settings} />
              </div>

              {/* Preset Buttons */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CROP_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetClick(preset)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all border cursor-pointer ${
                        selectedPreset === preset.value
                          ? "text-white"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor:
                          selectedPreset === preset.value
                            ? config.primaryColor
                            : undefined,
                        borderColor:
                          selectedPreset === preset.value
                            ? config.primaryColor
                            : undefined,
                      }}
                    >
                      <div className="font-bold text-xs">{preset.label}</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Inputs */}
              {selectedPreset === "custom" && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                    Custom Dimensions (points)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={file.settings.crop_x || 0}
                        onChange={(e) => handleCustomInput("crop_x", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={file.settings.crop_y || 0}
                        onChange={(e) => handleCustomInput("crop_y", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
                        Width
                      </label>
                      <input
                        type="number"
                        value={file.settings.crop_width || 0}
                        onChange={(e) =>
                          handleCustomInput("crop_width", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
                        Height
                      </label>
                      <input
                        type="number"
                        value={file.settings.crop_height || 0}
                        onChange={(e) =>
                          handleCustomInput("crop_height", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfCrop = () => {
  const config = PDF_TOOL_CONFIGS["pdf-crop"];
  const isDark = useDarkMode();

  const {
    files,
    cropping,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    cropAllFiles,
    clearAll,
  } = useCropPdf();

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

  const canCrop = stats.pending > 0 && !cropping;
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
                {stats.pending > 0 && `${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
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
                updateFileSettings={updateFileSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Crop Button */}
          {canCrop && (
            <GlassButton
              loading={cropping}
              primaryColor={config.primaryColor}
              onClick={cropAllFiles}
            >
              {cropping
                ? "Cropping..."
                : `Crop ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="crop-pdf" config={config} />
    </div>
  );
};

export default PdfCrop;