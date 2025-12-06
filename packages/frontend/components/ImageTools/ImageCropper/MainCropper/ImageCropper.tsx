// ImageCropper/MainCropper/ImageCropper.tsx

"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { CheckSvg } from "@/components/Svg/CommonSvg";
import { useImageCropper } from "@/hooks/imageHooks/useImageCropper.hook";

const ImageCropper = () => {
  const config = TOOL_CONFIGS.cropper;
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = free aspect

  const {
    file,
    imageUrl,
    cropping,
    error,
    setImageFile,
    setFromUrl,
    cropImageFile,
    reset,
  } = useImageCropper();

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setImageFile(files[0]);
        // Reset crop state
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
    },
    [setImageFile]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await setFromUrl(url);
      // Reset crop state
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    },
    [setFromUrl]
  );

  // ============================================================================
  // CROP HANDLING
  // ============================================================================
  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;

    await cropImageFile({
      x: Math.round(croppedAreaPixels.x),
      y: Math.round(croppedAreaPixels.y),
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    });
  }, [croppedAreaPixels, cropImageFile]);

  // Aspect ratio presets
  const aspectRatios = [
    { label: "Free", value: null },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "3:4", value: 3 / 4 },
    { label: "9:16", value: 9 / 16 },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop (shown when no file) */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={0}
        />
      )}

      {/* Cropper Interface */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {file.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Drag to crop • Scroll to zoom
              </p>
            </div>

            <button
              onClick={reset}
              disabled={cropping}
              className="px-4 py-1.5 flex items-center gap-2 rounded-lg font-medium border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 disabled:opacity-50"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              Change Image
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    aspectRatio === ratio.value
                      ? "text-white"
                      : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      aspectRatio === ratio.value ? config.primaryColor : undefined,
                  }}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cropper Canvas */}
          <div className="relative w-full h-[50vh] bg-zinc-900 rounded-lg overflow-hidden mb-4">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio || undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  backgroundColor: "#18181b",
                },
              }}
            />
          </div>

          {/* Zoom Control */}
          <div className="mb-6">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: config.primaryColor }}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Crop Button */}
          <button
            onClick={handleCrop}
            disabled={cropping}
            className="w-full px-6 py-2 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: config.primaryColor }}
          >
            {cropping ? (
              <>
                <Spinner className="w-5 h-5 text-zinc-100" /> Cropping...
              </>
            ) : (
              <>
                Crop Image
              </>
            )}
          </button>
        </div>
      )}

      {/* Session Files Display (Completed) */}
      <SessionFilesDisplay toolType="cropper" config={config} />

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

export default ImageCropper;