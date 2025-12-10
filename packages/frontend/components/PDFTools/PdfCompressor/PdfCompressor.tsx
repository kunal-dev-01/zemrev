// ============================================================================
// FILE: src/components/PDFTools/PdfCompressor/PdfCompressor.tsx
// PURPOSE: PDF Compressor Component
// ============================================================================

"use client";

import { useCallback } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { Spinner } from "@/components/Layouts/Spinner";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import { usePdfCompressor } from "@/hooks/pdfHooks/usePdfCompressor.hook";

const PdfCompressor = () => {
  const config = PDF_TOOL_CONFIGS["pdf-compressor"];

  const {
    files,
    compressing,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    compressAllFiles,
    clearAll,
  } = usePdfCompressor();

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(newFiles, config.defaultSettings.level as string);
    },
    [addFiles, config]
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
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      {/* Drag Drop Zone */}
      <PdfDragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
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
              <div
                key={file.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900/60"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
                      {file.name}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 transition-all"
                  >
                    <TrashSvg className="w-5 h-5" />
                  </button>
                </div>

                {/* Compression Level Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Compression Level
                  </label>
                  <select
                    value={file.settings.level || "ebook"}
                    onChange={(e) =>
                      updateFileSettings(file.id, { level: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="screen">Screen (72 DPI) - Smallest</option>
                    <option value="ebook">eBook (150 DPI) - Recommended</option>
                    <option value="printer">Printer (300 DPI) - High Quality</option>
                    <option value="prepress">Prepress (300 DPI) - Highest</option>
                  </select>
                </div>
              </div>
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
                `Compress ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`
              )}
            </button>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="compress-pdf" config={config} />
    </div>
  );
};

export default PdfCompressor;