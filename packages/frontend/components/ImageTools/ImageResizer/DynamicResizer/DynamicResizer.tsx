// ImageResizer/DynamicResizer/DynamicResizer.tsx

import { useState, useCallback } from "react";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { ResizerFilePanel } from "../Settings/ResizerFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS } from "@/config/image.tool.config";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageResizer } from "@/hooks/imageHooks/useImageResizer.hook";
import type { ResizeMode } from "@/services/imageService/types";
import { ClearAllButton, FilesStatusSummary } from "@/components/Shared/FileUI";

interface DynamicResizerProps {
  slug: string;
}

// ============================================================================
// DIMENSION MAPPING
// ============================================================================

const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  "resize-image-to-200x200": { width: 200, height: 200 },
  "resize-image-to-500x500": { width: 500, height: 500 },
  "resize-image-to-1024x1024": { width: 1024, height: 1024 },
  "resize-image-to-1920x1080": { width: 1920, height: 1080 },

  // Social Media Sizes
  "resize-image-for-instagram": { width: 1080, height: 1080 },
  "resize-image-for-facebook": { width: 1200, height: 630 },
  "resize-image-for-twitter": { width: 1200, height: 675 },

  // Default fallback
  "resize-image-by-percentage": { width: 1920, height: 1080 },
};

// Helper → get dimensions safely
const getDimensions = (slug: string) =>
  DIMENSION_MAP[slug] || { width: 1920, height: 1080 };

// Display label
const getDisplayLabel = (
  slug: string,
  dims: { width: number; height: number }
) => {
  if (slug.includes("instagram")) return "Instagram (1080x1080)";
  if (slug.includes("facebook")) return "Facebook (1200x630)";
  if (slug.includes("twitter")) return "Twitter (1200x675)";
  if (slug.includes("percentage")) return "Percentage Resize";
  return `${dims.width}x${dims.height}`;
};

// ============================================================================
// COMPONENT
// ============================================================================

const DynamicResizer = ({ slug }: DynamicResizerProps) => {
  const config = TOOL_CONFIGS.resizer;
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const dimensions = getDimensions(slug);

  const {
    files,
    resizing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
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
      await addFiles(newFiles, dimensions.width, dimensions.height, "contain");
    },
    [addFiles, dimensions]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(url, dimensions.width, dimensions.height, "contain");
    },
    [addFromUrl, dimensions]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const canAddMore = files.length < config.maxFiles;

  const defaultWidth = Number(config.defaultSettings.width);
  const defaultHeight = Number(config.defaultSettings.height);
  const defaultMode = config.defaultSettings.mode as ResizeMode;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* DragDropZone */}
      <DragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onUrlUpload={() => setUrlModalOpen(true)}
        onGooglePick={() =>
          addFromGoogleDrive(defaultWidth, defaultHeight, defaultMode)
        }
        onDropboxPick={() =>
          addFromDropbox(defaultWidth, defaultHeight, defaultMode)
        }
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files */}
      {files.length > 0 && (
        <div
          className="border border-zinc-200 dark:border-zinc-900 rounded-xl 
         md:p-6 p-3 mt-[1vh] md:mt-[1vw]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            {/* Status text */}
            <FilesStatusSummary
              pending={stats.pending}
              processing={stats.processing}
              failed={stats.error}
            />
            {/* Clear All */}
           <ClearAllButton onClick={clearAll} />
          </div>

          {/* Files List */}
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
        </div>
      )}

      {/* Completed Files */}
      <SessionFilesDisplay toolType="resizer" config={config} />

      {/* URL Upload */}
      <UrlUploadModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onSubmit={handleUrlUpload}
        config={config}
      />
    </div>
  );
};

export default DynamicResizer;
