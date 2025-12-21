// imageConverter/MainConverter/ImageConverter.tsx

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { ConverterFilePanel } from "../Settings/ConverterFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import {
  TOOL_CONFIGS,
  detectFormatFromFilename,
} from "@/config/image.tool.config";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageConverter } from "@/hooks/imageHooks/useImageConverter.hook";
import type { OutputFormat } from "@/services/imageService/types";
import { ClearAllButton, FilesStatusSummary } from "@/components/Shared/FileUI";

const ImageConverter = () => {
  const router = useRouter();
  const config = TOOL_CONFIGS.converter;

  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    converting,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    addFromUrl,
    removeFile,
    updateFileSettings,
    convertAllFiles,
    clearAll,
  } = useImageConverter();

  // ============================================================================
  // FILE HANDLING WITH SMART REDIRECT
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      // Save to pending storage
      await addFiles(
        newFiles,
        config.defaultSettings.format as OutputFormat,
        config.defaultSettings.quality as number
      );

      // Detect unique formats
      const formats = newFiles.map((f) => detectFormatFromFilename(f.name));
      const uniqueFormats = [...new Set(formats.filter(Boolean))];

      // Smart redirect (only if one input format & <=5 files)
      if (uniqueFormats.length === 1 && newFiles.length <= 5) {
        const inputFormat = uniqueFormats[0];
        let outputFormat = config.defaultSettings.format as string;

        // Avoid same-format redirects (webp→webp)
        if (inputFormat === outputFormat) {
          outputFormat = inputFormat === "webp" ? "jpg" : "png";
        }

        router.push(`/image/image-converter/${inputFormat}-to-${outputFormat}`);
        return;
      }
    },
    [addFiles, config, router]
  );

  // URL upload handler
  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(
        url,
        config.defaultSettings.format as OutputFormat,
        config.defaultSettings.quality as number
      );
    },
    [addFromUrl, config]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full mt-[1vh] md:mt-[1vw]">
      {/* Drag & Drop */}
      <DragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onUrlUpload={() => setUrlModalOpen(true)}
        onGooglePick={() =>
          addFromGoogleDrive(
            config.defaultSettings.format as OutputFormat,
            config.defaultSettings.quality as number
          )
        }
        onDropboxPick={() =>
          addFromDropbox(
            config.defaultSettings.format as OutputFormat,
            config.defaultSettings.quality as number
          )
        }
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl md:p-6 p-3 mt-[1vh] md:mt-[1vw]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {/* Status Box */}
            <FilesStatusSummary
              pending={stats.pending}
              processing={stats.processing}
              failed={stats.error}
            />

            <ClearAllButton onClick={clearAll} />
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file) => (
              <ConverterFilePanel
                key={file.id}
                file={file}
                config={config}
                onUpdateSettings={(settings) =>
                  updateFileSettings(file.id, settings)
                }
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </div>

          {/* Convert Button */}
          <GlassButton
            loading={converting}
            primaryColor={config.primaryColor}
            onClick={convertAllFiles}
          >
            {converting
              ? "Converting..."
              : `Convert ${stats.pending} File${
                  stats.pending !== 1 ? "s" : ""
                }`}
          </GlassButton>
        </div>
      )}

      {/* Completed Session Files */}
      <SessionFilesDisplay toolType="converter" config={config} />

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

export default ImageConverter;
