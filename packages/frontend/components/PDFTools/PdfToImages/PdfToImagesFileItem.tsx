// ============================================================================
// FILE 1: src/components/PDFTools/PdfToImages/PdfToImagesFileItem.tsx
// Individual file card with format & DPI settings dropdown
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { CancelSvg, ChevronDownSvg, SettingsSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";

interface PdfToImagesFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const FORMAT_OPTIONS = [
  { value: "png", label: "PNG", desc: "Best quality, larger size" },
  { value: "jpeg", label: "JPEG", desc: "Good quality, smaller size" },
  { value: "jpg", label: "JPG", desc: "Same as JPEG" },
];

const DPI_OPTIONS = [
  { value: 72, label: "72 DPI", desc: "Screen quality" },
  { value: 150, label: "150 DPI", desc: "Standard quality (recommended)" },
  { value: 300, label: "300 DPI", desc: "High quality" },
  { value: 600, label: "600 DPI", desc: "Print quality" },
];

export const PdfToImagesFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfToImagesFileItemProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const handleFormatChange = (format: string) => {
    updateSettings(file.id, { format: format as any });
  };

  const handleDpiChange = (dpi: number) => {
    updateSettings(file.id, { dpi });
  };

  const handlePageRangeChange = (value: string) => {
    updateSettings(file.id, { page_range: value || undefined });
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

  const truncateFileName = (name: string, maxLength = 30): string => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop() || "";
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4);
    return `${truncated}...${ext}`;
  };

  const getCurrentFormatLabel = (): string => {
    const format = FORMAT_OPTIONS.find((f) => f.value === file.settings.format);
    return format?.label || "PNG";
  };

  const getCurrentDpiLabel = (): string => {
    return `${file.settings.dpi || 150} DPI`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      <div className="flex items-center gap-3">
        {/* PDF Icon */}
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

        {/* Settings Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="min-w-[110px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-1">
              <SettingsSvg />
              <div className="flex flex-col items-start">
                <p className="font-medium text-sm">{getCurrentFormatLabel()}</p>
              </div>
            </div>
            <div
              className={`transition-transform duration-200 ${
                isSettingsOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronDownSvg />
            </div>
          </button>

          {/* Settings Panel */}
          {isSettingsOpen && (
            <div className="absolute z-20 right-0 mt-1 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-[340px]">
              {/* Format Selection */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_OPTIONS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => handleFormatChange(format.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium text-center transition-all border cursor-pointer ${
                        file.settings.format === format.value
                          ? "text-white shadow-sm"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor:
                          file.settings.format === format.value
                            ? config.primaryColor
                            : undefined,
                        borderColor:
                          file.settings.format === format.value
                            ? config.primaryColor
                            : undefined,
                      }}
                    >
                      <div className="font-bold text-xs">{format.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        {format.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* DPI Selection */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Image Quality (DPI)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DPI_OPTIONS.map((dpi) => (
                    <button
                      key={dpi.value}
                      onClick={() => handleDpiChange(dpi.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all border cursor-pointer ${
                        file.settings.dpi === dpi.value
                          ? "text-white shadow-sm"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor:
                          file.settings.dpi === dpi.value
                            ? config.primaryColor
                            : undefined,
                        borderColor:
                          file.settings.dpi === dpi.value
                            ? config.primaryColor
                            : undefined,
                      }}
                    >
                      <div className="font-bold text-xs">{dpi.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        {dpi.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Range (Optional) */}
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Page Range (Optional)
                </label>
                <input
                  type="text"
                  value={file.settings.page_range || ""}
                  onChange={(e) => handlePageRangeChange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10 (leave empty for all)"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                  Leave empty to convert all pages
                </p>
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
    </div>
  );
};
