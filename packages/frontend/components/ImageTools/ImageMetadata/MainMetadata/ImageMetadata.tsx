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
          onGooglePick={setFromGoogleDrive}
          onDropboxPick={setFromDropbox}
          currentFileCount={0}
        />
      )}

      {/* Main metadata extraction UI */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm leading-none font-semibold truncate text-zinc-800 dark:text-zinc-200">
                {file.name}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Extract EXIF data and image properties
              </p>
            </div>

            <button
              onClick={reset}
              disabled={extracting}
              className="ml-3 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              <span className="md:block hidden text-sm">Change</span>
            </button>
          </div>

          {/* Layout */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Settings/Info Panel */}
            <div className="space-y-5">
              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
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

              {/* Metadata Results */}
              {metadataData && (
                <MetadataViewer extractedMetadata={metadataData} reset={reset} />
              )}
            </div>

            {/* RIGHT COLUMN: Image Preview */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
              <div className="mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Preview
                </span>
              </div>
              
              <div className="relative w-full aspect-video bg-zinc-950 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
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