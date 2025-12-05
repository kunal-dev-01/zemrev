// ImageOptimizer/MainOptimizer/ImageOptimizer.tsx

"use client";

import { useState, useCallback } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { OptimizerFilePanel } from "../Settings/OptimizerFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import { useImageOptimizer } from "@/hooks/imageHooks/useImageOptimizer.hook";

const ImageOptimizer = () => {
  const config = TOOL_CONFIGS.optimizer;
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    optimizing,
    stats,
    addFiles,
    addFromUrl,
    removeFile,
    updateFileSettings,
    optimizeAllFiles,
    clearAll,
    downloadFile,
  } = useImageOptimizer();

  // ============================================================================
  // FILE HANDLING (No redirect needed for optimizer - all files same flow)
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(
        newFiles,
        config.defaultSettings.stripExif as boolean,
        config.defaultSettings.stripGps as boolean,
        config.defaultSettings.fixOrientation as boolean
      );
    },
    [addFiles, config]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(
        url,
        config.defaultSettings.stripExif as boolean,
        config.defaultSettings.stripGps as boolean,
        config.defaultSettings.fixOrientation as boolean
      );
    },
    [addFromUrl, config]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const canOptimize = stats.pending > 0 && !optimizing;
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
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
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {stats.pending > 0 && `${stats.pending} pending`}
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
              <OptimizerFilePanel
                key={file.id}
                file={file}
                config={config}
                onUpdateSettings={(settings) => updateFileSettings(file.id, settings)}
                onRemove={() => removeFile(file.id)}              />
            ))}
          </div>

          {/* Optimize All Button */}
          {canOptimize && (
            <button
              onClick={optimizeAllFiles}
              disabled={optimizing}
              className="w-full mt-6 px-6 md:py-2 py-1.5 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              style={{ backgroundColor: config.primaryColor }}
            >
              {optimizing ? (
                <>
                  <Spinner /> Optimizing...
                </>
              ) : (
                `Optimize ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`
              )}
            </button>
          )}
        </div>
      )}

      {/* Session Files Display (Completed) */}
      <SessionFilesDisplay toolType="optimizer" config={config} />

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

export default ImageOptimizer;