// ============================================================================
// FILE: ImageMetadata/MainMetadata/ImageMetadata.tsx
// ============================================================================

import { useState, useCallback } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { TOOL_CONFIGS } from "@/config/image.tool.config";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import Image from "next/image";
import GlassButton from "@/components/Layouts/GlassButton";
import { useImageMetadata } from "@/hooks/imageHooks/useImageMetadata.hook";

import MetadataViewer from "./MetadataViewer";

const ImageMetadata = () => {
  const config = TOOL_CONFIGS.metadata;

  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    file,
    imageUrl,
    extracting,
    error,
    metadataData,
    setImageFile,
    setFromGoogleDrive,
    setFromDropbox,
    setFromUrl,
    extractImageMetadata,
    reset,
  } = useImageMetadata();

  // -----------------------------------------------
  // FILE HANDLING
  // -----------------------------------------------
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) setImageFile(files[0]);
    },
    [setImageFile]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await setFromUrl(url);
    },
    [setFromUrl]
  );

  // -----------------------------------------------
  // EXTRACT
  // -----------------------------------------------
  const handleExtract = useCallback(async () => {
    await extractImageMetadata();
  }, [extractImageMetadata]);

  // -----------------------------------------------
  // RENDER
  // -----------------------------------------------
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Upload UI */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          onGooglePick={() => setFromGoogleDrive}
          onDropboxPick={() => setFromDropbox}
          currentFileCount={0}
        />
      )}

      {/* Main metadata extraction UI */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-3 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
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
              <span className="hidden md:block">Change Image</span>
            </button>
          </div>

          {/* Preview */}
          <div className="relative w-full h-[40vh] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-6">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          <GlassButton
            loading={extracting}
            primaryColor={config.primaryColor}
            onClick={handleExtract}
          >
            {extracting ? "Extracting..." : "Extract Metadata"}
          </GlassButton>

          {/* Viewer of extracted metadata */}
          {metadataData && (
            <MetadataViewer extractedMetadata={metadataData} reset={reset} />
          )}
        </div>
      )}

      {/* Saved Metadata & Pending UI */}
      {!file && <MetadataViewer />}

      {/* URL Modal */}
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
