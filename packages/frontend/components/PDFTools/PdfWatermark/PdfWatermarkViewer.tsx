import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { DraggableWatermark } from "./DraggableWatermark";
import type { PdfFileSettings } from "@/services/pdfService/types";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfWatermarkViewerProps {
  file: File;
  settings: PdfFileSettings;
  primaryColor: string;
  onUpdate: (updates: Partial<PdfFileSettings>) => void;
}

export const PdfWatermarkViewer = ({
  file,
  settings,
  primaryColor,
  onUpdate,
}: PdfWatermarkViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const [renderedHeight, setRenderedHeight] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showWatermark, setShowWatermark] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Load Image Preview
  useEffect(() => {
    if (settings.watermarkFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(settings.watermarkFile as File);
    } else {
      setImagePreview(null);
    }
  }, [settings.watermarkFile]);

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

  // Reset watermark when deleted
  useEffect(() => {
    setShowWatermark(true);
  }, [settings.text, settings.watermarkFile]);

  // Calculate Scale (Pixels per Point)
  const scale = pageWidth > 0 && renderedWidth > 0 ? renderedWidth / pageWidth : 1;

  // Handle Delete
  const handleDelete = () => {
    setShowWatermark(false);
    // Reset to default position
    onUpdate({
      x: 150,
      y: 350,
      width: 300,
      height: 150,
    });
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
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
                  }
                }, 100);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            >
              {/* DRAGGABLE WATERMARK */}
              {showWatermark && (
                <DraggableWatermark
                  settings={settings}
                  scale={scale}
                  primaryColor={primaryColor}
                  imagePreview={imagePreview}
                  onUpdate={onUpdate}
                  onDelete={handleDelete}
                  containerWidth={renderedWidth}
                  containerHeight={renderedHeight}
                />
              )}
            </Page>
          </div>
        </Document>
      </div>
    </div>
  );
};