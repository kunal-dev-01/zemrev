// ===========================================================================
// FILE: src/components/Shared/PdfDragDropZone.tsx
// PURPOSE: Drag-and-drop zone for PDF uploads (NO URL UPLOAD)
// ===========================================================================

import { useState, useCallback, useEffect, useRef } from "react";

import { UploadSvg, GoogleDrive, DropBox } from "@/components/Svg/ToolsSvg";
import { ErrorSvg } from "@/components/Svg/CommonSvg";

import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

import type { PdfToolConfig } from "@/services/pdfService/types";

interface PdfDragDropZoneProps {
  config: PdfToolConfig;
  onFilesSelected: (files: File[]) => void;
  onGooglePick: () => void;
  onDropboxPick: () => void;
  disabled?: boolean;
  currentFileCount: number;
}

const ENABLE_GOOGLE_DRIVE = false;
const ENABLE_DROPBOX = false;

export const PdfDragDropZone = ({
  config,
  onFilesSelected,
  onGooglePick,
  onDropboxPick,
  disabled,
  currentFileCount,
}: PdfDragDropZoneProps) => {
  const isDark = useDarkMode();

  const zoneRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const remainingSlots = config.maxFiles - currentFileCount;
  const MB = 1024 * 1024;

  // ============================================================================
  // AUTO-HIDE ERROR
  // ============================================================================
  useEffect(() => {
    if (!errorMsg) return;

    const timer = setTimeout(() => setErrorMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const triggerError = (msg: string) => setErrorMsg(msg);

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================
  const validateFiles = (files: File[]) => {
    if (files.length > remainingSlots) {
      triggerError(`You can upload only ${config.maxFiles} files at a time.`);
      return false;
    }

    const validFiles = files.filter((file) =>
      config.acceptedFormats.includes(file.type)
    );

    if (validFiles.length === 0) {
      triggerError("Unsupported file format. Please upload a PDF file.");
      return false;
    }

    const maxSizeBytes = config.maxSize * MB;

    const oversizedFile = validFiles.find((file) => file.size > maxSizeBytes);

    if (oversizedFile) {
      triggerError(
        `File size exceeds limit. Maximum allowed size is ${config.maxSize} MB.`
      );
      return false;
    }

    onFilesSelected(validFiles);
    return true;
  };

  // ============================================================================
  // DRAG EVENTS
  // ============================================================================
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

    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInside) setIsDragging(false);
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
    [disabled]
  );

  // ============================================================================
  // FILE INPUT
  // ============================================================================
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateFiles(files);
    e.target.value = "";
  };

  // ============================================================================
  // UI VARIABLES
  // ============================================================================
  const borderColor = config.primaryColor;
  const dragBackground = isDark
    ? config.dropzoneColorDark
    : config.dropzoneColor;

  // ============================================================================
  // RENDER
  // ============================================================================
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
      {/* Drag Overlay */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-200 pointer-events-none"
        style={{
          backgroundColor: isDragging ? dragBackground : "transparent",
          opacity: isDragging ? 1 : 0,
        }}
      />

      {/* Content */}
      <div className="relative text-center flex flex-col items-center justify-center md:h-[15vw] h-[30vh]">
        {/* Error */}
        {errorMsg ? (
          <div className="flex flex-col items-center gap-3">
            <ErrorSvg className="w-12 h-12 text-red-400 dark:text-red-500" />
            <p className="text-red-400 dark:text-red-500 font-medium text-lg">
              {errorMsg}
            </p>
          </div>
        ) : (
          <>
            {/* Upload Icon */}
            <div
              style={{ color: isDragging ? borderColor : undefined }}
              className={`w-12 h-12 mx-auto mb-4 transition-all duration-200 ${
                isDragging ? "animate-pulse" : ""
              }`}
            >
              <UploadSvg />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-5">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </h3>

            {/* Select Files */}
            {remainingSlots > 0 && (
              <label
                htmlFor="pdf-file-input"
                className="md:px-6 px-8 py-2 text-md rounded-xl font-medium text-white hover:opacity-90 transition-all cursor-pointer"
                style={{ backgroundColor: borderColor }}
              >
                Select Files
                <input
                  id="pdf-file-input"
                  type="file"
                  multiple={config.maxFiles > 1}
                  accept={config.acceptedFormats.join(",")}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            )}

            {/* Cloud Providers */}
            {(ENABLE_GOOGLE_DRIVE || ENABLE_DROPBOX) && (
              <div className="flex items-center justify-center gap-3 mt-4">
                {ENABLE_GOOGLE_DRIVE && (
                  <button
                    onClick={onGooglePick}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Upload from Google Drive"
                  >
                    <div className="w-5 h-5">
                      <GoogleDrive />
                    </div>
                  </button>
                )}

                {ENABLE_DROPBOX && (
                  <button
                    onClick={onDropboxPick}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Upload from Dropbox"
                  >
                    <div className="w-5 h-5">
                      <DropBox />
                    </div>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
