import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import type { PdfFileSettings } from "@/services/pdfService/types";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRotateViewerProps {
  file: File;
  settings: PdfFileSettings;
  primaryColor: string;
}

export const PdfRotateViewer = ({
  file,
  settings,
  primaryColor,
}: PdfRotateViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Parse rotation settings
  const getRotationForPage = (pageNum: number): number => {
    const rotations = settings.rotations || "all:0"; 
    const parts = rotations.split(":");
    
    if (parts.length !== 2) return 0;

    const [pages, angle] = parts;
    const rotationAngle = parseInt(angle) || 0;

    if (pages === "all") return rotationAngle;

    const pageRanges = pages.split(",");
    for (const range of pageRanges) {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(n => parseInt(n.trim()));
        if (pageNum >= start && pageNum <= end) return rotationAngle;
      } else {
        if (pageNum === parseInt(range.trim())) return rotationAngle;
      }
    }
    return 0;
  };

  const currentRotation = getRotationForPage(currentPage);
  const isRotatedSideways = currentRotation % 180 !== 0;
  
  // Calculate effective dimensions after rotation
  const effectiveWidth = isRotatedSideways ? pageDimensions.height : pageDimensions.width;
  const effectiveHeight = isRotatedSideways ? pageDimensions.width : pageDimensions.height;
  
  // Calculate max available width (with padding)
  const maxWidth = containerWidth - 32;
  
  // Determine if landscape orientation
  const isLandscape = effectiveWidth > effectiveHeight;
  
  // Set sizing props - use scale to fit within container
  const pageSizingProps = isLandscape
    ? { height: Math.min(350, maxWidth * (effectiveHeight / effectiveWidth)) }
    : { width: Math.min(maxWidth, effectiveWidth) };

  // --- LOGIC END ---

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-semibold uppercase text-zinc-500">
          Preview
        </h4>
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90" />
            </button>
            <span className="text-xs font-mono w-10 text-center select-none">{currentPage}/{numPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center py-4 min-h-[300px] items-center transition-all"
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="text-xs text-zinc-500 mt-10">Loading PDF...</div>}
        >
          <div className="shadow-lg relative inline-block transition-all duration-300 max-w-full">
            <Page
              pageNumber={currentPage}
              rotate={currentRotation} 
              onLoadSuccess={({ originalWidth, originalHeight }) => {
                setPageDimensions({ width: originalWidth, height: originalHeight });
              }}
              {...pageSizingProps}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white transition-all duration-300 max-w-full!"
            />

            {/* Rotation Indicator */}
            {currentRotation > 0 && (
              <div 
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg z-10"
                style={{ 
                  backgroundColor: primaryColor,
                  color: "white"
                }}
              >
                {currentRotation}°
              </div>
            )}
          </div>
        </Document>
      </div>

      {/* Page Navigation Strip */}
      {numPages && numPages > 1 && (
        <div className="px-1 my-2 shrink-0">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            All Pages ({numPages})
          </label>
          <div className="flex items-center gap-2">
            {/* Previous Arrow */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="shrink-0 w-8 h-10 bg-[#DB2777] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronDownSvg className="w-6 h-6 rotate-90" />
            </button>

            {/* Scrollable Page Numbers */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === currentPage;
                  const rotation = getRotationForPage(pageNum);

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`shrink-0 w-10 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border-2 relative ${
                        isCurrent
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {pageNum}
                      {rotation > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-[8px] flex items-center justify-center" style={{ backgroundColor: primaryColor, color: "white" }}>
                          ↻
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="shrink-0 w-8 h-10 bg-[#DB2777] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
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