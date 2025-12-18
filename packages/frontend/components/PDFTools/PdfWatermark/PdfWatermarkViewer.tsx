// ============================================================================
// FILE: src/app/tools/pdf-watermark/PdfWatermarkViewer.tsx
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import type {
  PdfFileSettings,
  SignatureItem,
} from "@/services/pdfService/types";
import { DraggableWatermark } from "./DraggableWatermark";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfWatermarkViewerProps {
  file: File;
  settings: PdfFileSettings;
  primaryColor: string;
  onUpdateWatermark: (
    watermarkId: string,
    updates: Partial<SignatureItem>
  ) => void;
  onDeleteWatermark: (watermarkId: string) => void;
  onSelectWatermark: (watermarkId: string) => void;
  selectedWatermarkId: string | null;
  activePage: number;
  onPageChange: (page: number) => void;
  onDimensionsChange?: (width: number, height: number) => void;
}

export const PdfWatermarkViewer = ({
  file,
  settings,
  primaryColor,
  onUpdateWatermark,
  onDeleteWatermark,
  onSelectWatermark,
  selectedWatermarkId,
  activePage,
  onPageChange,
  onDimensionsChange,
}: PdfWatermarkViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(activePage);

  useEffect(() => {
    setCurrentPage(activePage);
  }, [activePage]);

  const [pageWidth, setPageWidth] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const [renderedHeight, setRenderedHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  const scale =
    pageWidth > 0 && renderedWidth > 0 ? renderedWidth / pageWidth : 1;

  const currentPageWatermarks = (settings.signatures || []).filter(
    (wm) => wm.page === -1 || wm.page === currentPage - 1
  );

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectWatermark("");
    }
  };

  const handlePrevPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    onPageChange(newPage);
  };

  const handleNextPage = () => {
    if (!numPages) return;
    const newPage = Math.min(numPages, currentPage + 1);
    setCurrentPage(newPage);
    onPageChange(newPage);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Preview (Page {currentPage}/{numPages || "?"})
        </span>
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90" />
            </button>
            <span className="text-xs font-mono w-10 text-center">
              {currentPage}/{numPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center py-4 min-h-[400px]"
        onClick={handleBackgroundClick}
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="text-xs text-zinc-500 mt-10">Loading PDF...</div>
          }
        >
          <div className="shadow-lg relative inline-block">
            <Page
              pageNumber={currentPage}
              width={containerWidth > 600 ? 500 : containerWidth - 32}
              onLoadSuccess={(page) => {
                setPageWidth(page.originalWidth);
                setTimeout(() => {
                  const canvas = document.querySelector(
                    `.react-pdf__Page[data-page-number="${currentPage}"] canvas`
                  );
                  if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    setRenderedWidth(rect.width);
                    setRenderedHeight(rect.height);
                    if (onDimensionsChange) {
                      onDimensionsChange(
                        page.originalWidth,
                        page.originalHeight
                      );
                    }
                  }
                }, 100);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            >
              {currentPageWatermarks.map((watermark) => (
                <DraggableWatermark
                  key={watermark.id}
                  watermark={watermark}
                  scale={scale}
                  primaryColor={primaryColor}
                  onUpdate={(updates) =>
                    onUpdateWatermark(watermark.id, updates)
                  }
                  onDelete={() => onDeleteWatermark(watermark.id)}
                  isSelected={selectedWatermarkId === watermark.id}
                  onSelect={() => onSelectWatermark(watermark.id)}
                  containerWidth={renderedWidth}
                  containerHeight={renderedHeight}
                />
              ))}
            </Page>
          </div>
        </Document>
      </div>
    </div>
  );
};
