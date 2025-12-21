import { useState, useEffect, useCallback } from "react";
import { PdfRemoveViewer } from "./PdfRemoveViewer";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import type {
  PdfProcessedFile,
  PdfToolConfig,
  PdfFileSettings,
} from "@/services/pdfService/types";
import { InputField } from "@/components/Layouts/InputField";
import { FileInfo, RemoveButton, ToolIconBadge } from "@/components/Shared/FileUI";

interface PdfRemovePagesFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateFileSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const QUICK_PRESETS = [
  { label: "First Page", value: "1" },
  { label: "Pages 2-5", value: "2-5" },
  { label: "Odd Pages", value: "1,3,5,7,9" },
  { label: "Even Pages", value: "2,4,6,8,10" },
];

const FORMAT_EXAMPLES = [
  { label: "Single pages", example: "1,3,5" },
  { label: "Page range", example: "2-5" },
  { label: "Combined", example: "1,3-5,7,10-12" },
];

export const PdfRemovePagesFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: PdfRemovePagesFileItemProps) => {
  const [pageRange, setPageRange] = useState(file.settings.pages_to_remove || "");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  // Parse page range helper
  const parsePageRange = useCallback(
    (range: string): { pages: number[]; valid: boolean; error: string } => {
      if (!range.trim()) {
        return { pages: [], valid: false, error: "Page range cannot be empty" };
      }

      const pages = new Set<number>();
      const parts = range.split(",");

      try {
        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          if (trimmed.includes("-")) {
            const [start, end] = trimmed.split("-").map((s) => parseInt(s.trim()));
            if (isNaN(start) || isNaN(end) || start > end) {
              return {
                pages: [],
                valid: false,
                error: `Invalid range: ${trimmed}`,
              };
            }
            for (let i = start; i <= end; i++) {
              pages.add(i);
            }
          } else {
            const num = parseInt(trimmed);
            if (isNaN(num)) {
              return {
                pages: [],
                valid: false,
                error: `Invalid page number: ${trimmed}`,
              };
            }
            pages.add(num);
          }
        }

        return {
          pages: Array.from(pages).sort((a, b) => a - b),
          valid: true,
          error: "",
        };
      } catch (err) {
        return { pages: [], valid: false, error: "Invalid format" };
      }
    },
    []
  );

  // Parse page range whenever it changes
  useEffect(() => {
    const parsed = parsePageRange(pageRange);
    setSelectedPages(parsed.pages);

    if (parsed.valid) {
      updateFileSettings(file.id, { pages_to_remove: pageRange });
    }
  }, [pageRange, file.id, updateFileSettings, parsePageRange]);

  // Handle page removal from viewer
  const handlePageRemoveFromViewer = useCallback((pageNumber: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNumber)) return prev;
      const newPages = [...prev, pageNumber].sort((a, b) => a - b);
      setPageRange(newPages.join(","));
      return newPages;
    });
  }, []);

  // Handle page undo from viewer
  const handlePageUndoFromViewer = useCallback((pageNumber: number) => {
    setSelectedPages((prev) => {
      const newPages = prev.filter((p) => p !== pageNumber);
      setPageRange(newPages.length > 0 ? newPages.join(",") : "");
      return newPages;
    });
  }, []);

  // Apply quick preset
  const applyPreset = (preset: string) => {
    setPageRange(preset);
  };

  const hasError = file.status === "error" && file.error;
  const showSelectedPages = selectedPages.length > 0;
  const displayedPages = selectedPages.slice(0, 20);
  const remainingPagesCount = selectedPages.length - 20;

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />
        <div className="flex-1 min-w-0">
          <FileInfo name={file.name} size={file.size} />
        </div>
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Content Grid */}
      <div className="p-4 flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Page Range Input */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
              Pages to Remove
            </label>
            <InputField
              label=""
              type="text"
              value={pageRange}
              onChange={setPageRange}
              placeholder="e.g., 1,3,5-7,10"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PRESETS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => applyPreset(value)}
                  className="px-3 py-2 text-sm bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
              Format Examples:
            </h4>
            <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200">
              {FORMAT_EXAMPLES.map(({ label, example }) => (
                <li key={example}>
                  • {label}: <code className="bg-slate-100 dark:bg-slate-900/40 px-1 py-0.5 rounded">{example}</code>
                </li>
              ))}
            </ul>
          </div>

          {/* Selected Pages Preview */}
          {showSelectedPages && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <h4 className="text-xs font-bold text-red-900 dark:text-red-100 mb-2">
                Pages to be Removed:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {displayedPages.map((page) => (
                  <span
                    key={page}
                    className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md"
                  >
                    {page}
                  </span>
                ))}
                {remainingPagesCount > 0 && (
                  <span className="px-2 py-1 text-xs text-red-600 dark:text-red-400">
                    +{remainingPagesCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <ErrorSvg className="w-4 h-4 inline-block mr-1" />
                {file.error}
              </p>
            </div>
          )}
        </div>

        {/* Right: PDF Preview */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfRemoveViewer
              file={file.originalFile}
              pagesToRemove={selectedPages}
              onPageRemove={handlePageRemoveFromViewer}
              onPageUndo={handlePageUndoFromViewer}
            />
          )}
        </div>
      </div>
    </div>
  );
};