// ============================================================================
// FILE: src/components/ImageTools/ImageCompressor/ImageCompressor.tsx
// PURPOSE: Complete Image Compressor with batch processing
// ============================================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropZone } from "";
import { UrlUploadModal } from "@/components/Common/UrlUploadModal";
import { CompressorFileSettingsPanel } from "./CompressorFileSettingsPanel";
import { ConvertedFilesPanel } from "@/components/ImageTools/ImageConverter/ConvertedFilesPanel";
import { useCompressImageMutation } from "@/services/image.service";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { TOOL_CONFIGS, detectFormatFromFilename } from "@/config/toolConfigs";
import type { ProcessedFile } from "@/types/imageTools.types";
import { Loader2, Download, Trash2, Plus } from "lucide-react";

const ImageCompressor = () => {
  const router = useRouter();
  const config = TOOL_CONFIGS.compressor;
  
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [compressImage] = useCompressImageMutation();
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    const stored = sessionStorageUtils.getFilesByTool("compressor");
    console.log(`Loaded ${stored.length} stored files from session`);
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const processed: ProcessedFile[] = newFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      originalFile: file,
      name: file.name,
      size: file.size,
      type: file.type,
      settings: {
        quality: config.defaultSettings.quality,
      },
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...processed]);

    // If single file, redirect to dynamic page
    if (newFiles.length === 1 && files.length === 0) {
      const format = detectFormatFromFilename(newFiles[0].name);
      if (format) {
        router.push(`/image/image-compressor/${format}-compressor`);
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

  const handleUrlUpload = useCallback(async (url: string) => {
    const fakeFile = new File([], "url-image", { type: "image/jpeg" });
    addFiles([fakeFile]);
  }, [addFiles]);

  const compressSingleFile = useCallback(async (file: ProcessedFile) => {
    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
      );

      const blob = await compressImage({
        file: file.originalFile,
        options: {
          quality: file.settings.quality!,
        },
      }).unwrap();

      await sessionStorageUtils.saveFile(blob, file.name, "compressor");

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: "completed",
                resultBlob: blob,
                resultName: file.name,
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
  }, [compressImage]);

  const compressAllFiles = useCallback(async () => {
    setCompressing(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await compressSingleFile(file);
    }

    setCompressing(false);
  }, [files, compressSingleFile]);

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

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    completed: files.filter((f) => f.status === "completed").length,
    error: files.filter((f) => f.status === "error").length,
  };

  const canCompress = stats.pending > 0 && !compressing;
  const canAddMore = files.length < config.maxFiles;

  return (
    <div className="w-full space-y-6 mt-6">
      {files.length === 0 && (
        <DragDropZone
          config={config}
          onFilesSelected={addFiles}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={files.length}
        />
      )}

      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                Files ({stats.total}/{config.maxFiles})
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {stats.completed > 0 && `${stats.completed} compressed`}
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
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add More
                </button>
              )}

              {stats.completed > 0 && (
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download All
                </button>
              )}

              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-lg font-medium border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {files.map((file) => (
              <CompressorFileSettingsPanel
                key={file.id}
                file={file}
                config={config}
                onUpdateSettings={(settings) => updateFileSettings(file.id, settings)}
                onRemove={() => removeFile(file.id)}
                onDownload={() => downloadFile(file)}
              />
            ))}
          </div>

          {canCompress && (
            <button
              onClick={compressAllFiles}
              disabled={compressing}
              className="w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: config.primaryColor }}
            >
              {compressing ? (
                <>
                  <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                  Compressing...
                </>
              ) : (
                `Compress ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`
              )}
            </button>
          )}
        </div>
      )}

      <ConvertedFilesPanel config={config} />

      <UrlUploadModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onSubmit={handleUrlUpload}
        config={config}
      />
    </div>
  );
};

export default ImageCompressor;