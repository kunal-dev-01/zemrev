// ImageOptimizer/DynamicOptimizer/DynamicOptimizer.tsx

import { useState, useCallback } from "react";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { OptimizerFilePanel } from "../Settings/OptimizerFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS } from "@/config/image.tool.config";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageOptimizer } from "@/hooks/imageHooks/useImageOptimizer.hook";
import { ClearAllButton, FilesStatusSummary } from "@/components/Shared/FileUI";

interface DynamicOptimizerProps {
  slug: string;
}

// ============================================================================
// SLUG → DEFAULT SETTINGS
// ============================================================================
const getSettingsFromSlug = (slug: string) => {
  switch (slug) {
    case "remove-exif-data":
      return { stripExif: true, stripGps: false, fixOrientation: false };

    case "remove-gps-location":
      return { stripExif: false, stripGps: true, fixOrientation: false };

    case "fix-image-orientation":
      return { stripExif: false, stripGps: false, fixOrientation: true };

    case "strip-image-metadata":
      return { stripExif: true, stripGps: true, fixOrientation: false };

    case "optimize-jpg":
    case "optimize-png":
    case "optimize-webp":
      return { stripExif: true, stripGps: true, fixOrientation: true };

    default:
      return { stripExif: true, stripGps: true, fixOrientation: true };
  }
};

// ============================================================================
// COMPONENT
// ============================================================================
const DynamicOptimizer = ({ slug }: DynamicOptimizerProps) => {
  const config = TOOL_CONFIGS.optimizer;
  const defaultSettings = getSettingsFromSlug(slug);

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
  // FILE HANDLERS
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(
        newFiles,
        defaultSettings.stripExif,
        defaultSettings.stripGps,
        defaultSettings.fixOrientation
      );
    },
    [addFiles, defaultSettings]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(
        url,
        defaultSettings.stripExif,
        defaultSettings.stripGps,
        defaultSettings.fixOrientation
      );
    },
    [addFromUrl, defaultSettings]
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
        <div
          className="border border-zinc-200 dark:border-zinc-900 rounded-xl 
          md:p-6 p-3 md:mt-[1vw] mt-[1vh]"
        >
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

      {/* Completed Files */}
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

export default DynamicOptimizer;
