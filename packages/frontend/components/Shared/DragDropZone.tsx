"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UploadSvg, LinkSvg} from "@/components/Svg/ToolsSvg";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import type { ToolConfig } from "@/services/imageService/types";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

interface DragDropZoneProps {
  config: ToolConfig;
  onFilesSelected: (files: File[]) => void;
  onUrlUpload: () => void;
  disabled?: boolean;
  currentFileCount: number;
}

export const DragDropZone = ({
  config,
  onFilesSelected,
  onUrlUpload,
  disabled,
  currentFileCount,
}: DragDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const zoneRef = useRef<HTMLDivElement>(null);
  const isDark = useDarkMode();

  // Auto-hide error message (3 sec)
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
  };

  // Drag events
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!inside) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const remaining = config.maxFiles - currentFileCount;

      if (files.length > remaining) {
        triggerError(`You can upload only ${config.maxFiles} files at a time.`);
        return;
      }

      const valid = files.filter((f) =>
        config.acceptedFormats.includes(f.type)
      );

      if (valid.length === 0) {
        triggerError("Unsupported file format.");
        return;
      }

      onFilesSelected(valid);
    },
    [disabled, config, currentFileCount, onFilesSelected]
  );

  // File input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = config.maxFiles - currentFileCount;

    if (files.length > remaining) {
      triggerError(`You can upload only ${config.maxFiles} files at a time.`);
      return;
    }

    if (files.length > 0) onFilesSelected(files);
    e.target.value = "";
  };

  const borderColor = config.primaryColor;
  const dragBG = isDark ? config.dropzoneColorDark : config.dropzoneColor;

  return (
    <div
      ref={zoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed transition-all duration-300
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{ borderColor }}
    >
      {/* Drag highlight */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-200 pointer-events-none"
        style={{
          backgroundColor: isDragging ? dragBG : "transparent",
          opacity: isDragging ? 1 : 0,
        }}
      />

      {/* ==== MAIN AREA (Error OR Upload UI) ==== */}
      <div className="relative py-6 md:py-12 text-center flex flex-col items-center justify-center min-h-[220px]">

        {/* ERROR VIEW */}
        {errorMsg ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 text-red-400 dark:text-red-500">
              <ErrorSvg />
            </div>

            <p className="text-red-400 dark:text-red-500 font-medium text-lg">{errorMsg}</p>
          </div>
        ) : (
          <>
            {/* Upload Icon */}
            <div
              className="w-12 h-12 mx-auto mb-4 transition-all"
              style={{ color: isDragging ? borderColor : undefined }}
            >
              <UploadSvg />
            </div>

            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              {config.maxFiles - currentFileCount} slots remaining
            </p>

            {currentFileCount < config.maxFiles && (
              <div className="flex items-center justify-center gap-3">
                <label
                  htmlFor="file-input"
                  className="md:px-6 px-5 py-2 text-md rounded-lg font-medium text-white hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: borderColor }}
                >
                  Select Files
                  <input
                    id="file-input"
                    type="file"
                    multiple={config.maxFiles > 1}
                    accept={config.acceptedFormats.join(",")}
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={onUrlUpload}
                  className="md:px-6 px-5 py-1.5 text-md rounded-lg font-medium border-2 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                  style={{ borderColor, color: borderColor }}
                >
                  <div className="w-6 h-6">
                    <LinkSvg />
                  </div>
                  From URL
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
