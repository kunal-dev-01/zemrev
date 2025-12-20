// ImageCropper.tsx – fully typed, zero `any`

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { RangeSlider } from "@/components/Shared/RangeSlider";

import { TOOL_CONFIGS } from "@/config/image.tool.config";

import {
  FreeformSvg,
  SquareSvg,
  LandscapeSvg,
  PortraitSvg,
} from "@/components/Svg/ToolsSvg";

import GlassButton from "@/components/Layouts/GlassButton";
import { useImageCropper } from "@/hooks/imageHooks/useImageCropper.hook";
import { FileError, FileInfo } from "@/components/Shared/FileUI";
import {
  IconActionButton,
  ImageToolIconBadge,
} from "@/components/Shared/FileUITwo";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const ImageCropper = () => {
  const config = TOOL_CONFIGS.cropper;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const isDark = useDarkMode();

  const {
    file,
    imageUrl,
    cropping,
    error,
    setImageFile,
    setFromGoogleDrive,
    setFromDropbox,
    setFromUrl,
    cropImageFile,
    reset,
  } = useImageCropper();

  /* -------------------------------- HANDLERS ------------------------------- */

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

  /* -------------------------------- RENDER --------------------------------- */

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          onGooglePick={setFromGoogleDrive}
          onDropboxPick={setFromDropbox}
          currentFileCount={0}
        />
      )}

      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <ImageToolIconBadge
              primaryColor={config.primaryColor}
              bgColor={config.dropzoneColor}
              bgColorDark={config.dropzoneColorDark}
              isDark={isDark}
            />
            <div className="flex-1 min-w-0 ml-2">
              <FileInfo name={file.name} size={file.size} />
            </div>

            <IconActionButton
              onClick={reset}
              disabled={cropping}
              label="Change"
            />
          </div>

          {/* Layout */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Settings Panel */}
            <div className="space-y-5">
              {/* Aspect Ratio */}
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => {
                    const isActive = aspectRatio === ratio.value;
                    return (
                      <button
                        key={ratio.label}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium 
                                    flex flex-col items-center gap-1.5 border transition-all cursor-pointer
                                    ${
                                      isActive
                                        ? "text-white border-transparent shadow-sm"
                                        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                        style={{
                          backgroundColor: isActive
                            ? config.primaryColor
                            : undefined,
                        }}
                      >
                        <div className="w-5 h-5">{ratio.icon}</div>
                        <span className="text-xs font-bold">{ratio.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

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
                <FileError error={error} className="mt-3" />
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

            {/* RIGHT COLUMN: Cropper Canvas */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
              <div className="mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Crop Area
                </span>
              </div>

              <div className="relative w-full aspect-video bg-zinc-950 rounded-lg overflow-hidden">
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
                    containerStyle: {
                      backgroundColor: "#09090b",
                      borderRadius: 8,
                    },
                    mediaStyle: {
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <SessionFilesDisplay toolType="cropper" config={config} />

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
