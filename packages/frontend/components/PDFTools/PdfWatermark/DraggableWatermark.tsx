// ============================================================================
// FILE: src/components/PdfTools/Watermark/DraggableWatermark.tsx
// ============================================================================

import { useState, useRef, useEffect } from "react";
import type { PdfFileSettings } from "@/services/pdfService/types";

interface DraggableWatermarkProps {
  settings: PdfFileSettings;
  scale: number;
  imagePreview: string | null;
  onUpdate: (updates: Partial<PdfFileSettings>) => void;
  onSelect: () => void;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const DraggableWatermark = ({
  settings,
  scale,
  imagePreview,
  onUpdate,
  onSelect,
  isSelected,
  containerWidth,
  containerHeight,
}: DraggableWatermarkProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const elementRef = useRef<HTMLDivElement>(null);

  // Convert PDF points to pixels
  const x = (settings.x || 150) * scale;
  const y = (settings.y || 350) * scale;
  const width = (settings.width || 300) * scale;
  const height = (settings.height || 150) * scale;

  // ============================================================================
  // DRAG HANDLERS
  // ============================================================================
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - x,
      y: touch.clientY - y,
    });
  };

  // ============================================================================
  // RESIZE HANDLERS
  // ============================================================================
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: settings.width || 300,
      height: settings.height || 150,
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    const touch = e.touches[0];
    setResizeStart({
      x: touch.clientX,
      y: touch.clientY,
      width: settings.width || 300,
      height: settings.height || 150,
    });
  };

  // ============================================================================
  // GLOBAL MOVE HANDLERS
  // ============================================================================
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(clientX - dragStart.x, containerWidth - width));
        const newY = Math.max(0, Math.min(clientY - dragStart.y, containerHeight - height));
        
        // Convert pixels back to PDF points
        onUpdate({
          x: newX / scale,
          y: newY / scale,
        });
      }

      if (isResizing) {
        const deltaX = clientX - resizeStart.x;
        const deltaY = clientY - resizeStart.y;
        
        const newWidth = Math.max(50, Math.min(resizeStart.width + deltaX / scale, 800));
        const newHeight = Math.max(20, Math.min(resizeStart.height + deltaY / scale, 600));
        
        onUpdate({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, onUpdate, scale, containerWidth, containerHeight, width, height]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute select-none transition-shadow ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:ring-2 hover:ring-purple-300'
      } ${isDragging || isResizing ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: isSelected ? 30 : 20,
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${settings.rotation || 0}deg)`,
        transformOrigin: 'center center',
        opacity: settings.opacity || 0.3,
        border: isSelected ? '2px solid rgba(192, 38, 211, 0.5)' : '2px dashed rgba(192, 38, 211, 0.3)',
        backgroundColor: 'rgba(192, 38, 211, 0.05)',
        borderRadius: '4px',
      }}
    >
      {/* WATERMARK CONTENT */}
      <div className="w-full h-full flex items-center justify-center p-2">
        {settings.watermarkFile && imagePreview ? (
          <img
            src={imagePreview}
            alt="watermark"
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-center wrap-break-words overflow-hidden"
            style={{
              fontFamily: settings.font || 'Arial',
              fontSize: `${Math.min((settings.font_size || 50) * scale, height / 2)}px`,
              color: settings.color || 'gray',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {settings.text || 'WATERMARK'}
          </div>
        )}
      </div>

      {/* RESIZE HANDLES */}
      {isSelected && (
        <>
          {/* Bottom-Right Handle */}
          <div
            className="resize-handle absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full cursor-se-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
          />
          
          {/* Bottom-Left Handle */}
          <div
            className="resize-handle absolute -bottom-1 -left-1 w-4 h-4 bg-purple-500 rounded-full cursor-sw-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
          />
          
          {/* Top-Right Handle */}
          <div
            className="resize-handle absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full cursor-ne-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
          />
          
          {/* Top-Left Handle */}
          <div
            className="resize-handle absolute -top-1 -left-1 w-4 h-4 bg-purple-500 rounded-full cursor-nw-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
          />
        </>
      )}
    </div>
  );
};