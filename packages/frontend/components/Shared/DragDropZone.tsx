// ===========================================================================
// FILE: src/components/Shared/DragDropZone.tsx
// PURPOSE: Drag-and-drop zone for file upload (Cleaned & Structured)
// ===========================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import {
  UploadSvg,
  LinkSvg,
  DropBox,
  GoogleDrive,
} from "@/components/Svg/ToolsSvg";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import type { ToolConfig } from "@/services/imageService/types";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

interface DragDropZoneProps {
  config: ToolConfig;
  onFilesSelected: (files: File[]) => void;
  onUrlUpload: () => void;
  onGooglePick: () => void;
  onDropboxPick: () => void;
  disabled?: boolean;
  currentFileCount: number;
}

export const DragDropZone = ({
  config,
  onFilesSelected,
  onUrlUpload,
  onGooglePick,
  onDropboxPick,
  disabled,
  currentFileCount,
}: DragDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const zoneRef = useRef<HTMLDivElement>(null);
  const isDark = useDarkMode();

  const remainingSlots = config.maxFiles - currentFileCount;

  // ----------------------------------------
  // Auto-hide errors
  // ----------------------------------------
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const triggerError = (msg: string) => setErrorMsg(msg);

  // ----------------------------------------
  // File validation helper
  // ----------------------------------------
  const validateFiles = (files: File[]) => {
    if (files.length > remainingSlots) {
      triggerError(`You can upload only ${config.maxFiles} files at a time.`);
      return false;
    }

    const valid = files.filter((file) =>
      config.acceptedFormats.includes(file.type)
    );

    if (valid.length === 0) {
      triggerError("Unsupported file format.");
      return false;
    }

    onFilesSelected(valid);
    return true;
  };

  // ----------------------------------------
  // Drag Handlers
  // ----------------------------------------
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

      validateFiles(Array.from(e.dataTransfer.files));
    },
    [disabled, validateFiles]
  );

  // ----------------------------------------
  // File Input Handler
  // ----------------------------------------
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateFiles(files);
    e.target.value = "";
  };

  // ----------------------------------------
  // UI Variables
  // ----------------------------------------
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

      {/* Main Content */}
      <div className="relative text-center flex flex-col items-center justify-center md:h-[15vw] h-[30vh]">
        {/* Error View */}
        {errorMsg ? (
          <div className="flex flex-col items-center gap-3">
            <ErrorSvg className="w-12 h-12 text-red-400 dark:text-red-500" />
            <p className="text-red-400 dark:text-red-500 font-medium text-lg">
              {errorMsg}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{ color: isDragging ? borderColor : undefined }}
              className={`w-12 h-12 mx-auto mb-4 transition-all duration-200 ${
                isDragging ? `animate-pulse` : ""
              }`}
            >
              <UploadSvg />
            </div>

            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-5 transition-all duration-200">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </h3>

            {remainingSlots > 0 && (
              <div className="flex items-center justify-center gap-3">
                {/* Select Files */}
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

                {/* Upload By URL */}
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

            {/* Cloud Providers */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={onGooglePick}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <div className="w-5 h-5">
                  <GoogleDrive />
                </div>
              </button>

              <button
                onClick={onDropboxPick}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <div className="w-5 h-5">
                  <DropBox />
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
