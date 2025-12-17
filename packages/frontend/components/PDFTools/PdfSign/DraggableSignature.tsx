// ============================================================================
// FILE: src/components/PdfTools/SignPdf/DraggableSignature.tsx
// ============================================================================

import { useState, useRef, useEffect } from "react";
import type { SignatureItem } from "@/services/pdfService/types";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import Image from "next/image";

interface DraggableSignatureProps {
  signature: SignatureItem;
  scale: number;
  primaryColor: string;
  onUpdate: (updates: Partial<SignatureItem>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  containerWidth: number;
  containerHeight: number;
}

export const DraggableSignature = ({
  signature,
  scale,
  primaryColor,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  containerWidth,
  containerHeight,
}: DraggableSignatureProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const elementRef = useRef<HTMLDivElement>(null);

  // Convert PDF points to pixels
  const x = signature.x * scale;
  const y = signature.y * scale;
  const width = signature.width * scale;
  const height = signature.height * scale;

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
  const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: signature.width,
      height: signature.height,
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    const touch = e.touches[0];
    setResizeStart({
      x: touch.clientX,
      y: touch.clientY,
      width: signature.width,
      height: signature.height,
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
        
        const newWidth = Math.max(50, Math.min(resizeStart.width + deltaX / scale, 500));
        const newHeight = Math.max(30, Math.min(resizeStart.height + deltaY / scale, 300));
        
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
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-2 hover:ring-blue-300'
      } ${isDragging || isResizing ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: isSelected ? 30 : 20,
      }}
    >
      {/* DELETE BUTTON */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-white flex items-center justify-center z-30 transition-colors bg-blue-500"
          style={{ cursor: 'pointer' }}
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      )}

      {/* SIGNATURE CONTENT */}
      <div className="w-full h-full rounded-lg flex items-center justify-center">
        {signature.type === 'image' && signature.imagePreview ? (
          <Image
            src={signature.imagePreview}
            alt="signature"
            unoptimized
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-center wrap-break-words overflow-hidden text-zinc-700 dark:text-zinc-700"
            style={{
              fontFamily: signature.font || 'Arial',
              fontSize: `${Math.min(24, height / 3)}px`,
              fontWeight: 600,
              fontStyle: 'italic',
            }}
          >
            {signature.text || 'Signature'}
          </div>
        )}
      </div>

      {/* RESIZE HANDLES */}
      {isSelected && (
        <>
          {/* Bottom-Right Handle */}
          <div
            className="resize-handle absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'se')}
          />
          
          {/* Bottom-Left Handle */}
          <div
            className="resize-handle absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'sw')}
          />
          
          {/* Top-Right Handle */}
          <div
            className="resize-handle absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'ne')}
          />
          
          {/* Top-Left Handle */}
          <div
            className="resize-handle absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'nw')}
          />
        </>
      )}
    </div>
  );
};