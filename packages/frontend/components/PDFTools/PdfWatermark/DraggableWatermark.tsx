// ============================================================================
// FILE: src/app/tools/pdf-watermark/DraggableWatermark.tsx
// ============================================================================

import { useState, useRef, useEffect } from "react";
import type { SignatureItem } from "@/services/pdfService/types";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import Image from "next/image";

interface DraggableWatermarkProps {
  watermark: SignatureItem;
  scale: number;
  onUpdate: (updates: Partial<SignatureItem>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  containerWidth: number;
  containerHeight: number;
}

const RESIZE_BOUNDS = { minWidth: 50, maxWidth: 500, minHeight: 30, maxHeight: 300 };

export const DraggableWatermark = ({
  watermark,
  scale,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  containerWidth,
  containerHeight,
}: DraggableWatermarkProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const x = watermark.x * scale;
  const y = watermark.y * scale;
  const width = watermark.width * scale;
  const height = watermark.height * scale;

  const opacity = watermark.opacity ?? 0.3;
  const color = watermark.color ?? "#000000";
  const font = watermark.font || "Bebas Neue";
  const rotation = watermark.rotation || 0;
  const isText = watermark.type === "text";

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle")) return;
    
    if (e.type.includes("mouse")) {
      const me = e as React.MouseEvent;
      me.preventDefault();
      me.stopPropagation();
      setDragStart({ x: me.clientX - x, y: me.clientY - y });
    } else {
      const te = e as React.TouchEvent;
      te.stopPropagation();
      const touch = te.touches[0];
      setDragStart({ x: touch.clientX - x, y: touch.clientY - y });
    }

    onSelect();
    setIsDragging(true);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    if (e.type.includes("mouse")) {
      const me = e as React.MouseEvent;
      setResizeStart({ x: me.clientX, y: me.clientY, width: watermark.width, height: watermark.height });
    } else {
      const te = e as React.TouchEvent;
      const touch = te.touches[0];
      setResizeStart({ x: touch.clientX, y: touch.clientY, width: watermark.width, height: watermark.height });
    }
  };

  // Handle movement
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(clientX - dragStart.x, containerWidth - width));
        const newY = Math.max(0, Math.min(clientY - dragStart.y, containerHeight - height));
        onUpdate({ x: newX / scale, y: newY / scale });
      }

      if (isResizing) {
        const deltaX = clientX - resizeStart.x;
        const deltaY = clientY - resizeStart.y;
        const newWidth = Math.max(RESIZE_BOUNDS.minWidth, Math.min(resizeStart.width + deltaX / scale, RESIZE_BOUNDS.maxWidth));
        const newHeight = Math.max(RESIZE_BOUNDS.minHeight, Math.min(resizeStart.height + deltaY / scale, RESIZE_BOUNDS.maxHeight));
        onUpdate({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, onUpdate, scale, containerWidth, containerHeight, width, height]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className={`absolute select-none transition-shadow ${
        isSelected ? "ring-2 ring-purple-500 shadow-lg z-30" : "hover:ring-2 hover:ring-purple-300 z-20"
      } ${isDragging || isResizing ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        touchAction: "none",
      }}
    >
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-white flex items-center justify-center z-30 transition-colors bg-red-500 shadow-sm cursor-pointer"
        >
          <CancelSvg className="w-4 h-4" />
        </button>
      )}

      <div className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden" style={{ opacity }}>
        {!isText && watermark.imagePreview ? (
          <Image
            src={watermark.imagePreview}
            alt="watermark"
            width={width}
            height={height}
            unoptimized
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-center pointer-events-none select-none"
            style={{
              fontFamily: font,
              color: color,
              fontSize: `${Math.min(height * 0.7, 80)}px`,
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {watermark.text || "Watermark"}
          </div>
        )}
      </div>

      {isSelected && (
        <>
          {[
            { pos: "se", cursor: "se-resize" },
            { pos: "sw", cursor: "sw-resize" },
            { pos: "ne", cursor: "ne-resize" },
            { pos: "nw", cursor: "nw-resize" },
          ].map(({ pos, cursor }) => (
            <div
              key={pos}
              className={`resize-handle absolute w-4 h-4 bg-purple-500 border border-white rounded-full cursor-${cursor} z-40 hover:scale-125 transition-transform`}
              style={{
                ...(pos.includes("b") && { bottom: "-4px" }),
                ...(pos.includes("t") && { top: "-4px" }),
                ...(pos.includes("r") && { right: "-4px" }),
                ...(pos.includes("l") && { left: "-4px" }),
              }}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeStart}
            />
          ))}
        </>
      )}
    </div>
  );
};