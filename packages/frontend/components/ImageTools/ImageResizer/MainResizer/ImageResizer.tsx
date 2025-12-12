// ImageResizer/MainResizer/ImageResizer.tsx

import { useState, useCallback } from "react";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { ResizerFilePanel } from "../Settings/ResizerFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS } from "@/config/tool.config";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageResizer } from "@/hooks/imageHooks/useImageResizer.hook";
import type { ResizeMode } from "@/services/imageService/types";

const ImageResizer = () => {
  const config = TOOL_CONFIGS.resizer;
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    resizing,
    stats,
    addFiles,
    addFromUrl,
    removeFile,
    updateFileSettings,
    resizeAllFiles,
    clearAll,
  } = useImageResizer();

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(
        newFiles,
        config.defaultSettings.width as number,
        config.defaultSettings.height as number,
        config.defaultSettings.mode as ResizeMode
      );
    },
    [addFiles, config]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(
        url,
        config.defaultSettings.width as number,
        config.defaultSettings.height as number,
        config.defaultSettings.mode as ResizeMode
      );
    },
    [addFromUrl, config]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const canResize = stats.pending > 0 && !resizing;
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
        <div
          className="border border-zinc-200 dark:border-zinc-800 rounded-xl 
                     bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 
                     mt-[1vh] md:mt-[1vw]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            
            {/* Status */}
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl 
                         bg-zinc-50 dark:bg-zinc-900 
                         border border-zinc-200 dark:border-zinc-800"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {stats.pending > 0 && `${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
            </div>

            {/* Clear All */}
            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-xl font-medium text-red-600 
                         bg-red-50 dark:bg-red-900/20 flex items-center gap-2 
                         hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="hidden md:block">Clear All</span>
            </button>
          </div>

          {/* File List */}
          <div className="space-y-4">
            {files.map((file) => (
              <ResizerFilePanel
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

          {/* Resize All Button */}
          {canResize && (
            <GlassButton
              loading={resizing}
              primaryColor={config.primaryColor}
              onClick={resizeAllFiles}
            >
              {resizing
                ? "Resizing..."
                : `Resize ${stats.pending} File${
                    stats.pending !== 1 ? "s" : ""
                  }`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Completed Files */}
      <SessionFilesDisplay toolType="resizer" config={config} />

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

export default ImageResizer;
