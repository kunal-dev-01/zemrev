import { useState, useCallback } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { TOOL_CONFIGS } from "@/config/image.tool.config";
import GlassButton from "@/components/Layouts/GlassButton";
import { useImageMetadata } from "@/hooks/imageHooks/useImageMetadata.hook";

import MetadataViewer from "./MetadataViewer";
import { FileError, FileInfo } from "@/components/Shared/FileUI";
import {
  IconActionButton,
  ImageToolIconBadge,
} from "@/components/Shared/FileUITwo";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

const ImageMetadata = () => {
  const config = TOOL_CONFIGS.metadata;
  const isDark = useDarkMode();

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
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl md:p-6 p-3 md:mt-[1vw] mt-[1vh] fade-in ">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-900">
            <ImageToolIconBadge
              primaryColor={config.primaryColor}
              bgColor={config.dropzoneColor}
              bgColorDark={config.dropzoneColorDark}
              isDark={isDark}
            />
            <div className="flex-1 min-w-0 ml-2">
              <FileInfo name={file.name} size={file.size} />
            </div>

            <IconActionButton
              onClick={reset}
              disabled={extracting}
              label="Change"
            />
          </div>

          {/* Layout */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Settings/Info Panel */}
            <div className="space-y-5">
              {/* Error */}
              {error && <FileError error={error} className="mt-0" />}

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
                <MetadataViewer
                  extractedMetadata={metadataData}
                  reset={reset}
                />
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
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="object-contain"
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
