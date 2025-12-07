// ImageCropper/MainCropper/ImageCropper.tsx

"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { useImageCropper } from "@/hooks/imageHooks/useImageCropper.hook";

const ImageCropper = () => {
  const config = TOOL_CONFIGS.cropper;
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100); // Changed to percentage (100 = 1x)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

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
        setCrop({ x: 0, y: 0 });
        setZoom(100);
      }
    },
    [setImageFile]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await setFromUrl(url);
      setCrop({ x: 0, y: 0 });
      setZoom(100);
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

  // Zoom presets
  const zoomPresets = [
    { label: "50%", value: 50 },
    { label: "75%", value: 75 },
    { label: "100%", value: 100 },
    { label: "150%", value: 150 },
    { label: "200%", value: 200 },
  ];
  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop */}
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
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Drag to crop • Scroll to zoom
              </p>
            </div>

            <button
              onClick={reset}
              disabled={cropping}
              className="ml-4 px-4 py-2 flex items-center gap-2 rounded-lg font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-all"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              <span className="md:block hidden">Change Image</span>
            </button>
          </div>

          {/* Aspect Ratio Selector - Professional */}
          <div className="mb-6">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 block">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    aspectRatio === ratio.value
                      ? "text-white shadow-md"
                      : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
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
          <div className="relative w-full h-[50vh] bg-zinc-900 rounded-lg overflow-hidden mb-6">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom / 100} // Convert back to 1-3 scale
              aspect={aspectRatio || undefined}
              onCropChange={setCrop}
              onZoomChange={(z) => setZoom(Math.round(z * 100))} // Convert to percentage
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  backgroundColor: "#18181b",
                },
              }}
            />
          </div>

          {/* Zoom Control - Professional Slider with Presets */}
          <RangeSlider
            label="Zoom Level"
            value={zoom}
            min={50}
            max={300}
            step={1}
            unit="%"
            color={config.primaryColor}
            onChange={setZoom}
            presets={zoomPresets}
            className="mb-6"
          />

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Crop Button - Professional */}
          <button
            onClick={handleCrop}
            disabled={cropping}
            className="w-full px-6 py-3 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3 hover:shadow-lg"
            style={{ backgroundColor: config.primaryColor }}
          >
            {cropping ? (
              <>
                <Spinner className="w-5 h-5 text-white" />
                <span>Cropping...</span>
              </>
            ) : (
              <>
                Crop Image
              </>
            )}
          </button>
        </div>
      )}

      {/* Session Files Display */}
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