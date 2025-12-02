// ============================================================================
// FILE: src/components/ImageTools/ImageConverter/ImageConverter.tsx
// PURPOSE: Complete Image Converter with batch processing & session storage
// ============================================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { FileSettingsPanel } from "./FileSettingsPanel";
import { ConvertedFilesPanel } from "./ConvertedFilesPanel";
import { useConvertImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { TOOL_CONFIGS, detectFormatFromFilename, getOutputFilename } from "@/config/tool.config";
import type { ProcessedFile, OutputFormat } from "@/services/imageService/types";
import { Spinner } from "@/components/Layouts/Spinner";
import { DownloadSvg, PlusSvg, TrashSvg } from "@/components/Svg/CommonSvg";

const ImageConverter = () => {
  const router = useRouter();
  const config = TOOL_CONFIGS.converter;
  
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [convertImage] = useConvertImageMutation();
  const [converting, setConverting] = useState(false);

  // Load stored files on mount
  useEffect(() => {
    const stored = sessionStorageUtils.getFilesByTool("converter");
    console.log(`Loaded ${stored.length} stored files from session`);
  }, []);

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const addFiles = useCallback((newFiles: File[]) => {
    const processed: ProcessedFile[] = newFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      originalFile: file,
      name: file.name,
      size: file.size,
      type: file.type,
      settings: {
        format: config.defaultSettings.format as OutputFormat,
        quality: config.defaultSettings.quality,
      },
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...processed]);

    // If single file, redirect to dynamic page
    if (newFiles.length === 1 && files.length === 0) {
      const inputFormat = detectFormatFromFilename(newFiles[0].name);
      const outputFormat = config.defaultSettings.format;
      if (inputFormat && outputFormat) {
        router.push(`/image/image-converter/${inputFormat}-to-${outputFormat}`);
      }
    }
  }, [files.length, config, router]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileSettings = useCallback((id: string, settings: any) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f))
    );
  }, []);

  // ============================================================================
  // URL UPLOAD
  // ============================================================================

  const handleUrlUpload = useCallback(async (url: string) => {
    // Create fake file object for URL
    const fakeFile = new File([], "url-image", { type: "image/jpeg" });
    addFiles([fakeFile]);
  }, [addFiles]);

  // ============================================================================
  // CONVERSION LOGIC
  // ============================================================================

  const convertSingleFile = useCallback(async (file: ProcessedFile) => {
    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
      );

      const blob = await convertImage({
        file: file.originalFile,
        options: {
          format: file.settings.format!,
          quality: file.settings.quality!,
        },
      }).unwrap();

      const outputName = getOutputFilename(file.name, file.settings.format!);

      // Save to session storage
      await sessionStorageUtils.saveFile(blob, outputName, "converter");

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: "completed",
                resultBlob: blob,
                resultName: outputName,
              }
            : f
        )
      );
    } catch (error) {
      const errorMsg = extractApiErrorMessage(error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "error", error: errorMsg } : f
        )
      );
    }
  }, [convertImage]);

  const convertAllFiles = useCallback(async () => {
    setConverting(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await convertSingleFile(file);
    }

    setConverting(false);
  }, [files, convertSingleFile]);

  // ============================================================================
  // DOWNLOAD & CLEAR
  // ============================================================================

  const downloadFile = useCallback((file: ProcessedFile) => {
    if (!file.resultBlob || !file.resultName) return;

    const url = URL.createObjectURL(file.resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.resultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    files
      .filter((f) => f.status === "completed")
      .forEach((f, index) => {
        setTimeout(() => downloadFile(f), index * 500);
      });
  }, [files, downloadFile]);

  const clearAll = useCallback(() => {
    setFiles([]);
    sessionStorageUtils.clearAll();
  }, []);

  // ============================================================================
  // STATS
  // ============================================================================

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    completed: files.filter((f) => f.status === "completed").length,
    error: files.filter((f) => f.status === "error").length,
  };

  const canConvert = stats.pending > 0 && !converting;
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop Zone */}
      {files.length === 0 && (
        <DragDropZone
          config={config}
          onFilesSelected={addFiles}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={files.length}
        />
      )}

      {/* Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                Files ({stats.total}/{config.maxFiles})
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {stats.completed > 0 && `${stats.completed} converted`}
                {stats.pending > 0 && ` • ${stats.pending} pending`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canAddMore && (
                <button
                  onClick={() => setUrlModalOpen(true)}
                  className="px-4 py-2 rounded-lg font-medium border-2 transition-all"
                  style={{
                    borderColor: config.primaryColor,
                    color: config.primaryColor,
                  }}
                >
                  <div className="w-5 h-5 inline mr-2">
                    <PlusSvg />
                  </div>
                  Add More
                </button>
              )}

              {stats.completed > 0 && (
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <div className="w-5 h-5 inline mr-2">
                    <DownloadSvg />
                  </div>
                  Download All
                </button>
              )}

              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-lg font-medium border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <div className="w-5 h-5 inline mr-2">
                  <TrashSvg />
                </div>
                Clear All
              </button>
            </div>
          </div>

          {/* File List */}
          <div className="space-y-4">
            {files.map((file) => (
              <FileSettingsPanel
                key={file.id}
                file={file}
                config={config}
                onUpdateSettings={(settings) => updateFileSettings(file.id, settings)}
                onRemove={() => removeFile(file.id)}
                onDownload={() => downloadFile(file)}
              />
            ))}
          </div>

          {/* Convert Button */}
          {canConvert && (
            <button
              onClick={convertAllFiles}
              disabled={converting}
              className="w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: config.primaryColor }}
            >
              {converting ? (
                <>
                  <div className="w-5 h-5 ml-2">
                    <Spinner />
                  </div>
                  Converting...
                </>
              ) : (
                `Convert ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`
              )}
            </button>
          )}
        </div>
      )}

      {/* Converted Files */}
      <ConvertedFilesPanel config={config} />

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

export default ImageConverter;