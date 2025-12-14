// ============================================================================
// FILE 1: src/components/PDFTools/PdfCrop/PdfCropOverlay.tsx
// Interactive draggable & resizable crop overlay
// ============================================================================

import { useState, useRef, useEffect, useCallback } from "react";

interface PdfCropOverlayProps {
  containerWidth: number;
  containerHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  scale: number;
  onCropChange: (crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

type DragHandle =
  | "tl"
  | "tr"
  | "bl"
  | "br"
  | "t"
  | "r"
  | "b"
  | "l"
  | "move"
  | null;

export const PdfCropOverlay = ({
  containerWidth,
  containerHeight,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  scale,
  onCropChange,
}: PdfCropOverlayProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
    width: 0,
    height: 0,
  });

  // ============================================================================
  // DRAG START
  // ============================================================================
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: DragHandle) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragHandle(handle);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        cropX,
        cropY,
        width: cropWidth,
        height: cropHeight,
      };
    },
    [cropX, cropY, cropWidth, cropHeight]
  );

  // ============================================================================
  // DRAG MOVE
  // ============================================================================
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragHandle) return;

      const deltaX = (e.clientX - dragStartRef.current.x) / scale;
      const deltaY = (e.clientY - dragStartRef.current.y) / scale;

      const start = dragStartRef.current;
      let newX = start.cropX;
      let newY = start.cropY;
      let newWidth = start.width;
      let newHeight = start.height;

      const minSize = 50;

      // Move entire crop area
      if (dragHandle === "move") {
        newX = start.cropX + deltaX;
        newY = start.cropY + deltaY;
      }
      // Top-left corner
      else if (dragHandle === "tl") {
        const maxDx = start.width - minSize;
        const maxDy = start.height - minSize;
        const dx = Math.min(deltaX, maxDx);
        const dy = Math.min(deltaY, maxDy);
        newX = start.cropX + dx;
        newY = start.cropY + dy;
        newWidth = start.width - dx;
        newHeight = start.height - dy;
      }
      // Top-right corner
      else if (dragHandle === "tr") {
        const maxDy = start.height - minSize;
        const dy = Math.min(deltaY, maxDy);
        newY = start.cropY + dy;
        newWidth = start.width + deltaX;
        newHeight = start.height - dy;
      }
      // Bottom-left corner
      else if (dragHandle === "bl") {
        const maxDx = start.width - minSize;
        const dx = Math.min(deltaX, maxDx);
        newX = start.cropX + dx;
        newWidth = start.width - dx;
        newHeight = start.height + deltaY;
      }
      // Bottom-right corner
      else if (dragHandle === "br") {
        newWidth = start.width + deltaX;
        newHeight = start.height + deltaY;
      }
      // Top edge
      else if (dragHandle === "t") {
        const maxDy = start.height - minSize;
        const dy = Math.min(deltaY, maxDy);
        newY = start.cropY + dy;
        newHeight = start.height - dy;
      }
      // Right edge
      else if (dragHandle === "r") {
        newWidth = start.width + deltaX;
      }
      // Bottom edge
      else if (dragHandle === "b") {
        newHeight = start.height + deltaY;
      }
      // Left edge
      else if (dragHandle === "l") {
        const maxDx = start.width - minSize;
        const dx = Math.min(deltaX, maxDx);
        newX = start.cropX + dx;
        newWidth = start.width - dx;
      }

      // Constrain to container bounds
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newWidth = Math.max(minSize, newWidth);
      newHeight = Math.max(minSize, newHeight);

      // Don't exceed container
      if (newX + newWidth > containerWidth) {
        newWidth = containerWidth - newX;
      }
      if (newY + newHeight > containerHeight) {
        newHeight = containerHeight - newY;
      }

      // Update crop
      onCropChange({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });
    },
    [isDragging, dragHandle, containerWidth, containerHeight, scale, onCropChange]
  );

  // ============================================================================
  // DRAG END
  // ============================================================================
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ============================================================================
  // SCALED POSITIONS
  // ============================================================================
  const scaledX = cropX * scale;
  const scaledY = cropY * scale;
  const scaledWidth = cropWidth * scale;
  const scaledHeight = cropHeight * scale;

  const handleSize = 14;
  const edgeThickness = 10;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ cursor: isDragging ? "grabbing" : "default" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Crop area */}
      <div
        className="absolute pointer-events-auto cursor-move transition-shadow hover:shadow-2xl"
        style={{
          left: scaledX,
          top: scaledY,
          width: scaledWidth,
          height: scaledHeight,
          border: "3px solid #3b82f6",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
        }}
        onMouseDown={(e) => handleMouseDown(e, "move")}
      >
        {/* Corner handles */}
        <div
          className="absolute bg-blue-500 rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-lg border-2 border-white"
          style={{
            left: -handleSize / 2,
            top: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleMouseDown(e, "tl")}
        />
        <div
          className="absolute bg-blue-500 rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-lg border-2 border-white"
          style={{
            right: -handleSize / 2,
            top: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleMouseDown(e, "tr")}
        />
        <div
          className="absolute bg-blue-500 rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-lg border-2 border-white"
          style={{
            left: -handleSize / 2,
            bottom: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleMouseDown(e, "bl")}
        />
        <div
          className="absolute bg-blue-500 rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-lg border-2 border-white"
          style={{
            right: -handleSize / 2,
            bottom: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleMouseDown(e, "br")}
        />

        {/* Edge handles */}
        <div
          className="absolute cursor-ns-resize"
          style={{
            left: handleSize,
            right: handleSize,
            top: -edgeThickness / 2,
            height: edgeThickness,
          }}
          onMouseDown={(e) => handleMouseDown(e, "t")}
        />
        <div
          className="absolute cursor-ew-resize"
          style={{
            right: -edgeThickness / 2,
            top: handleSize,
            bottom: handleSize,
            width: edgeThickness,
          }}
          onMouseDown={(e) => handleMouseDown(e, "r")}
        />
        <div
          className="absolute cursor-ns-resize"
          style={{
            left: handleSize,
            right: handleSize,
            bottom: -edgeThickness / 2,
            height: edgeThickness,
          }}
          onMouseDown={(e) => handleMouseDown(e, "b")}
        />
        <div
          className="absolute cursor-ew-resize"
          style={{
            left: -edgeThickness / 2,
            top: handleSize,
            bottom: handleSize,
            width: edgeThickness,
          }}
          onMouseDown={(e) => handleMouseDown(e, "l")}
        />

        {/* Dimension label */}
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
          {cropWidth} x {cropHeight} pts
        </div>
      </div>
    </div>
  );
};