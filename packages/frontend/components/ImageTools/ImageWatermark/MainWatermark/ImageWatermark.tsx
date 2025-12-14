// ImageTools/ImageWatermark/MainWatermark/ImageWatermark.tsx

import { useState, useCallback, useRef } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { useImageWatermark } from "@/hooks/imageHooks/useImageWatermark.hook";
import type { WatermarkPosition } from "@/services/imageService/types";
import { ImageWatermarkUI } from "./ImageWatermark.ui";   // <-- NEW IMPORT

const ImageWatermark = () => {
  const config = TOOL_CONFIGS.watermark;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const watermarkInputRef = useRef<HTMLInputElement>(null!);

  // Watermark mode
  const [mode, setMode] = useState<"text" | "image">("text");

  // Text watermark settings
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState(70);

  // Image watermark settings
  const [scale, setScale] = useState(30);
  const [imageOpacity, setImageOpacity] = useState(70);

  // Common settings
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");

  const {
    file,
    imageUrl,
    watermarkFile,
    watermarkPreview,
    processing,
    error,
    setImageFile,
    setFromGoogleDrive,
    setFromDropbox,
    setFromUrl,
    setWatermark,
    applyTextWatermark,
    applyImageWatermark,
    reset,
  } = useImageWatermark();

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setImageFile(files[0]);
      }
    },
    [setImageFile]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await setFromUrl(url);
    },
    [setFromUrl]
  );

  const handleWatermarkSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setWatermark(e.target.files[0]);
      }
    },
    [setWatermark]
  );

  // ============================================================================
  // APPLY WATERMARK
  // ============================================================================
  const handleApplyWatermark = useCallback(async () => {
    if (mode === "text") {
      await applyTextWatermark({
        text,
        fontSize,
        color,
        opacity: opacity / 100,
        position,
      });
    } else {
      await applyImageWatermark({
        scale: scale / 100,
        opacity: imageOpacity / 100,
        position,
      });
    }
  }, [
    mode,
    text,
    fontSize,
    color,
    opacity,
    scale,
    imageOpacity,
    position,
    applyTextWatermark,
    applyImageWatermark,
  ]);

  // Position options
  const positions: { label: string; value: WatermarkPosition }[] = [
    { label: "Top Left", value: "top-left" },
    { label: "Top Right", value: "top-right" },
    { label: "Center", value: "center" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Bottom Right", value: "bottom-right" },
  ];

  // Opacity presets
  const opacityPresets = [
    { label: "25%", value: 25 },
    { label: "50%", value: 50 },
    { label: "75%", value: 75 },
    { label: "100%", value: 100 },
  ];

  // Get position styles for preview
  const getPositionStyles = () => {
    const baseStyles = "absolute pointer-events-none flex items-center";
    switch (position) {
      case "top-left":
        return `${baseStyles} top-4 left-4 justify-start`;
      case "top-right":
        return `${baseStyles} top-4 right-4 justify-end`;
      case "center":
        return `${baseStyles} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 justify-center`;
      case "bottom-left":
        return `${baseStyles} bottom-4 left-4 justify-start`;
      case "bottom-right":
        return `${baseStyles} bottom-4 right-4 justify-end`;
      default:
        return `${baseStyles} bottom-4 right-4 justify-end`;
    }
  };

  // Get watermark wrapper styles based on position
  const getWatermarkWrapperStyle = () => {
    const maxDimension = 400; // Maximum size in pixels
    const scaledSize = (maxDimension * scale) / 100;
    
    return {
      width: `${scaledSize}px`,
      maxWidth: '90%',
    };
  };

  // Get watermark image styles
  const getWatermarkImageStyle = () => {
    return {
      width: '100%',
      height: 'auto',
      opacity: imageOpacity / 100,
    };
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          onGooglePick={() => setFromGoogleDrive}
          onDropboxPick={setFromDropbox}
          currentFileCount={0}
        />
      )}

      {/* Watermark Interface */}
      {file && imageUrl && (
        <ImageWatermarkUI
          config={config}
          file={file}
          imageUrl={imageUrl}
          mode={mode}
          setMode={setMode}
          text={text}
          setText={setText}
          fontSize={fontSize}
          setFontSize={setFontSize}
          color={color}
          setColor={setColor}
          opacity={opacity}
          setOpacity={setOpacity}
          scale={scale}
          setScale={setScale}
          imageOpacity={imageOpacity}
          setImageOpacity={setImageOpacity}
          position={position}
          setPosition={setPosition}
          watermarkFile={watermarkFile}
          watermarkPreview={watermarkPreview}
          watermarkInputRef={watermarkInputRef}
          processing={processing}
          error={error}
          reset={reset}
          handleWatermarkSelect={handleWatermarkSelect}
          handleApplyWatermark={handleApplyWatermark}
          positions={positions}
          opacityPresets={opacityPresets}
          getPositionStyles={getPositionStyles}
          getWatermarkWrapperStyle={getWatermarkWrapperStyle}
          getWatermarkImageStyle={getWatermarkImageStyle}
        />
      )}

      {/* Session Files Display */}
      <SessionFilesDisplay toolType="watermark" config={config} />

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

export default ImageWatermark;