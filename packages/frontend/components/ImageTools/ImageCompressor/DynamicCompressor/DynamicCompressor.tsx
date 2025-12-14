// ImageCompressor/DynamicCompressor/DynamicCompressor.tsx

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { CompressorFilePanel } from "../Settings/CompressorFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS, detectFormatFromFilename } from "@/config/tool.config";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageCompressor } from "@/hooks/imageHooks/useImageCompressor.hook";

interface DynamicCompressorProps {
  format: string; // jpg, png, webp, gif
}

const DynamicCompressor = ({ format }: DynamicCompressorProps) => {
  const router = useRouter();
  const config = TOOL_CONFIGS.compressor;

  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    compressing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
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
      // 1️⃣ Save to pending first
      await addFiles(newFiles, config.defaultSettings.quality as number);

      // 2️⃣ Detect formats
      const formats = newFiles.map((f) => detectFormatFromFilename(f.name));
      const uniqueFormats = [...new Set(formats.filter(Boolean))];

      // 3️⃣ Smart Redirect
      // If mixed formats → redirect to main compressor
      if (uniqueFormats.length > 1) {
        router.push("/image/image-compressor");
        return;
      }

      // If uploaded format does not match expected dynamic format
      const uploadedFormat = uniqueFormats[0];
      if (uploadedFormat !== format) {
        router.push("/image/image-compressor");
        return;
      }

      // Otherwise stay here (dynamic compressor)
    },
    [addFiles, config, router, format]
  );

  // URL upload handler
  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(url, config.defaultSettings.quality as number);
    },
    [addFromUrl, config]
  );

  // ============================================================================
  // COMPUTED
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
        onGooglePick={ () => addFromGoogleDrive(config.defaultSettings.quality as number)}
        onDropboxPick={ () => addFromDropbox(config.defaultSettings.quality as number)}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 mt-[1vh] md:mt-[1vw]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {/* Status */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                Compressing {format.toUpperCase()} Images
                {stats.pending > 0 && ` • ${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
            </div>

            {/* Clear All */}
            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
            </button>
          </div>

          {/* Files List */}
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

export default DynamicCompressor;
