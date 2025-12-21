// ImageOptimizer/MainOptimizer/ImageOptimizer.tsx

import { useState, useCallback } from "react";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { OptimizerFilePanel } from "../Settings/OptimizerFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS } from "@/config/image.tool.config";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageOptimizer } from "@/hooks/imageHooks/useImageOptimizer.hook";
import { ClearAllButton, FilesStatusSummary } from "@/components/Shared/FileUI";

const ImageOptimizer = () => {
  const config = TOOL_CONFIGS.optimizer;
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    optimizing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    addFromUrl,
    removeFile,
    updateFileSettings,
    optimizeAllFiles,
    clearAll,
  } = useImageOptimizer();

  // ============================================================================
  // FILE HANDLING (Optimizer does not redirect)
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
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop */}
      <DragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onUrlUpload={() => setUrlModalOpen(true)}
        onGooglePick={() =>
          addFromGoogleDrive(
            config.defaultSettings.stripExif as boolean,
            config.defaultSettings.stripGps as boolean,
            config.defaultSettings.fixOrientation as boolean
          )
        }
        onDropboxPick={() =>
          addFromDropbox(
            config.defaultSettings.stripExif as boolean,
            config.defaultSettings.stripGps as boolean,
            config.defaultSettings.fixOrientation as boolean
          )
        }
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-xl md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
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
              <OptimizerFilePanel
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

          {/* Optimize Button */}
          <GlassButton
            loading={optimizing}
            primaryColor={config.primaryColor}
            onClick={optimizeAllFiles}
          >
            {optimizing
              ? "Optimizing..."
              : `Optimize ${stats.pending} File${
                  stats.pending !== 1 ? "s" : ""
                }`}
          </GlassButton>
        </div>
      )}

      {/* Completed Session Files */}
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
