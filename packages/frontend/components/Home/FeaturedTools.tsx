import ToolsGrid, { ToolItem } from "./ToolsGrid";
import {
  FileImage,
  Minimize2,
  ResizeSvg,
  ArrowRightLeft,
  CropSvg,
  Watermark,
  MetadataSvg,
  ColorPaletteSvg,
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

const imageTools: ToolItem[] = [
  {
    title: "Image Converter",
    desc: "Convert between JPG, PNG, WebP, and AVIF instantly.",
    icon: ArrowRightLeft,
    link: "/image/image-converter",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Image Compressor",
    desc: "Reduce file size up to 80% without losing visible quality.",
    icon: Minimize2,
    link: "/image/image-compressor",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Image Optimizer",
    desc: "Optimize your images for maximum clarity and minimum size.",
    icon: FileImage,
    link: "/image/image-optimizer",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    title: "Image Resizer",
    desc: "Smart image resizing that keeps every detail sharp.",
    icon: ResizeSvg,
    link: "/image/image-resizer",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    title: "Image Cropper",
    desc: "Crop and frame your images with precision in seconds.",
    icon: CropSvg,
    link: "/image/image-cropper",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    title: "Watermark Tool",
    desc: "Add clean, professional watermarks to protect your images.",
    icon: Watermark,
    link: "/image/image-watermark",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    title: "Metadata Extractor",
    desc: "Extract metadata from your images for easy organization.",
    icon: MetadataSvg,
    link: "/image/extract-meta-data",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-600/10",
  },
  {
    title: "Color Palette Generator",
    desc: "Extract color palettes from your images for design inspiration.",
    icon: ColorPaletteSvg,
    link: "/image/extract-color-palette",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
];

const pdfTools: ToolItem[] = [
  {
    title: "PDF Compressor",
    desc: "Compress PDFs using advanced optimization for smaller, cleaner files.",
    icon: PDFCompressSvg,
    link: "/pdf/pdf-compressor",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-600/10",
  },
  {
    title: "PDF Merger",
    desc: "Combine multiple PDF files into one perfectly organized document.",
    icon: PDFMergerSvg,
    link: "/pdf/pdf-merge",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-600/10",
  },
  {
    title: "PDF Splitter",
    desc: "Split large PDFs into smaller, separate pages or ranges.",
    icon: PDFSplitterSvg,
    link: "/pdf/pdf-split",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-600/10",
  },
  {
    title: "PDF to Images",
    desc: "Convert PDF pages into high-quality PNG or JPG images.",
    icon: PDFToImageSVg,
    link: "/pdf/pdf-to-images",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-600/10",
  },
  {
    title: "Images to PDF",
    desc: "Combine multiple images into a single, well-structured PDF.",
    icon: ImageToPDFSvg,
    link: "/pdf/images-to-pdf",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-600/10",
  },
  {
    title: "PDF to Word",
    desc: "Convert any PDF into a fully editable Word document.",
    icon: PDFToWordSvg,
    link: "/pdf/pdf-to-word",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-600/10",
  },
  {
    title: "PDF to Excel",
    desc: "Extract tables and convert PDFs to Excel spreadsheets.",
    icon: PDFToExcelSvg,
    link: "/pdf/pdf-to-excel",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-600/10",
  },
  {
    title: "Extract Text from PDF",
    desc: "Extract clean, selectable text from scanned or digital PDFs.",
    icon: ExtractTextFromPdfSvg,
    link: "/pdf/pdf-text-extract",
    color: "text-lime-700",
    bg: "bg-lime-50 dark:bg-lime-700/10",
  },
  {
    title: "Extract Images from PDF",
    desc: "Download all embedded images from any PDF in original quality.",
    icon: ExtractImagesFromPdfSvg,
    link: "/pdf/pdf-image-extract",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-600/10",
  },
  {
    title: "Add Watermark to PDF",
    desc: "Apply text or image watermarks across all PDF pages.",
    icon: PDFWatermarkSvg,
    link: "/pdf/pdf-watermark",
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-600/10",
  },
  {
    title: "Rotate PDF Pages",
    desc: "Rotate any PDF page left, right, or 180 degrees instantly.",
    icon: RotateImageSvg,
    link: "/pdf/pdf-rotate",
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-600/10",
  },
  {
    title: "Secure PDF",
    desc: "Add password protection and encrypt your PDF files.",
    icon: SecurePdfSvg,
    link: "/pdf/pdf-secure",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-600/10",
  },
  {
    title: "Unlock PDF",
    desc: "Remove password protection from unlocked or accessible PDFs.",
    icon: UnlockPdfSvg,
    link: "/pdf/pdf-unlock",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-600/10",
  },
  {
    title: "PDF Optimizer",
    desc: "Clean, optimize, and reduce PDF clutter without quality loss.",
    icon: PDFOptimizerSvg,
    link: "/pdf/pdf-optimize",
    color: "text-lime-600",
    bg: "bg-lime-50 dark:bg-lime-600/10",
  },
  {
    title: "PDF to HTML",
    desc: "Convert PDFs into clean, structured HTML pages.",
    icon: PDFToHTMLSvg,
    link: "/pdf/pdf-to-html",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-600/10",
  },
  {
    title: "PDF to Text",
    desc: "Convert PDF documents to plain, editable text files.",
    icon: PDFToTextSvg,
    link: "/pdf/pdf-to-text",
    color: "text-zinc-600",
    bg: "bg-zinc-50 dark:bg-zinc-600/10",
  },
  {
    title: "PDF to EPUB",
    desc: "Convert your PDFs into EPUB format for eBook readers.",
    icon: PDFToEPUB,
    link: "/pdf/pdf-to-epub",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-600/10",
  },
  {
    title: "PDF to CSV",
    desc: "Extract table data from PDFs and export as CSV files.",
    icon: PDFToCSV,
    link: "/pdf/pdf-to-csv",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-600/10",
  },
];

const FeaturedTools = () => {
  return (
    <section className="w-full" id="tools">
      <ToolsGrid
        title="Ultimate Image Toolkit"
        subtitle="Everything you need to manage and transform your images."
        tools={imageTools}
      />

      <ToolsGrid
        title="Powerful PDF Tools"
        subtitle="Effortlessly refine your PDFs with stunning precision."
        tools={pdfTools}
      />
    </section>
  );
};

export default FeaturedTools;
