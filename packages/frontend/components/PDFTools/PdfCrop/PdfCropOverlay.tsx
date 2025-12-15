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
  | "tl" | "tr" | "bl" | "br" | "t" | "r" | "b" | "l" | "move" | null;

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
  
  // Ref to store start positions
  const dragStartRef = useRef({
    clientX: 0,
    clientY: 0,
    cropX: 0,
    cropY: 0,
    width: 0,
    height: 0,
  });

  // ============================================================================
  // COMMON LOGIC (Shared for Mouse & Touch)
  // ============================================================================
  const startDrag = (clientX: number, clientY: number, handle: DragHandle) => {
    setIsDragging(true);
    setDragHandle(handle);
    dragStartRef.current = {
      clientX,
      clientY,
      cropX,
      cropY,
      width: cropWidth,
      height: cropHeight,
    };
  };

  const processMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragHandle) return;

    const deltaX = (clientX - dragStartRef.current.clientX) / scale;
    const deltaY = (clientY - dragStartRef.current.clientY) / scale;

    const start = dragStartRef.current;
    let newX = start.cropX;
    let newY = start.cropY;
    let newWidth = start.width;
    let newHeight = start.height;

    const minSize = 30; // Min size in PDF points

    // Logic to update coordinates based on handle
    if (dragHandle === "move") {
      newX = start.cropX + deltaX;
      newY = start.cropY + deltaY;
    } else {
      if (dragHandle.includes("l")) {
        const dx = Math.min(deltaX, start.width - minSize);
        newX = start.cropX + dx;
        newWidth = start.width - dx;
      }
      if (dragHandle.includes("r")) {
        newWidth = Math.max(minSize, start.width + deltaX);
      }
      if (dragHandle.includes("t")) {
        const dy = Math.min(deltaY, start.height - minSize);
        newY = start.cropY + dy;
        newHeight = start.height - dy;
      }
      if (dragHandle.includes("b")) {
        newHeight = Math.max(minSize, start.height + deltaY);
      }
    }

    // Boundary Constraints
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + newWidth > containerWidth) {
      if (dragHandle === "move") newX = containerWidth - newWidth;
      else newWidth = containerWidth - newX;
    }
    if (newY + newHeight > containerHeight) {
      if (dragHandle === "move") newY = containerHeight - newHeight;
      else newHeight = containerHeight - newY;
    }

    onCropChange({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    });
  };

  // ============================================================================
  // MOUSE HANDLERS
  // ============================================================================
  const handleMouseDown = (e: React.MouseEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(e.clientX, e.clientY, handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    processMove(e.clientX, e.clientY);
  }, [isDragging, dragHandle, scale, containerWidth, containerHeight]); // Added deps

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // ============================================================================
  // TOUCH HANDLERS (Mobile Fix)
  // ============================================================================
  const handleTouchStart = (e: React.TouchEvent, handle: DragHandle) => {
    // Stop propagation to prevent scrolling while dragging
    e.stopPropagation(); 
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, handle);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if(isDragging) e.preventDefault(); // Prevent scrolling page while cropping
    const touch = e.touches[0];
    processMove(touch.clientX, touch.clientY);
  }, [isDragging, dragHandle, scale, containerWidth, containerHeight]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (isDragging) {
      // Mouse listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // Touch listeners (Global)
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // ============================================================================
  // STYLES
  // ============================================================================
  const scaledX = cropX * scale;
  const scaledY = cropY * scale;
  const scaledWidth = cropWidth * scale;
  const scaledHeight = cropHeight * scale;
  const handleSize = 24; // Bigger handles for mobile touch

  // Common handle style
  const handleStyle = (cursor: string): React.CSSProperties => ({
    position: "absolute",
    width: handleSize,
    height: handleSize,
    backgroundColor: "#4D7C0F",
    border: "2px solid white",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    zIndex: 20,
    cursor,
    touchAction: "none"
  });

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      <div className="absolute inset-0 dark:bg-black/20 bg-zinc-100/10 pointer-events-none" />

      <div
        className="absolute pointer-events-auto"
        style={{
          left: scaledX,
          top: scaledY,
          width: scaledWidth,
          height: scaledHeight,
          border: "2px solid #4D7C0F",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.1)",
          cursor: "move",
          touchAction: "none"
        }}
        onMouseDown={(e) => handleMouseDown(e, "move")}
        onTouchStart={(e) => handleTouchStart(e, "move")}
      >
        {/* Corners */}
        <div style={{ ...handleStyle("nwse-resize"), left: -12, top: -12 }} 
             onMouseDown={(e) => handleMouseDown(e, "tl")} 
             onTouchStart={(e) => handleTouchStart(e, "tl")} />
        
        <div style={{ ...handleStyle("nesw-resize"), right: -12, top: -12 }} 
             onMouseDown={(e) => handleMouseDown(e, "tr")} 
             onTouchStart={(e) => handleTouchStart(e, "tr")} />
        
        <div style={{ ...handleStyle("nesw-resize"), left: -12, bottom: -12 }} 
             onMouseDown={(e) => handleMouseDown(e, "bl")} 
             onTouchStart={(e) => handleTouchStart(e, "bl")} />
        
        <div style={{ ...handleStyle("nwse-resize"), right: -12, bottom: -12 }} 
             onMouseDown={(e) => handleMouseDown(e, "br")} 
             onTouchStart={(e) => handleTouchStart(e, "br")} />

        {/* Edges (Invisible clickable areas for resize) */}
        <div className="absolute top-0 inset-x-4 h-4 -mt-2 cursor-ns-resize"
             onMouseDown={(e) => handleMouseDown(e, "t")} onTouchStart={(e) => handleTouchStart(e, "t")} />
        <div className="absolute bottom-0 inset-x-4 h-4 -mb-2 cursor-ns-resize"
             onMouseDown={(e) => handleMouseDown(e, "b")} onTouchStart={(e) => handleTouchStart(e, "b")} />
        <div className="absolute left-0 inset-y-4 w-4 -ml-2 cursor-ew-resize"
             onMouseDown={(e) => handleMouseDown(e, "l")} onTouchStart={(e) => handleTouchStart(e, "l")} />
        <div className="absolute right-0 inset-y-4 w-4 -mr-2 cursor-ew-resize"
             onMouseDown={(e) => handleMouseDown(e, "r")} onTouchStart={(e) => handleTouchStart(e, "r")} />

        {/* Size Label */}
        <div className="absolute -top-8 left-0 bg-[#4D7C0F] text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
          {Math.round(cropWidth)} x {Math.round(cropHeight)}
        </div>
      </div>
    </div>
  );
};