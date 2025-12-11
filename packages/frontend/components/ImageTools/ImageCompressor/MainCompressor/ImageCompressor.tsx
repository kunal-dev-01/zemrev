// ImageCompressor/MainCompressor/ImageCompressor.tsx

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { CompressorFilePanel } from "../Settings/CompressorFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS, detectFormatFromFilename } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageCompressor } from "@/hooks/imageHooks/useImageCompressor.hook";

const ImageCompressor = () => {
  const router = useRouter();
  const config = TOOL_CONFIGS.compressor;

  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    compressing,
    stats,
    addFiles,
    addFromUrl,
    removeFile,
    updateFileSettings,
    compressAllFiles,
    clearAll,
  } = useImageCompressor();

  // ============================================================================
  // FILE HANDLING WITH SMART REDIRECT
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      // STEP 1: Always save to pending first
      await addFiles(newFiles, config.defaultSettings.quality as number);

      // STEP 2: Detect formats
      const formats = newFiles.map((f) => detectFormatFromFilename(f.name));
      const uniqueFormats = [...new Set(formats.filter(Boolean))];

      // STEP 3: Redirect after save if single format and small batch
      if (uniqueFormats.length === 1 && newFiles.length <= 5) {
        const format = uniqueFormats[0];
        if (format) {
          router.push(`/image/image-compressor/${format}-compressor`);
        }
      }
    },
    [addFiles, config, router]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(url, config.defaultSettings.quality as number);
    },
    [addFromUrl, config]
  );

  // ============================================================================
  // COMPUTED FLAGS
  // ============================================================================
  const canCompress = stats.pending > 0 && !compressing;
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop Zone */}
      <DragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onUrlUpload={() => setUrlModalOpen(true)}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {stats.pending > 0 && `${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
            </div>

            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
            </button>
          </div>

          {/* File List */}
          <div className="space-y-4">
            {files.map((file) => (
              <CompressorFilePanel
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

          {/* Compress All Button */}
          {canCompress && (
            <GlassButton
              loading={compressing}
              primaryColor={config.primaryColor}
              onClick={compressAllFiles}
            >
              {compressing
                ? "Compressing..."
                : `Compress ${stats.pending} File${
                    stats.pending !== 1 ? "s" : ""
                  }`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Completed Session Files */}
      <SessionFilesDisplay toolType="compressor" config={config} />

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

export default ImageCompressor;
