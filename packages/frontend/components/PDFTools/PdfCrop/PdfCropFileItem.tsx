import { useState, useEffect } from "react";
import { PdfCropViewer } from "./PdfCropViewer";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";

// New components for the radio-like buttons
const RadioButton = ({
  checked,
  label,
  onChange,
  color,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  color: string;
}) => (
  <button
    type="button"
    onClick={onChange}
    className="flex items-center space-x-3 p-3 w-full text-left rounded-lg transition-colors duration-200 cursor-pointer"
    style={{
      backgroundColor: checked
        ? `${color}20` // Light background when checked
        : "transparent",
    }}
  >
    <div
      className="w-4 h-4 rounded-full border-2 transition-all duration-200 shrink-0"
      style={{
        borderColor: checked ? color : "var(--color-zinc-400)",
        backgroundColor: checked ? color : "transparent",
      }}
    />
    <span
      className="text-sm font-medium transition-colors duration-200"
      style={{
        color: checked ? color : "var(--color-zinc-600)",
      }}
    >
      {label}
    </span>
  </button>
);

interface PdfCropFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateFileSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

export const PdfCropFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: PdfCropFileItemProps) => {
  // true means "Crop All Pages" is selected (i.e., crop_page_range is undefined/null)
  const [cropAllPagesSelected, setCropAllPagesSelected] = useState(
    !file.settings.crop_page_range 
  );

  // ============================================================================
  // SYNC STATE WITH SETTINGS
  // ============================================================================
  useEffect(() => {
    // Sync local state based on the presence of crop_page_range
    setCropAllPagesSelected(!file.settings.crop_page_range);
  }, [file.settings.crop_page_range]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleCropChange = (crop: {
    crop_x: number;
    crop_y: number;
    crop_width: number;
    crop_height: number;
  }) => {
    updateFileSettings(file.id, crop);
  };

  const handleModeChange = (allPages: boolean) => {
    setCropAllPagesSelected(allPages);

    if (allPages) {
      // Crop All Pages selected
      updateFileSettings(file.id, {
        crop_page_range: undefined, // Clear page range
      });
    } else {
      // Specify Page Range selected, use current range or an empty string for the input
      updateFileSettings(file.id, {
        crop_page_range: file.settings.crop_page_range || "",
      });
    }
  };

  const handlePageRangeInput = (value: string) => {
    updateFileSettings(file.id, {
      crop_page_range: value || undefined, // Use undefined if input is empty
    });
  };

  // ============================================================================
  // HELPERS
  // ============================================================================
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <div
          className="p-2.5 rounded-xl shrink-0"
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

        <div className="flex-1 min-w-0">
          <h3 className="text-sm leading-none font-semibold truncate text-zinc-800 dark:text-zinc-200">
            {file.name}
          </h3>
          <p className="text-xs text-zinc-500 px-1 bg-zinc-200 dark:bg-zinc-800 rounded-md inline-block mt-1">
            {formatBytes(file.size)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT: TWO COLUMNS */}
      <div className="p-4 grid lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - SETTINGS */}
        <div className="space-y-5">
          {/* PAGE RANGE RADIO BUTTONS */}
          <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-2 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
              {/* Crop All Pages Button */}
              <RadioButton
                checked={cropAllPagesSelected}
                onChange={() => handleModeChange(true)}
                label="Crop All Pages"
                color={config.primaryColor}
              />
              {/* Specify Page Range Button */}
              <RadioButton
                checked={!cropAllPagesSelected}
                onChange={() => handleModeChange(false)}
                label="Specify Page Range"
                color={config.primaryColor}
              />
            </div>

            {/* PAGE RANGE INPUT - SMOOTH ANIMATION */}
            <div
              className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-in-out ${
                !cropAllPagesSelected // Only show when "Specify Page Range" is selected
                  ? "grid-rows-[1fr] opacity-100 pt-4"
                  : "grid-rows-[0fr] opacity-0 pt-0 pointer-events-none"
              }`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500">
                    Page Range
                  </label>
                  <input
                    type="text"
                    value={file.settings.crop_page_range || ""}
                    onChange={(e) => handlePageRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-10"
                    // Disable input when "Crop All Pages" is selected
                    disabled={cropAllPagesSelected} 
                    className={`w-full px-3 py-2 bg-transparent border rounded-lg text-sm outline-none transition-all ${
                      cropAllPagesSelected
                        ? "text-zinc-500 dark:text-zinc-500 border-zinc-300 dark:border-zinc-700/50 cursor-not-allowed"
                        : "text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                    }`}
                  />
                  <p className="text-xs text-zinc-400">
                    Separate with commas. Use hyphens for ranges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CROP DIMENSIONS INFO - REST OF THE COMPONENT REMAINS THE SAME */}
          <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Crop Dimensions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Position</p>
                <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  X: {file.settings.crop_x ?? 50}pt
                </p>
                <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  Y: {file.settings.crop_y ?? 50}pt
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">Size</p>
                <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  W: {file.settings.crop_width ?? 400}pt
                </p>
                <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  H: {file.settings.crop_height ?? 400}pt
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - PREVIEW */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfCropViewer
              file={file.originalFile}
              settings={file.settings}
              onCropChange={handleCropChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};