// ============================================================================
// FILE: src/components/PDFTools/PdfCrop/PdfCropViewer.tsx
// PURPOSE: Responsive PDF Crop Viewer with Page Navigation & Overlay
// ============================================================================

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { PdfCropOverlay } from "./PdfCropOverlay";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";

import type { PdfFileSettings } from "@/services/pdfService/types";

// ============================================================================
// PDF WORKER
// ============================================================================

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// COMPONENT
// ============================================================================

export const PdfCropViewer = ({
  file,
  settings,
  onCropChange,
}: PdfCropViewerProps) => {
  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // PDF dimensions (points)
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  // Rendered dimensions (pixels)
  const [renderedWidth, setRenderedWidth] = useState(0);

  // Responsive container
  const [containerSize, setContainerSize] = useState({
    width: 500,
    height: 600,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------------------------
  // DOCUMENT LOADERS
  // --------------------------------------------------------------------------

  const handleDocumentLoad = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePageLoad = (page: {
    originalWidth: number;
    originalHeight: number;
  }) => {
    setPageWidth(page.originalWidth);
    setPageHeight(page.originalHeight);
  };

  // --------------------------------------------------------------------------
  // RESPONSIVE RESIZE HANDLING
  // --------------------------------------------------------------------------

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;

      const { clientWidth } = containerRef.current;
      const maxHeight =
        window.innerWidth < 768
          ? window.innerHeight * 0.5
          : 600;

      setContainerSize({
        width: clientWidth,
        height: maxHeight,
      });
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    // Ensure correct size after initial mount
    const timeout = setTimeout(updateSize, 100);

    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timeout);
    };
  }, []);

  // --------------------------------------------------------------------------
  // SCALE CALCULATION (PDF POINTS → PIXELS)
  // --------------------------------------------------------------------------

  const scale =
    renderedWidth > 0 && pageWidth > 0
      ? renderedWidth / pageWidth
      : 1;

  // --------------------------------------------------------------------------
  // PAGE NAVIGATION
  // --------------------------------------------------------------------------

  const changePage = (delta: number) => {
    if (!numPages) return;

    setCurrentPage((prev) =>
      Math.min(Math.max(1, prev + delta), numPages)
    );
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="w-full select-none">
      {/* ===================================================================== */}
      {/* HEADER */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Preview & Crop
        </h4>

        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-md transition-colors hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90 text-zinc-600 dark:text-zinc-300" />
            </button>

            <span className="w-16 text-xs font-mono text-center text-zinc-600 dark:text-zinc-400">
              {currentPage} / {numPages}
            </span>

            <button
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
              className="p-1 rounded-md transition-colors hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30"
            >
              <ChevronDownSvg className="w-4 h-4 -rotate-90 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* PDF VIEWER */}
      {/* ===================================================================== */}
      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
        style={{ height: containerSize.height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        )}

        <Document
          file={file}
          onLoadSuccess={handleDocumentLoad}
          loading={null}
          className="max-w-full max-h-full"
        >
          <div className="relative">
            <Page
              pageNumber={currentPage}
              height={
                window.innerWidth > 768
                  ? containerSize.height - 40
                  : undefined
              }
              width={
                window.innerWidth <= 768
                  ? containerSize.width - 20
                  : undefined
              }
              onLoadSuccess={(page) => {
                const canvas = document.querySelector(
                  `.react-pdf__Page[data-page-number="${currentPage}"] canvas`
                );

                if (canvas) {
                  setRenderedWidth(
                    canvas.getBoundingClientRect().width
                  );
                }

                handlePageLoad(page);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading=""
              className="block"
            />

            {/* =============================================================== */}
            {/* CROP OVERLAY */}
            {/* =============================================================== */}
            {!loading && pageWidth > 0 && (
              <PdfCropOverlay
                containerWidth={pageWidth}
                containerHeight={pageHeight}
                cropX={settings.crop_x ?? 50}
                cropY={settings.crop_y ?? 50}
                cropWidth={settings.crop_width ?? 400}
                cropHeight={settings.crop_height ?? 400}
                scale={scale}
                onCropChange={(c) =>
                  onCropChange({
                    crop_x: c.x,
                    crop_y: c.y,
                    crop_width: c.width,
                    crop_height: c.height,
                  })
                }
              />
            )}
          </div>
        </Document>
      </div>
    </div>
  );
};
