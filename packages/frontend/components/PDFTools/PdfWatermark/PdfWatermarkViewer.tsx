import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
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
  const [pageWidth, setPageWidth] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // Calculate Scale (Pixels per Point)
  const scale = pageWidth > 0 && renderedWidth > 0 ? renderedWidth / pageWidth : 1;

  // COORDINATE-BASED POSITIONING (like Sign PDF)
  const getWatermarkStyle = (): React.CSSProperties => {
    const x = (settings.x || 150) * scale;
    const y = (settings.y || 350) * scale;
    const width = (settings.width || 300) * scale;
    const height = (settings.height || 150) * scale;

    return {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: 20,
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `rotate(${settings.rotation || 0}deg)`,
      transformOrigin: "center center",
      opacity: settings.opacity || 0.3,
      border: "2px dashed rgba(192, 38, 211, 0.3)",
      backgroundColor: "rgba(192, 38, 211, 0.05)",
      borderRadius: "4px",
    };
  };

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
            <Page
              pageNumber={currentPage}
              width={containerWidth > 600 ? 500 : containerWidth - 32}
              onLoadSuccess={(page) => {
                setPageWidth(page.originalWidth);
                const canvas = document.querySelector(`.react-pdf__Page[data-page-number="${currentPage}"] canvas`);
                if (canvas) setRenderedWidth(canvas.getBoundingClientRect().width);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            >
              {/* WATERMARK PREVIEW - COORDINATE BASED */}
              <div style={getWatermarkStyle()}>
                {settings.watermarkFile && imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="watermark"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: `${Math.min((settings.font_size || 50) * scale, ((settings.height || 150) * scale) / 2)}px`,
                      color: settings.color || "gray",
                      fontWeight: "bold",
                      textAlign: "center",
                      padding: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {settings.text || "WATERMARK"}
                  </div>
                )}
              </div>
            </Page>
          </div>
        </Document>
      </div>
    </div>
  );
};