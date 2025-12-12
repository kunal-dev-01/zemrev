// ImageResizer/DynamicResizer/DynamicResizer.tsx

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
const getDisplayLabel = (slug: string, dims: { width: number; height: number }) => {
  if (slug.includes("instagram")) return "Instagram (1080×1080)";
  if (slug.includes("facebook")) return "Facebook (1200×630)";
  if (slug.includes("twitter")) return "Twitter (1200×675)";
  if (slug.includes("percentage")) return "Percentage Resize";
  return `${dims.width}×${dims.height}`;
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

  const canResize = stats.pending > 0 && !resizing;
  const canAddMore = files.length < config.maxFiles;
  const displayText = getDisplayLabel(slug, dimensions);

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
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files */}
      {files.length > 0 && (
        <div
          className="border border-zinc-200 dark:border-zinc-800 rounded-xl 
                     bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 
                     mt-[1vh] md:mt-[1vw]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">

            {/* Status text */}
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl 
                         bg-zinc-50 dark:bg-zinc-900 
                         border border-zinc-200 dark:border-zinc-800"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Resizing to {displayText}
                {stats.pending > 0 && ` • ${stats.pending} pending`}
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
