// ============================================================================
// FILE: src/components/Common/DragDropZone.tsx
// PURPOSE: Reusable drag & drop zone with customizable colors
// ============================================================================

"use client";

import { useCallback, useState } from "react";
import { UploadSvg, LinkSvg } from "@/components/Svg/ToolsSvg";
import type { ToolConfig } from "@/services/imageService/types";

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const remainingSlots = config.maxFiles - currentFileCount;

      if (files.length > remainingSlots) {
        alert(
          `Maximum ${config.maxFiles} files allowed. You can add ${remainingSlots} more.`
        );
        return;
      }

      const validFiles = files.filter((file) =>
        config.acceptedFormats.includes(file.type)
      );

      if (validFiles.length !== files.length) {
        alert("Some files were skipped due to unsupported format.");
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [disabled, config, currentFileCount, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const remainingSlots = config.maxFiles - currentFileCount;

      if (files.length > remainingSlots) {
        alert(
          `Maximum ${config.maxFiles} files allowed. You can add ${remainingSlots} more.`
        );
        return;
      }

      if (files.length > 0) {
        onFilesSelected(files);
      }

      e.target.value = "";
    },
    [config, currentFileCount, onFilesSelected]
  );

  const canAddMore = currentFileCount < config.maxFiles;
  const isDisabled = disabled || !canAddMore;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative rounded-xl border-2 border-dashed transition-all duration-300
        ${
          isDragging && !isDisabled
            ? `border-[${config.primaryColor}] bg-[${config.dropzoneColor}]`
            : "border-zinc-300 dark:border-zinc-700"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{
        borderColor:
          isDragging && !isDisabled ? config.primaryColor : undefined,
        backgroundColor:
          isDragging && !isDisabled ? config.dropzoneColor : undefined,
      }}
    >
      <div className="p-8 md:p-12 text-center">
        <div
          style={{
            color: isDragging && !isDisabled ? config.primaryColor : undefined,
          }}
          className="w-12 h-12 mx-auto mb-4 transition-colors"
        >
          <UploadSvg />
        </div>

        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          {isDragging && !isDisabled
            ? "Drop files here"
            : canAddMore
            ? "Drag & drop files here"
            : `Maximum ${config.maxFiles} files reached`}
        </h3>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          {canAddMore
            ? `${config.maxFiles - currentFileCount} slot${
                config.maxFiles - currentFileCount !== 1 ? "s" : ""
              } remaining`
            : "Remove files to add more"}
        </p>

        {canAddMore && (
          <div className="flex items-center justify-center gap-3">
            <label
              htmlFor="file-input"
              className="px-6 py-2.5 rounded-lg font-medium text-white transition-all cursor-pointer hover:opacity-90"
              style={{ backgroundColor: config.primaryColor }}
            >
              Select Files
              <input
                id="file-input"
                type="file"
                multiple={config.maxFiles > 1}
                accept={config.acceptedFormats.join(",")}
                onChange={handleFileInput}
                disabled={isDisabled}
                className="hidden"
              />
            </label>

            <button
              onClick={onUrlUpload}
              disabled={isDisabled}
              className="px-6 py-2 rounded-lg font-medium border-2 transition-all hover:opacity-90 flex items-center justify-center"
              style={{
                borderColor: config.primaryColor,
                color: config.primaryColor,
              }}
            >
              <div className="w-6 h-6 mr-2 text-zinc-300">
                <LinkSvg />
              </div>
              From URL
            </button>
          </div>
        )}
      </div>

      {!canAddMore && (
        <div className="absolute inset-0 bg-zinc-900/10 dark:bg-zinc-100/10 rounded-xl backdrop-blur-sm" />
      )}
    </div>
  );
};
