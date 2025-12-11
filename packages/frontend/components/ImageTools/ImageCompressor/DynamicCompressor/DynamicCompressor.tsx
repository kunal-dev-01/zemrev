// ImageCompressor/DynamicCompressor/DynamicCompressor.tsx

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { CompressorFilePanel } from "../Settings/CompressorFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { TOOL_CONFIGS, detectFormatFromFilename } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { TrashSvg } from "@/components/Svg/CommonSvg";
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
      // STEP 1️⃣ — Always save files to pending first
      await addFiles(newFiles, config.defaultSettings.quality as number);

      // STEP 2️⃣ — Detect formats
      const formats = newFiles.map((f) => detectFormatFromFilename(f.name));
      const uniqueFormats = [...new Set(formats.filter(Boolean))];

      // STEP 3️⃣ — Redirect logic AFTER saving files

      // 1. If mixed formats → Go to main compressor
      if (uniqueFormats.length > 1) {
        router.push("/image/image-compressor");
        return;
      }

      // 2. If uploaded format ≠ expected dynamic format → Go to main compressor
      const uploadedFormat = uniqueFormats[0];
      if (uploadedFormat !== format) {
        router.push("/image/image-compressor");
        return;
      }

      // NO redirect here — this is the dynamic compressor itself
    },
    [addFiles, config, router, format]
  );

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
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh] relative">

      <div
    className="absolute inset-0 -z-10 backdrop-blur-xl opacity-30"
    style={{
      background: `radial-gradient(circle at center, ${config.primaryColor}50 0%, transparent 70%)`,
    }}
  />
      {/* Always Show Drag Drop Zone */}
      <DragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onUrlUpload={() => setUrlModalOpen(true)}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                Compressing {format.toUpperCase()} Images
                {stats.pending > 0 && ` • ${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
            </div>

            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-full font-medium text-red-600 bg-red-50 dark:bg-red-900/40 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all"
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
            <button
              onClick={compressAllFiles}
              disabled={compressing}
              className="w-full mt-6 px-6 md:py-2 py-1.5 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              style={{ backgroundColor: config.primaryColor }}
            >
              {compressing ? (
                <>
                  <Spinner /> Compressing...
                </>
              ) : (
                `Compress ${stats.pending} File${
                  stats.pending !== 1 ? "s" : ""
                }`
              )}
            </button>
          )}
        </div>
      )}

      {/* Session Files Display (Completed) */}
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
