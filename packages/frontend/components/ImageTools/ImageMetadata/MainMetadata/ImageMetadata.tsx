// ============================================================================
// FILE: ImageMetadata/MainMetadata/ImageMetadata.tsx
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { CopySvg, CheckSvg } from "@/components/Svg/CommonSvg";
import { useImageMetadata } from "@/hooks/imageHooks/useImageMetadata.hook";
import Image from "next/image";

const ImageMetadata = () => {
  const config = TOOL_CONFIGS.metadata;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const {
    file,
    imageUrl,
    extracting,
    error,
    metadataData,
    setImageFile,
    setFromUrl,
    extractImageMetadata,
    copyToClipboard,
    reset,
  } = useImageMetadata();

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setImageFile(files[0]);
      }
    },
    [setImageFile]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await setFromUrl(url);
    },
    [setFromUrl]
  );

  // ============================================================================
  // EXTRACT METADATA
  // ============================================================================
  const handleExtract = useCallback(async () => {
    await extractImageMetadata();
  }, [extractImageMetadata]);

  // ============================================================================
  // COPY TEXT
  // ============================================================================
  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  }, [copyToClipboard]);

  // ============================================================================
  // RENDER METADATA SECTION
  // ============================================================================
  const renderMetadataSection = (title: string, data: Record<string, any>) => {
    const hasData = Object.keys(data).length > 0 && Object.values(data).some(v => v !== null && v !== undefined && v !== "");

    if (!hasData) return null;

    return (
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800/50">
        <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          {title}
        </h4>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            if (value === null || value === undefined || value === "") return null;

            const displayValue = typeof value === "object" 
              ? JSON.stringify(value, null, 2) 
              : String(value);

            return (
              <div
                key={key}
                className="flex justify-between items-start py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0"
              >
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                  {key.replace(/_/g, " ")}:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200 font-mono text-right max-w-xs truncate">
                    {displayValue}
                  </span>
                  <button
                    onClick={() => handleCopy(displayValue)}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all shrink-0"
                    title="Copy"
                  >
                    {copiedText === displayValue ? (
                      <CheckSvg className="w-4 h-4 text-green-600" />
                    ) : (
                      <CopySvg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop (shown when no file) */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={0}
        />
      )}

      {/* Metadata Interface */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {file.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Extract EXIF data and image properties
              </p>
            </div>

            <button
              onClick={reset}
              disabled={extracting}
              className="px-4 py-1.5 flex items-center gap-2 rounded-lg font-medium border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 disabled:opacity-50"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              Change Image
            </button>
          </div>

          {/* Image Preview */}
          <div className="relative w-full h-[40vh] bg-zinc-900 rounded-lg overflow-hidden mb-6">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          {!metadataData && (
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="w-full px-6 py-2 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              style={{ backgroundColor: config.primaryColor }}
            >
              {extracting ? (
                <>
                  <Spinner className="w-5 h-5 text-zinc-100" /> Extracting Metadata...
                </>
              ) : (
                "Extract Metadata"
              )}
            </button>
          )}

          {/* Metadata Results */}
          {metadataData && (
            <div className="space-y-4">
              {/* File Info */}
              {renderMetadataSection("File Information", metadataData.metadata.file)}

              {/* Image Properties */}
              {renderMetadataSection("Image Properties", metadataData.metadata.image)}

              {/* Technical Info */}
              {renderMetadataSection("Technical Details", metadataData.metadata.technical)}

              {/* Color Info */}
              {renderMetadataSection("Color Information", metadataData.metadata.color)}

              {/* EXIF Camera */}
              {metadataData.metadata.exif.has_exif && renderMetadataSection("Camera Information", metadataData.metadata.exif.camera)}

              {/* EXIF Settings */}
              {metadataData.metadata.exif.has_exif && renderMetadataSection("Camera Settings", metadataData.metadata.exif.settings)}

              {/* EXIF Location */}
              {metadataData.metadata.exif.has_exif && renderMetadataSection("GPS Location", metadataData.metadata.exif.location)}

              {/* EXIF DateTime */}
              {metadataData.metadata.exif.has_exif && renderMetadataSection("Date & Time", metadataData.metadata.exif.datetime)}

              {/* EXIF Other */}
              {metadataData.metadata.exif.has_exif && renderMetadataSection("Additional Info", metadataData.metadata.exif.other)}

              {/* Extract Again Button */}
              <button
                onClick={() => {
                  reset();
                }}
                className="w-full px-6 py-2 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: config.primaryColor }}
              >
                Extract From Another Image
              </button>
            </div>
          )}
        </div>
      )}

      {/* URL Upload Modal */}
      <UrlUploadModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onSubmit={handleUrlUpload}
        config={config}
      />
    </div>
  );
};

export default ImageMetadata;