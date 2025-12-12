// ImageCropper/MainCropper/ImageCropper.tsx

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { RangeSlider } from "@/components/Shared/RangeSlider";

import { TOOL_CONFIGS } from "@/config/tool.config";

import {
  FreeformSvg,
  SquareSvg,
  LandscapeSvg,
  PortraitSvg,
  RotateSvg,
} from "@/components/Svg/ToolsSvg";

import GlassButton from "@/components/Layouts/GlassButton";
import { useImageCropper } from "@/hooks/imageHooks/useImageCropper.hook";

// ============================================================================
// CONSTANTS
// ============================================================================

const ASPECT_RATIOS = [
  { label: "Free", value: null, icon: <FreeformSvg /> },
  { label: "1:1", value: 1, icon: <SquareSvg /> },
  { label: "4:3", value: 4 / 3, icon: <LandscapeSvg /> },
  { label: "16:9", value: 16 / 9, icon: <LandscapeSvg /> },
  { label: "3:4", value: 3 / 4, icon: <PortraitSvg /> },
  { label: "9:16", value: 9 / 16, icon: <PortraitSvg /> },
];

const ZOOM_PRESETS = [
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
  { label: "150%", value: 150 },
  { label: "200%", value: 200 },
];

// ============================================================================
// COMPONENT
// ============================================================================

const ImageCropper = () => {
  const config = TOOL_CONFIGS.cropper;

  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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
      if (files.length) {
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

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">

      {/* Upload Zone */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={0}
        />
      )}

      {/* Cropper UI */}
      {file && imageUrl && (
        <div
          className="border border-zinc-200 dark:border-zinc-800 
                     rounded-2xl bg-white/50 dark:bg-zinc-900/40 
                     p-4 md:p-6 mt-[1vh] md:mt-[1vw]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">

            <div className="flex-1 min-w-0">
              <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Drag to crop • Scroll to zoom
              </p>
            </div>

            <button
              onClick={reset}
              disabled={cropping}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700
             bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 
             hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 
              flex items-center gap-2 cursor-pointer"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              <span className="hidden md:block">Change Image</span>
            </button>
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Cropper Canvas */}
            <div className="flex-1 lg:w-[60%]">
              <div className="relative w-full h-[50vh] lg:h-[60vh] bg-zinc-900 rounded-xl overflow-hidden shadow-lg">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom / 100}
                  aspect={aspectRatio ?? undefined}
                  onCropChange={setCrop}
                  onZoomChange={(z) => setZoom(Math.round(z * 100))}
                  onCropComplete={onCropComplete}
                  objectFit="contain"
                  style={{
                    containerStyle: { backgroundColor: "#18181b", borderRadius: 12 },
                    mediaStyle: { transition: "transform 0.3s ease-in-out" },
                  }}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="lg:w-[40%] space-y-4">

              {/* Aspect Ratio */}
              <div>
                <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3 block">
                  Aspect Ratio
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isActive = aspectRatio === ratio.value;

                    return (
                      <button
                        key={ratio.label}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium 
                                    flex flex-col items-center gap-1.5 border transition-all cursor-pointer
                                    ${
                                      isActive
                                        ? "text-white border-transparent"
                                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                        style={{
                          backgroundColor: isActive ? config.primaryColor : undefined,
                        }}
                      >
                        <div className="w-5 h-5">{ratio.icon}</div>
                        <span className="text-xs font-bold">{ratio.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zoom Slider */}
              <RangeSlider
                label="Zoom Level"
                value={zoom}
                min={50}
                max={300}
                step={1}
                unit="%"
                color={config.primaryColor}
                onChange={setZoom}
                presets={ZOOM_PRESETS}
              />

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Crop Button */}
              <GlassButton
                loading={cropping}
                primaryColor={config.primaryColor}
                onClick={handleCrop}
              >
                {cropping ? "Cropping..." : "Crop Image"}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Completed Files */}
      <SessionFilesDisplay toolType="cropper" config={config} />

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

export default ImageCropper;
