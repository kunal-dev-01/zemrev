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

  // Handle Resize
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

  // Parse rotation settings to get angle for current page
  const getRotationForPage = (pageNum: number): number => {
    const rotations = settings.rotations || "all:90";
    const parts = rotations.split(":");
    
    if (parts.length !== 2) return 0;

    const [pages, angle] = parts;
    const rotationAngle = parseInt(angle) || 0;

    // Check if this page should be rotated
    if (pages === "all") return rotationAngle;

    // Parse page ranges (e.g., "1,3,5" or "1-5" or "1,3-5,8")
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

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Preview</span>
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90" />
            </button>
            <span className="text-xs font-mono w-10 text-center">{currentPage}/{numPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30"
            >
              <ChevronDownSvg className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center py-4 min-h-[300px]"
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="text-xs text-zinc-500 mt-10">Loading PDF...</div>}
        >
          <div className="shadow-lg relative inline-block">
            <div 
              style={{
                transform: `rotate(${currentRotation}deg)`,
                transition: "transform 0.3s ease-in-out",
              }}
            >
              <Page
                pageNumber={currentPage}
                width={containerWidth > 600 ? 500 : containerWidth - 32}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="bg-white"
              />
            </div>

            {/* Rotation Indicator */}
            {currentRotation > 0 && (
              <div 
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg"
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

      
    </div>
  );
};