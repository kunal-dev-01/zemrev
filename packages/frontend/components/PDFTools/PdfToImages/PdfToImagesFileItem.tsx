import { useState, useRef, useEffect } from "react";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileInfo,
  RemoveButton,
  SettingsToggleButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";
import { InputField } from "@/components/Layouts/InputField";

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
    updateSettings(file.id, { format: format as "png" | "jpeg" | "jpg" });
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

  const getCurrentFormatLabel = (): string => {
    const format = FORMAT_OPTIONS.find((f) => f.value === file.settings.format);
    return format?.label || "PNG";
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3 relative">
      <div className="flex items-center gap-3">
        {/* PDF Icon */}

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

        {/* Settings Dropdown */}
        <div ref={settingsRef}>
          <SettingsToggleButton
            isOpen={isSettingsOpen}
            label={getCurrentFormatLabel()}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          />

          {/* Settings Panel */}
          {isSettingsOpen && (
            <>
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 origin-top-right ring-1 ring-black/5 dark:ring-white/5 min-w-full md:min-w-[15vw]"
                style={{
                  animation:
                    "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {/* Format Selection */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Format
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMAT_OPTIONS.map((format) => {
                      const isActive = file.settings.format === format.value;
                      return (
                        <button
                          key={format.value}
                          onClick={() => handleFormatChange(format.value)}
                          className={`
                            relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-200 cursor-pointer outline-none
                            ${
                              isActive
                                ? "border-transparent"
                                : "bg-transparent border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                          <span
                            className={`text-xs font-bold ${
                              isActive
                                ? "text-white"
                                : "text-zinc-700 dark:text-zinc-200"
                            }`}
                          >
                            {format.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DPI Selection */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Quality (DPI)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DPI_OPTIONS.map((dpi) => {
                      const isActive = file.settings.dpi === dpi.value;
                      return (
                        <button
                          key={dpi.value}
                          onClick={() => handleDpiChange(dpi.value)}
                          className={`
                            relative flex flex-col items-center justify-center py-2 px-1.5 rounded-lg border text-center transition-all duration-200 cursor-pointer outline-none
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
                          <span
                            className={`text-xs font-bold ${
                              isActive
                                ? "text-white"
                                : "text-zinc-700 dark:text-zinc-200"
                            }`}
                          >
                            {dpi.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 text-center px-1 font-medium">
                    {DPI_OPTIONS.find((d) => d.value === file.settings.dpi)
                      ?.desc || "Standard quality"}
                  </div>
                </div>

                {/* Page Range */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">
                    Page Range
                  </label>
                  <InputField
                    label=""
                    type="text"
                    value={file.settings.page_range || ""}
                    placeholder="e.g. 1-5, 8 (All pages if empty)"
                    onChange={handlePageRangeChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>
    </div>
  );
};
