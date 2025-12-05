import Link from "next/link";
import { memo, useCallback, FC } from "react";
import clsx from "clsx";
import { useCommonModal } from "@/hooks/appHooks/common.hooks";
import { SidebarCloseSvg } from "@/components/Svg/NavSvg";
import {
  ResizeSvg,
  Minimize2,
  ArrowRightLeft,
  FileImage,
  CropSvg,
  Watermark,
} from "@/components/Svg/HomeSvg";
import {
  ExtractImagesFromPdfSvg,
  ExtractTextFromPdfSvg,
  ImageToPDFSvg,
  PDFCompressSvg,
  PDFMergerSvg,
  PDFOptimizerSvg,
  PDFSplitterSvg,
  PDFToCSV,
  PDFToEPUB,
  PDFToExcelSvg,
  PDFToHTMLSvg,
  PDFToImageSVg,
  PDFToTextSvg,
  PDFToWordSvg,
  PDFWatermarkSvg,
  RotateImageSvg,
  SecurePdfSvg,
  UnlockPdfSvg,
} from "@/components/Svg/PdfSvg";

/* ================= Tools List ================= */
const ImageTools = [
  { name: "Image Converter", href: "/image/image-converter", icon: ArrowRightLeft },
  { name: "Image Compressor", href: "/image/image-compressor", icon: Minimize2 },
  { name: "Image Optimizer", href: "/image/image-optimizer", icon: FileImage },
  { name: "Image Resizer", href: "/image/image-resizer", icon: ResizeSvg },
  { name: "Image Cropper", href: "/image/image-cropper", icon: CropSvg },
  { name: "Watermark Tool", href: "/image/image-watermark", icon: Watermark },
];

const PDFTools = [
  { name: "PDF Compressor", href: "/pdf/pdf-compressor", icon: PDFCompressSvg },
  { name: "PDF Merger", href: "/pdf/pdf-merge", icon: PDFMergerSvg },
  { name: "PDF Splitter", href: "/pdf/pdf-split", icon: PDFSplitterSvg },
  { name: "PDF to Images", href: "/pdf/pdf-to-images", icon: PDFToImageSVg },
  { name: "Images to PDF", href: "/pdf/images-to-pdf", icon: ImageToPDFSvg },
  { name: "PDF to Word", href: "/pdf/pdf-to-word", icon: PDFToWordSvg },
  { name: "PDF to Excel", href: "/pdf/pdf-to-excel", icon: PDFToExcelSvg },
  { name: "Extract Text from PDF", href: "/pdf/pdf-text-extract", icon: ExtractTextFromPdfSvg },
  { name: "Extract Images from PDF", href: "/pdf/pdf-image-extract", icon: ExtractImagesFromPdfSvg },
  { name: "Add Watermark to PDF", href: "/pdf/pdf-watermark", icon: PDFWatermarkSvg },
  { name: "Rotate PDF Pages", href: "/pdf/pdf-rotate", icon: RotateImageSvg },
  { name: "Secure PDF", href: "/pdf/pdf-secure", icon: SecurePdfSvg },
  { name: "Unlock PDF", href: "/pdf/pdf-unlock", icon: UnlockPdfSvg },
  { name: "PDF Optimizer", href: "/pdf/pdf-optimize", icon: PDFOptimizerSvg },
  { name: "PDF to HTML", href: "/pdf/pdf-to-html", icon: PDFToHTMLSvg },
  { name: "PDF to Text", href: "/pdf/pdf-to-text", icon: PDFToTextSvg },
  { name: "PDF to EPUB", href: "/pdf/pdf-to-epub", icon: PDFToEPUB },
  { name: "PDF to CSV", href: "/pdf/pdf-to-csv", icon: PDFToCSV },
];

/* ================= Backdrop ================= */
const Backdrop: FC<{ isOpen: boolean; onClick: () => void }> = memo(
  ({ isOpen, onClick }) => (
    <div
      onClick={onClick}
      className={clsx(
        "fixed inset-0 z-40 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-300",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    />
  )
);
Backdrop.displayName = "Backdrop";

/* ================= Header ================= */
const Header: FC<{ onToggle: () => void }> = memo(({ onToggle }) => (
  <div className="flex items-center p-1 rounded-xl border-2 border-zinc-100/80 dark:border-zinc-900/50 bg-zinc-100/10 dark:bg-zinc-900/10">
    <button
      aria-label="Toggle sidebar"
      onClick={onToggle}
      className="rounded-lg text-zinc-700 dark:text-zinc-300 w-8 md:w-9"
    >
      <SidebarCloseSvg />
    </button>

    <h2 className="mx-auto text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
      Explore Tools
    </h2>
  </div>
));
Header.displayName = "Header";

/* ================= Tool Section ================= */
const ToolSection: FC<{ title: string; tools: typeof ImageTools; onClose: () => void }> = memo(
  ({ title, tools, onClose }) => (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2 px-1">
        {title}
      </h3>
      <div className="space-y-2">
        {tools.map((tool, index) => (
          <Link
            key={index}
            href={tool.href}
            onClick={onClose}
            className="relative flex items-center gap-3 px-3 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 group"
          >
            <div className="w-7 h-7 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              <tool.icon />
            </div>

            <span className="text-md font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              {tool.name}
            </span>

            <div className="absolute inset-0 rounded-lg -z-2 bg-zinc-200 dark:bg-zinc-900 opacity-0 group-hover:opacity-100 scale-80 group-hover:scale-100 transition-all duration-300" />
          </Link>
        ))}
      </div>
    </div>
  )
);
ToolSection.displayName = "ToolSection";

/* ================= Sidebar ================= */
const SideBar: FC = () => {
  const { isOpenSidebar, setOpenSidebar } = useCommonModal();

  const toggleSidebar = useCallback(() => {
    setOpenSidebar(false);
  }, [setOpenSidebar]);

  const closeSidebar = useCallback(() => {
    setOpenSidebar(false);
  }, [setOpenSidebar]);

  return (
    <>
      <Backdrop isOpen={isOpenSidebar} onClick={closeSidebar} />

      <aside
        className={clsx(
          "fixed top-0 right-0 z-50 h-screen w-full md:w-[17vw] p-3 flex flex-col rounded-none md:rounded-l-xl bg-zinc-50 dark:bg-[#0a0a0a] transition-transform duration-300 ease-in-out",
          isOpenSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Header onToggle={toggleSidebar} />

        {/* Tool List */}
        <div className="flex-1 overflow-y-auto my-4 p-3 rounded-xl border-2 border-zinc-100/80 dark:border-zinc-900/50 bg-zinc-100/10 dark:bg-zinc-900/10 custom-scrollbar scrollbar-hide">
          <ToolSection title="Image Tools" tools={ImageTools} onClose={closeSidebar} />
          <ToolSection title="PDF Tools" tools={PDFTools} onClose={closeSidebar} />
        </div>
      </aside>
    </>
  );
};

export default memo(SideBar);