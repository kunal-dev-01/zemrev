import { useState, useRef, useEffect } from "react";
import type { PdfFileSettings } from "@/services/pdfService/types";
import { CancelSvg } from "@/components/Svg/CommonSvg";

interface DraggableWatermarkProps {
  settings: PdfFileSettings;
  scale: number;
  primaryColor: string;
  imagePreview: string | null;
  onUpdate: (updates: Partial<PdfFileSettings>) => void;
  onDelete: () => void;
  containerWidth: number;
  containerHeight: number;
}

export const DraggableWatermark = ({
  settings,
  scale,
  primaryColor,
  imagePreview,
  onUpdate,
  onDelete,
  containerWidth,
  containerHeight,
}: DraggableWatermarkProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(true);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeCorner, setResizeCorner] = useState<string>('');
  
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
    setIsSelected(true);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    e.stopPropagation();
    setIsSelected(true);
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - x,
      y: touch.clientY - y,
    });
  };

  // ============================================================================
  // RESIZE HANDLERS (Sign PDF Style - Corner Aware)
  // ============================================================================
  const handleResizeMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: settings.width || 300,
      height: settings.height || 150,
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
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
          x: Math.round(newX / scale),
          y: Math.round(newY / scale),
        });
      }

      if (isResizing) {
        const deltaX = clientX - resizeStart.x;
        const deltaY = clientY - resizeStart.y;
        
        // Calculate new dimensions based on corner
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        
        switch (resizeCorner) {
          case 'se': // Bottom-Right
            newWidth = resizeStart.width + deltaX / scale;
            newHeight = resizeStart.height + deltaY / scale;
            break;
          case 'sw': // Bottom-Left
            newWidth = resizeStart.width - deltaX / scale;
            newHeight = resizeStart.height + deltaY / scale;
            break;
          case 'ne': // Top-Right
            newWidth = resizeStart.width + deltaX / scale;
            newHeight = resizeStart.height - deltaY / scale;
            break;
          case 'nw': // Top-Left
            newWidth = resizeStart.width - deltaX / scale;
            newHeight = resizeStart.height - deltaY / scale;
            break;
        }
        
        // Apply limits
        newWidth = Math.max(50, Math.min(newWidth, 800));
        newHeight = Math.max(20, Math.min(newHeight, 600));
        
        onUpdate({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
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
      setResizeCorner('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    resizeCorner,
    onUpdate,
    scale,
    containerWidth,
    containerHeight,
    width,
    height,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 shadow-lg z-30' : 'hover:ring-2 z-20'
      } ${isDragging || isResizing ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'all',
        touchAction: 'none',
        borderRadius: '8px',
        border: isSelected 
          ? `2px solid ${primaryColor}` 
          : `2px dashed ${primaryColor}40`,
      }}
    >
      {/* DELETE BUTTON (Sign PDF Style) */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-white flex items-center justify-center z-40 transition-colors bg-red-500 hover:bg-red-600 shadow-sm"
          style={{ cursor: 'pointer' }}
        >
          <CancelSvg className="w-4 h-4" />
        </button>
      )}

      {/* WATERMARK CONTENT (Rotation Applied Here) */}
      <div 
        className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden"
        style={{ 
          opacity: settings.opacity || 0.3,
          backgroundColor: 'rgba(192, 38, 211, 0.05)',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `rotate(${settings.rotation || 0}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {settings.watermarkFile && imagePreview ? (
            <img
              src={imagePreview}
              alt="watermark"
              className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-center pointer-events-none select-none"
              style={{
                fontFamily: settings.font || 'Arial',
                fontSize: `${Math.min((settings.font_size || 50) * scale, height / 2)}px`,
                color: getColorHex(settings.color || 'gray'),
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {settings.text || 'WATERMARK'}
            </div>
          )}
        </div>
      </div>

      {/* RESIZE HANDLES (Sign PDF Style - All 4 Corners) */}
      {isSelected && (
        <>
          {/* Bottom-Right Handle */}
          <div
            className="resize-handle absolute -bottom-1 -right-1 w-4 h-4 border border-white rounded-full cursor-se-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'se')}
            style={{ backgroundColor: primaryColor }}
          />
          
          {/* Bottom-Left Handle */}
          <div
            className="resize-handle absolute -bottom-1 -left-1 w-4 h-4 border border-white rounded-full cursor-sw-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'sw')}
            style={{ backgroundColor: primaryColor }}
          />
          
          {/* Top-Right Handle */}
          <div
            className="resize-handle absolute -top-1 -right-1 w-4 h-4 border border-white rounded-full cursor-ne-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'ne')}
            style={{ backgroundColor: primaryColor }}
          />
          
          {/* Top-Left Handle */}
          <div
            className="resize-handle absolute -top-1 -left-1 w-4 h-4 border border-white rounded-full cursor-nw-resize z-40 hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'nw')}
            style={{ backgroundColor: primaryColor }}
          />
        </>
      )}
    </div>
  );
};

// Helper: Get color hex from backend color names
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    gray: '#808080',
    black: '#000000',
    white: '#FFFFFF',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#EAB308',
    orange: '#F97316',
    purple: '#A855F7',
  };
  return colorMap[color] || color;
}