// ============================================================================
// FILE: src/components/ImageTools/ImageConverter/ConverterDynamicTool.tsx
// PURPOSE: Single-file converter for dynamic routes
// ============================================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { useConvertImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { TOOL_CONFIGS, getOutputFilename } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import type { OutputFormat } from "@/services/imageService/types";
import { CheckSvg, DownloadSvg, ErrorSvg } from "@/components/Svg/CommonSvg";
import { RotateSvg, SettingsSvg } from "@/components/Svg/ToolsSvg";

interface ConverterDynamicToolProps {
  inputFormat: string;
  outputFormat: string;
  slug: string;
}

const ConverterDynamicTool = ({
  inputFormat,
  outputFormat,
  slug,
}: ConverterDynamicToolProps) => {
  const config = TOOL_CONFIGS.converter;
  
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75);
  const [converting, setConverting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState("");
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  const [convertImage] = useConvertImageMutation();

  const showQualitySlider = ["jpeg", "jpg", "webp", "avif"].includes(outputFormat);

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResultBlob(null);
      setError("");
    }
  }, []);

  const handleUrlUpload = useCallback(async (url: string) => {
    // Create fake file for URL
    const fakeFile = new File([], "url-image", { type: "image/jpeg" });
    setFile(fakeFile);
    setResultBlob(null);
    setError("");
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setResultBlob(null);
    setError("");
    setQuality(75);
  }, []);

  // ============================================================================
  // CONVERSION
  // ============================================================================

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setConverting(true);
    setError("");

    try {
      const blob = await convertImage({
        file,
        options: {
          format: outputFormat as OutputFormat,
          quality,
        },
      }).unwrap();

      const outputName = getOutputFilename(file.name, outputFormat);
      
      // Save to session storage
      await sessionStorageUtils.saveFile(blob, outputName, "converter");

      setResultBlob(blob);
      setResultName(outputName);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setConverting(false);
    }
  }, [file, outputFormat, quality, convertImage]);

  // ============================================================================
  // DOWNLOAD
  // ============================================================================

  const handleDownload = useCallback(() => {
    if (!resultBlob || !resultName) return;

    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [resultBlob, resultName]);

  // ============================================================================
  // AUTO-CONVERT ON FILE SELECT
  // ============================================================================

  useEffect(() => {
    if (file && !resultBlob) {
      handleConvert();
    }
  }, [file]); // eslint-disable-line

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop (shown when no file) */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFileSelect}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={0}
        />
      )}

      {/* File Processing Area */}
      {file && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          {/* File Info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {file.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Converting {inputFormat.toUpperCase()} → {outputFormat.toUpperCase()}
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-1.5 flex items-center gap-2 rounded-lg font-medium border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900"
            >
              <div className="w-5 h-5">
                <RotateSvg/>
              </div>
              Change File
            </button>
          </div>

          {/* Quality Settings */}
          {showQualitySlider && !resultBlob && (
            <div className="mb-6 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 text-zinc-600 dark:text-zinc-400">
                    <SettingsSvg/>
                </div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Quality: {quality}%
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                disabled={converting}
                className="w-full"
                style={{ accentColor: config.primaryColor }}
              />
            </div>
          )}

          {/* Converting State */}
          {converting && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6" style={{ color: config.primaryColor }}>
                <Spinner/>
              </div>
              <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                Converting your image...
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                This may take a few seconds
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="w-5 h-5 text-red-400 dark:text-red-500 shrink-0">
                <ErrorSvg/>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Conversion Failed
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {resultBlob && !converting && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg dark:bg-zinc-900 bg-zinc-50 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-emerald-400">
                  <CheckSvg/>
                </div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Conversion Successful!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  {resultName}
                </p>
                <button
                  onClick={handleDownload}
                  className="px-8 py-1.5 flex items-center gap-2 mx-auto rounded-lg font-semibold text-white text-lg "
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <div className="w-5 h-5">
                    <DownloadSvg/>
                  </div>
                  Download File
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 rounded-lg font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
              >
                Convert Another File
              </button>
            </div>
          )}
        </div>
      )}

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