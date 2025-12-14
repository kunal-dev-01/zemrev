// ============================================================================
// FILE: src/components/PDFTools/PdfCrop/PdfCropViewer.tsx
// PDF preview with scroll-based page navigation + crop overlay
// ============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfCropOverlay } from "./PdfCropOverlay";
import type { PdfFileSettings } from "@/services/pdfService/types";

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
  primaryColor: string;
}

export const PdfCropViewer = ({
  file,
  settings,
  onCropChange,
  primaryColor,
}: PdfCropViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(612);
  const [pageHeight, setPageHeight] = useState(792);
  const [containerWidth, setContainerWidth] = useState(700);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scale = containerWidth / pageWidth;

  // ============================================================================
  // PDF LOAD HANDLERS
  // ============================================================================
  const onDocumentLoadSuccess = useCallback(
    ({ numPages: num }: { numPages: number }) => {
      setNumPages(num);
      setLoading(false);
    },
    []
  );

  const onPageLoadSuccess = useCallback(
    (page: { width: number; height: number }) => {
      setPageWidth(page.width);
      setPageHeight(page.height);
    },
    []
  );

  // ============================================================================
  // CROP CHANGE HANDLER
  // ============================================================================
  const handleCropChange = useCallback(
    (crop: { x: number; y: number; width: number; height: number }) => {
      onCropChange({
        crop_x: crop.x,
        crop_y: crop.y,
        crop_width: crop.width,
        crop_height: crop.height,
      });
    },
    [onCropChange]
  );

  // ============================================================================
  // SCROLL-BASED PAGE CHANGE
  // ============================================================================
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !numPages || numPages <= 1) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight - container.clientHeight;
          const scrollPercentage = scrollTop / scrollHeight;

          const newPage = Math.min(
            numPages,
            Math.max(1, Math.ceil(scrollPercentage * numPages))
          );

          if (newPage !== currentPage) {
            setCurrentPage(newPage);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [numPages, currentPage]);

  // ============================================================================
  // RESPONSIVE WIDTH
  // ============================================================================
  useEffect(() => {
    const updateWidth = () => {
      const parent = document.getElementById("pdf-crop-container");
      if (parent) {
        const availableWidth = parent.clientWidth - 80;
        setContainerWidth(Math.min(availableWidth, 850));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div id="pdf-crop-container" className="w-full">
      {/* Page indicator */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center mb-4 px-4 py-2.5 bg-linear-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            📄 Page {currentPage} of {numPages}
            <span className="text-zinc-500 dark:text-zinc-400 ml-2 text-xs font-normal">
              • Scroll to change pages
            </span>
          </span>
        </div>
      )}

      {/* PDF viewer container - CENTERED */}
      <div
        ref={scrollContainerRef}
        className="relative bg-zinc-50 dark:bg-zinc-900 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 overflow-y-auto overflow-x-hidden shadow-lg"
        style={{
          maxHeight: "75vh",
          scrollBehavior: "smooth",
        }}
      >
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-96 gap-3">
            <div
              className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
              style={{ borderColor: `${primaryColor}40`, borderTopColor: "transparent" }}
            />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading PDF...
            </p>
          </div>
        )}

        {/* PDF + Crop Overlay - CENTERED with flex */}
        <div className="flex items-start justify-center min-h-full p-4">
          <div className="relative">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading=""
              error={
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <p className="text-red-500 font-medium mb-2">
                      Failed to load PDF
                    </p>
                    <p className="text-sm text-zinc-500">
                      Please try another file
                    </p>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                width={containerWidth}
                onLoadSuccess={onPageLoadSuccess}
                loading=""
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-xl rounded-lg overflow-hidden"
              />
            </Document>

            {/* Interactive crop overlay */}
            {!loading && (
              <PdfCropOverlay
                containerWidth={pageWidth}
                containerHeight={pageHeight}
                cropX={settings.crop_x ?? 50}
                cropY={settings.crop_y ?? 50}
                cropWidth={settings.crop_width ?? 500}
                cropHeight={settings.crop_height ?? 700}
                scale={scale}
                onCropChange={handleCropChange}
              />
            )}
          </div>
        </div>

        {/* Scroll spacer for multiple pages */}
        {numPages && numPages > 1 && (
          <div style={{ height: `${(numPages - 1) * 300}px` }} />
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          🖱️ Drag to move
        </span>
        <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          ↔️ Resize from corners/edges
        </span>
        {numPages && numPages > 1 && (
          <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            📜 Scroll for pages
          </span>
        )}
      </div>
    </div>
  );
};