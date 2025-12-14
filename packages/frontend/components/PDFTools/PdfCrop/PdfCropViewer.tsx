// ============================================================================
// FILE: src/components/PDFTools/PdfCrop/PdfCropViewer.tsx
// Optimized Viewer: Fits to screen, Mobile Friendly, Touch Controls
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfCropOverlay } from "./PdfCropOverlay";
import type { PdfFileSettings } from "@/services/pdfService/types";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfCropViewerProps {
  file: File;
  settings: PdfFileSettings;
  onCropChange: (crop: {
    crop_x: number;
    crop_y: number;
    crop_width: number;
    crop_height: number;
  }) => void;
}

export const PdfCropViewer = ({
  file,
  settings,
  onCropChange
}: PdfCropViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dimensions
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // LOADERS
  // ============================================================================
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onPageLoadSuccess = (page: { width: number; height: number; originalWidth: number; originalHeight: number }) => {
    // We store the original PDF point dimensions
    setPageWidth(page.originalWidth);
    setPageHeight(page.originalHeight);
    
    // Calculate what the rendered width ended up being
    if (containerRef.current) {
        // This is an estimation, React-PDF usually fits the width we give it
        // We will calc scale based on rendered width vs original width
    }
  };

  // ============================================================================
  // RESIZE LOGIC (Responsive Fit)
  // ============================================================================
  const [containerSize, setContainerSize] = useState({ width: 500, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        // Desktop: Max height logic | Mobile: fit width
        const maxHeight = window.innerWidth < 768 ? window.innerHeight * 0.5 : 600; 
        setContainerSize({ width: clientWidth, height: maxHeight });
      }
    };
    
    window.addEventListener("resize", updateSize);
    updateSize();
    
    // Initial delay to ensure DOM is ready
    setTimeout(updateSize, 100);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const scale = renderedWidth > 0 && pageWidth > 0 ? renderedWidth / pageWidth : 1;

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  const changePage = (delta: number) => {
    if (!numPages) return;
    const newPage = Math.min(Math.max(1, currentPage + delta), numPages);
    setCurrentPage(newPage);
  };

  return (
    <div className="w-full select-none">
      {/* 1. Header with Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Preview & Crop
        </h4>
        
        {numPages && numPages > 1 && (
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                <button 
                    onClick={() => changePage(-1)}
                    disabled={currentPage <= 1}
                    className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors"
                >
                    <ChevronDownSvg className="w-4 h-4 text-zinc-600 dark:text-zinc-300 rotate-90"/>
                </button>
                <span className="text-xs font-mono w-16 text-center text-zinc-600 dark:text-zinc-400">
                    {currentPage} / {numPages}
                </span>
                <button 
                    onClick={() => changePage(1)}
                    disabled={currentPage >= numPages}
                    className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors"
                >
                    <ChevronDownSvg className="w-4 h-4 text-zinc-600 dark:text-zinc-300 -rotate-90"/>
                </button>
            </div>
        )}
      </div>

      {/* 2. PDF Container */}
      <div 
        ref={containerRef}
        className="relative w-full bg-zinc-100 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center items-center"
        style={{ height: containerSize.height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        )}

        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          className="max-w-full max-h-full"
        >
          <div className="relative">
            <Page
              pageNumber={currentPage}
              height={window.innerWidth > 768 ? containerSize.height - 40 : undefined}
              width={window.innerWidth <= 768 ? containerSize.width - 20 : undefined}
              onLoadSuccess={(page) => {
                const canvas = document.querySelector(`.react-pdf__Page[data-page-number="${currentPage}"] canvas`);
                if (canvas) {
                    setRenderedWidth(canvas.getBoundingClientRect().width);
                }
                onPageLoadSuccess(page);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading=""
              className="block"
            />
            
            {/* 3. Overlay - Only shows when we have valid dimensions */}
            {!loading && pageWidth > 0 && (
                <PdfCropOverlay 
                    containerWidth={pageWidth}
                    containerHeight={pageHeight}
                    cropX={settings.crop_x ?? 50}
                    cropY={settings.crop_y ?? 50}
                    cropWidth={settings.crop_width ?? 400}
                    cropHeight={settings.crop_height ?? 400}
                    scale={scale}
                    onCropChange={(c) => onCropChange({
                        crop_x: c.x,
                        crop_y: c.y,
                        crop_width: c.width,
                        crop_height: c.height
                    })}
                />
            )}
          </div>
        </Document>
      </div>
      
      <p className="text-center text-sm text-zinc-400 mt-2">
        {window.innerWidth < 768 ? "Tap and drag to crop" : "Drag corners to adjust crop area"}
      </p>
    </div>
  );
};