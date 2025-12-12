// ============================================================================
// FILE: ImageMetadata/MainMetadata/ImageMetadata.tsx
// ============================================================================

import { useState, useCallback } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { CopySvg, CheckSvg } from "@/components/Svg/CommonSvg";
import { useImageMetadata } from "@/hooks/imageHooks/useImageMetadata.hook";
import Image from "next/image";
import GlassButton from "@/components/Layouts/GlassButton";


type MetadataSectionData = Record<string, unknown>;


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
  const handleCopy = useCallback(
    (text: string) => {
      copyToClipboard(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    },
    [copyToClipboard]
  );

  // ============================================================================
  // RENDER METADATA SECTION
  // ============================================================================
  const renderMetadataSection = (
    title: string,
    data: MetadataSectionData
  ) => {
    const entries = Object.entries(data).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    );

    if (entries.length === 0) return null;

    return (
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/50">
        <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          {title}
        </h4>

        <div className="space-y-2">
          {entries.map(([key, value]) => {
            const displayValue =
              typeof value === "object"
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
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop */}
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
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-3 md:p-6 mt-[1vh] md:mt-[1vw]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>

              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                Extract EXIF data and image properties
              </p>
            </div>

            <button
              onClick={reset}
              disabled={extracting}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              <span className="md:block hidden">Change Image</span>
            </button>
          </div>

          {/* Image Preview */}
          <div className="relative w-full h-[40vh] dark:bg-zinc-900 bg-zinc-100 rounded-lg overflow-hidden mb-6">
            <Image src={imageUrl} alt="Preview" fill className="object-contain" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          {!metadataData && (
            <GlassButton
              loading={extracting}
              primaryColor={config.primaryColor}
              onClick={handleExtract}
            >
              {extracting ? "Extracting..." : "Extract Metadata"}
            </GlassButton>
          )}

          {/* Metadata Results */}
          {metadataData && (
            <div className="space-y-4">
              {renderMetadataSection("File Information", metadataData.metadata.file)}
              {renderMetadataSection("Image Properties", metadataData.metadata.image)}
              {renderMetadataSection("Technical Details", metadataData.metadata.technical)}
              {renderMetadataSection("Color Information", metadataData.metadata.color)}

              {metadataData.metadata.exif.has_exif &&
                renderMetadataSection("Camera Information", metadataData.metadata.exif.camera as MetadataSectionData )}

              {metadataData.metadata.exif.has_exif &&
                renderMetadataSection("Camera Settings", metadataData.metadata.exif.settings as MetadataSectionData)}

              {metadataData.metadata.exif.has_exif &&
                renderMetadataSection("GPS Location", metadataData.metadata.exif.location as MetadataSectionData)}

              {metadataData.metadata.exif.has_exif &&
                renderMetadataSection("Date & Time", metadataData.metadata.exif.datetime as MetadataSectionData)}

              {metadataData.metadata.exif.has_exif &&
                renderMetadataSection("Additional Info", metadataData.metadata.exif.other)}

              {/* Reset Button */}
              <button
                onClick={reset}
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
