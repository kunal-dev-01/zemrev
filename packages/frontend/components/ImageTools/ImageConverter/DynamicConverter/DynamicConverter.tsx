// imageConverter/Dynamicconverter/DynamicConverter.tsx

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { ConverterFilePanel } from "../Settings/ConverterFilePanel";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";

import { TOOL_CONFIGS, detectFormatFromFilename } from "@/config/tool.config";

import { TrashSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";

import { useImageConverter } from "@/hooks/imageHooks/useImageConverter.hook";
import type { OutputFormat } from "@/services/imageService/types";

interface ConverterDynamicToolProps {
  inputFormat: string;
  outputFormat: string;
}

const ConverterDynamicTool = ({
  inputFormat,
  outputFormat,
}: ConverterDynamicToolProps) => {
  const router = useRouter();
  const config = TOOL_CONFIGS.converter;

  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const {
    files,
    converting,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    addFromUrl,
    removeFile,
    updateFileSettings,
    convertAllFiles,
    clearAll,
  } = useImageConverter();

  // ============================================================================
  // FILE HANDLING WITH SMART REDIRECT
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      // Save to pending first
      await addFiles(
        newFiles,
        outputFormat as OutputFormat,
        config.defaultSettings.quality as number
      );

      // Detect unique formats
      const formats = newFiles.map((f) => detectFormatFromFilename(f.name));
      const uniqueFormats = [...new Set(formats.filter(Boolean))];

      // Mixed formats → send to main converter
      if (uniqueFormats.length > 1) {
        router.push("/image/image-converter");
        return;
      }

      // Uploaded format mismatch → send to main converter
      const uploadedFormat = uniqueFormats[0];
      if (uploadedFormat !== inputFormat) {
        router.push("/image/image-converter");
        return;
      }

      // Check consistency of output format with existing files
      const existingOutputs = files.map((f) => f.settings.format);
      const uniqueOutputs = [
        ...new Set([...existingOutputs, outputFormat]),
      ];

      if (uniqueOutputs.length > 1) {
        router.push("/image/image-converter");
        return;
      }

      // No redirect here — allowed
    },
    [addFiles, config, router, inputFormat, outputFormat, files]
  );

  // URL upload handler
  const handleUrlUpload = useCallback(
    async (url: string) => {
      await addFromUrl(
        url,
        outputFormat as OutputFormat,
        config.defaultSettings.quality as number
      );
    },
    [addFromUrl, outputFormat, config]
  );

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const canConvert = stats.pending > 0 && !converting;
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
        onGooglePick={() => addFromGoogleDrive(config.defaultSettings.format as OutputFormat , config.defaultSettings.quality as number)}
        onDropboxPick={() => addFromDropbox(config.defaultSettings.format as OutputFormat, config.defaultSettings.quality as number)}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 mt-[1vh] md:mt-[1vw]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400 select-none">
                Converting {inputFormat.toUpperCase()} →{" "}
                {outputFormat.toUpperCase()}
                {stats.pending > 0 && ` • ${stats.pending} pending`}
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
              <ConverterFilePanel
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

          {/* Convert All Button */}
          {canConvert && (
            <GlassButton
              loading={converting}
              primaryColor={config.primaryColor}
              onClick={convertAllFiles}
            >
              {converting
                ? "Converting..."
                : `Convert ${stats.pending} File${
                    stats.pending !== 1 ? "s" : ""
                  }`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Completed Files */}
      <SessionFilesDisplay toolType="converter" config={config} />

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

export default ConverterDynamicTool;
