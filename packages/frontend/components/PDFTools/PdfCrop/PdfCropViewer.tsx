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
      
      // Mobile: 50vh max height, Desktop: 600px
      const maxHeight =
        window.innerWidth < 768 ? window.innerHeight * 0.45 : 600;
      
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
    renderedWidth > 0 && pageWidth > 0 ? renderedWidth / pageWidth : 1;

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
    <div className="w-full select-none flex flex-col h-full">
      {/* ===================================================================== */}
      {/* HEADER */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <h4 className="text-sm font-semibold uppercase text-zinc-500">
          Preview
        </h4>
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="p-1 rounded-md transition-colors hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90 text-zinc-600 dark:text-zinc-300" />
            </button>
            <span className="text-xs font-mono w-10 text-center select-none">{currentPage}/{numPages}</span>
            <button
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
              className="p-1 rounded-md transition-colors hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
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
        className="relative w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-auto flex-1 py-4"
        style={{ height: containerSize.height, maxHeight: "100%" }}
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
          className="flex items-center justify-center"
        >
          <div className="relative inline-block">
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

      {/* ===================================================================== */}
      {/* PAGE NAVIGATION STRIP */}
      {/* ===================================================================== */}
      {numPages && numPages > 1 && (
        <div className="px-1 my-2 shrink-0">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            All Pages ({numPages})
          </label>
          <div className="flex items-center gap-2">
            {/* Previous Arrow */}
            <button
              type="button"
              onClick={() => changePage(-1)}
              disabled={currentPage <= 1}
              className="shrink-0 w-8 h-10 bg-[#4D7C0F] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronDownSvg className="w-6 h-6 rotate-90" />
            </button>

            {/* Scrollable Page Numbers */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === currentPage;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`shrink-0 w-10 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border-2 ${
                        isCurrent
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={() => changePage(1)}
              disabled={currentPage >= numPages}
              className="shrink-0 w-8 h-10 bg-[#4D7C0F] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Next page"
            >
              <ChevronDownSvg className="w-6 h-6 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};