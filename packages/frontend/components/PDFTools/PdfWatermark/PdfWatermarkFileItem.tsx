// ============================================================================
// FILE: src/components/PDFTools/PdfWatermark/PdfWatermarkFileItem.tsx
// File card with text/image watermark settings
// ============================================================================

import { useState, useEffect } from "react";
import { PdfWatermarkViewer } from "./PdfWatermarkViewer";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import { UploadSvg } from "@/components/Svg/ToolsSvg";

interface PdfWatermarkFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const POSITION_OPTIONS = [
  { value: "center", label: "Center", icon: "⊙" },
  { value: "top_left", label: "Top Left", icon: "↖" },
  { value: "top_right", label: "Top Right", icon: "↗" },
  { value: "bottom_left", label: "Bottom Left", icon: "↙" },
  { value: "bottom_right", label: "Bottom Right", icon: "↘" },
];

const COLOR_OPTIONS = [
  { value: "gray", label: "Gray", color: "#6B7280" },
  { value: "red", label: "Red", color: "#EF4444" },
  { value: "blue", label: "Blue", color: "#3B82F6" },
  { value: "green", label: "Green", color: "#10B981" },
  { value: "black", label: "Black", color: "#000000" },
  { value: "white", label: "White", color: "#FFFFFF" },
];

export const PdfWatermarkFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfWatermarkFileItemProps) => {
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  // ============================================================================
  // SYNC WATERMARK TYPE
  // ============================================================================
  useEffect(() => {
    setWatermarkType(file.settings.watermarkFile ? "image" : "text");
  }, [file.settings.watermarkFile]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleTypeChange = (type: "text" | "image") => {
    setWatermarkType(type);
    if (type === "text") {
      updateSettings(file.id, { watermarkFile: undefined });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      updateSettings(file.id, { watermarkFile: uploadedFile });
    }
  };

  const handleTextChange = (value: string) => {
    updateSettings(file.id, { text: value });
  };

  const handleOpacityChange = (value: number) => {
    updateSettings(file.id, { opacity: value });
  };

  const handlePositionChange = (value: string) => {
    updateSettings(file.id, { position: value as any });
  };

  const handleFontSizeChange = (value: number) => {
    updateSettings(file.id, { font_size: value });
  };

  const handleRotationChange = (value: number) => {
    updateSettings(file.id, { rotation: value });
  };

  const handleColorChange = (value: string) => {
    updateSettings(file.id, { color: value });
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

  const truncateFileName = (name: string, maxLength = 40): string => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop() || "";
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4);
    return `${truncated}...${ext}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
      {/* File header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        {/* PDF icon */}
        <div
          className="p-3 rounded-xl shrink-0 shadow-sm"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div style={{ color: config.primaryColor }} className="w-6 h-6">
            <PDFToImageSVg />
          </div>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">
              {formatBytes(file.size)}
            </span>
            <span className="text-zinc-400">•</span>
            <span>Ready for watermark</span>
          </p>
        </div>

        {/* Remove button */}
        <button
          onClick={() => removeFile(file.id)}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all"
          aria-label="Remove file"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      {/* Settings + Preview */}
      <div className="p-4 space-y-4">
        {/* Watermark Type Toggle */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl">
          <button
            onClick={() => handleTypeChange("text")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              watermarkType === "text"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            📝 Text Watermark
          </button>
          <button
            onClick={() => handleTypeChange("image")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              watermarkType === "image"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            🖼️ Image Watermark
          </button>
        </div>

        {/* Text Watermark Settings */}
        {watermarkType === "text" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Text Input */}
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                Watermark Text
              </label>
              <input
                type="text"
                value={file.settings.text || "CONFIDENTIAL"}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-colors"
              />
            </div>

            {/* Font Size */}
            <RangeSlider
              label="Font Size"
              value={file.settings.font_size || 50}
              min={10}
              max={200}
              step={5}
              unit="pt"
              color={config.primaryColor}
              onChange={handleFontSizeChange}
              icon="🔤"
              presets={[
                { label: "Small", value: 30 },
                { label: "Medium", value: 50 },
                { label: "Large", value: 80 },
                { label: "XL", value: 120 },
              ]}
            />

            {/* Rotation */}
            <RangeSlider
              label="Rotation"
              value={file.settings.rotation || 45}
              min={0}
              max={360}
              step={5}
              unit="°"
              color={config.primaryColor}
              onChange={handleRotationChange}
              icon="🔄"
              presets={[
                { label: "0°", value: 0 },
                { label: "45°", value: 45 },
                { label: "90°", value: 90 },
                { label: "135°", value: 135 },
              ]}
            />

            {/* Color Selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                Text Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    onClick={() => handleColorChange(colorOption.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      file.settings.color === colorOption.value
                        ? "border-2 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                    style={{
                      borderColor:
                        file.settings.color === colorOption.value
                          ? colorOption.color
                          : undefined,
                      backgroundColor:
                        file.settings.color === colorOption.value
                          ? `${colorOption.color}15`
                          : undefined,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-1 border border-zinc-300 dark:border-zinc-600"
                      style={{ backgroundColor: colorOption.color }}
                    />
                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      {colorOption.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Watermark Settings */}
        {watermarkType === "image" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Image Upload */}
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                Upload Watermark Image
              </label>
              <label
                htmlFor={`watermark-image-${file.id}`}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                style={{
                  borderColor: file.settings.watermarkFile
                    ? config.primaryColor
                    : undefined,
                }}
              >
                {file.settings.watermarkFile ? (
                  <div className="text-center px-4">
                    <div className="text-2xl mb-2">✅</div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {(file.settings.watermarkFile as File).name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2">
                      <UploadSvg />
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Click to upload
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      PNG, JPG, SVG (recommended transparent)
                    </p>
                  </div>
                )}
                <input
                  id={`watermark-image-${file.id}`}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Common Settings (Opacity & Position) */}
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {/* Opacity */}
          <RangeSlider
            label="Opacity"
            value={file.settings.opacity || 0.3}
            min={0.1}
            max={1.0}
            step={0.05}
            unit=""
            color={config.primaryColor}
            onChange={handleOpacityChange}
            icon="💧"
            presets={[
              { label: "Light", value: 0.2 },
              { label: "Medium", value: 0.3 },
              { label: "Strong", value: 0.5 },
              { label: "Bold", value: 0.8 },
            ]}
          />

          {/* Position */}
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POSITION_OPTIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => handlePositionChange(pos.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    file.settings.position === pos.value
                      ? "text-white shadow-sm"
                      : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      file.settings.position === pos.value
                        ? config.primaryColor
                        : undefined,
                    borderColor:
                      file.settings.position === pos.value
                        ? config.primaryColor
                        : undefined,
                  }}
                >
                  <div className="text-lg mb-1">{pos.icon}</div>
                  <div className="text-xs">{pos.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        {file.originalFile && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <PdfWatermarkViewer
              file={file.originalFile}
              settings={file.settings}
              primaryColor={config.primaryColor}
            />
          </div>
        )}
      </div>
    </div>
  );
};