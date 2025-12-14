// ============================================================================
// FILE: src/components/PDFTools/PdfWatermark/PdfWatermarkViewer.tsx
// PDF preview with watermark overlay visualization
// ============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PdfFileSettings } from "@/services/pdfService/types";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfWatermarkViewerProps {
  file: File;
  settings: PdfFileSettings;
  primaryColor: string;
}

export const PdfWatermarkViewer = ({
  file,
  settings,
  primaryColor,
}: PdfWatermarkViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(612);
  const [pageHeight, setPageHeight] = useState(792);
  const [containerWidth, setContainerWidth] = useState(700);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scale = containerWidth / pageWidth;

  // ============================================================================
  // LOAD IMAGE PREVIEW
  // ============================================================================
  useEffect(() => {
    if (settings.watermarkFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(settings.watermarkFile as File);
    } else {
      setImagePreview(null);
    }
  }, [settings.watermarkFile]);

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
  // SCROLL HANDLER
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
      const parent = document.getElementById("pdf-watermark-container");
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
  // WATERMARK POSITION
  // ============================================================================
  const getWatermarkPosition = () => {
    const positions = {
      center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      top_left: { top: "10%", left: "10%" },
      top_right: { top: "10%", right: "10%" },
      bottom_left: { bottom: "10%", left: "10%" },
      bottom_right: { bottom: "10%", right: "10%" },
    };

    return positions[settings.position as keyof typeof positions] || positions.center;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div id="pdf-watermark-container" className="w-full">
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

      {/* PDF viewer with watermark overlay */}
      <div
        ref={scrollContainerRef}
        className="relative bg-zinc-50 dark:bg-zinc-900 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 overflow-y-auto overflow-x-hidden shadow-lg"
        style={{
          maxHeight: "70vh",
          scrollBehavior: "smooth",
        }}
      >
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-96 gap-3">
            <div
              className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
              style={{
                borderColor: `${primaryColor}40`,
                borderTopColor: "transparent",
              }}
            />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading PDF...
            </p>
          </div>
        )}

        {/* PDF + Watermark */}
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

            {/* Watermark Overlay */}
            {!loading && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className="absolute"
                  style={{
                    ...getWatermarkPosition(),
                    opacity: settings.opacity || 0.3,
                    transform: `${getWatermarkPosition() || ""} rotate(${
                      settings.rotation || 45
                    }deg)`,
                  }}
                >
                  {/* Text Watermark */}
                  {!settings.watermarkFile && (
                    <div
                      className="font-bold whitespace-nowrap select-none"
                      style={{
                        fontSize: `${(settings.font_size || 50) * scale}px`,
                        color: settings.color || "gray",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {settings.text || "WATERMARK"}
                    </div>
                  )}

                  {/* Image Watermark */}
                  {settings.watermarkFile && imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Watermark"
                      className="max-w-none select-none"
                      style={{
                        width: `${containerWidth * 0.25}px`,
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll spacer */}
        {numPages && numPages > 1 && (
          <div style={{ height: `${(numPages - 1) * 300}px` }} />
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          👁️ Preview with watermark
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