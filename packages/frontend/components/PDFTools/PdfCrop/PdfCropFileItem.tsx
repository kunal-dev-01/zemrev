// ============================================================================
// FILE: src/components/PDFTools/PdfCrop/PdfCropFileItem.tsx
// Fixed: Smooth Toggle Animation + Proper Props
// ============================================================================

import { useState, useEffect } from "react";
import { PdfCropViewer } from "./PdfCropViewer";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";

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
  const [cropAllPages, setCropAllPages] = useState(
    !file.settings.crop_page_range
  );

  // ============================================================================
  // SYNC STATE WITH SETTINGS
  // ============================================================================
  useEffect(() => {
    setCropAllPages(!file.settings.crop_page_range);
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

  const handlePageRangeToggle = (allPages: boolean) => {
    setCropAllPages(allPages);
    updateFileSettings(file.id, {
      crop_page_range: allPages ? undefined : "",
    });
  };

  const handlePageRangeInput = (value: string) => {
    updateFileSettings(file.id, {
      crop_page_range: value || undefined,
    });
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
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200">
      {/* File header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        {/* PDF icon */}
        <div
          className="p-3 rounded-xl shrink-0"
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
            <span>Ready to crop</span>
          </p>
        </div>

        {/* Remove button */}
        <button
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
          aria-label="Remove file"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      {/* Crop settings + viewer */}
      <div className="p-3 space-y-2">
        {/* Page range toggle */}
        <div className="bg-transparent rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
          <ToggleSwitch
            checked={cropAllPages}
            onChange={handlePageRangeToggle}
            label="Crop all pages"
            description={
              cropAllPages
                ? "Applied to entire document"
                : "Specify page range below"
            }
            color={config.primaryColor}
          />

          {/* SMOOTH ANIMATION WRAPPER */}
          <div
            className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-in-out ${
              !cropAllPages
                ? "grid-rows-[1fr] opacity-100 pt-3"
                : "grid-rows-[0fr] opacity-0 pt-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden min-h-0">
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
                  Page Range
                </label>
                <input
                  type="text"
                  value={file.settings.crop_page_range || ""}
                  onChange={(e) => handlePageRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-colors"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                  Separate with commas. Use hyphens for ranges.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF crop viewer - Always visible */}
        {file.originalFile && (
            <PdfCropViewer
              file={file.originalFile}
              settings={file.settings}
              onCropChange={handleCropChange}
            />
        )}
      </div>
    </div>
  );
};