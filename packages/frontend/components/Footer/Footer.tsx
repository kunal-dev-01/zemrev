import Link from "next/link";
import { memo } from "react";

/* ================= Footer Data ================= */
const footerLinks = {
  company: [
    { name: "About Us", href: "/legal?page=about" },
    { name: "Contact Us", href: "/legal?page=contact" },
    { name: "Support", href: "/legal?page=support" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/legal?page=privacy" },
    { name: "Terms of Service", href: "/legal?page=terms" },
    { name: "Disclaimer", href: "/legal?page=disclaimer" },
  ],
  imageTools: [
    { name: "Image Converter", href: "/image/image-converter" },
    { name: "Image Compressor", href: "/image/image-compressor" },
    { name: "Image Optimizer", href: "/image/image-optimizer" },
    { name: "Image Resizer", href: "/image/image-resizer" },
    { name: "Image Cropper", href: "/image/image-cropper" },
    { name: "Watermark Tool", href: "/image/image-watermark" },
    { name: "Metadata Extractor", href: "/image/extract-meta-data" },
    { name: "Color Palette", href: "/image/extract-color-palette" },
  ],
  pdfConvert: [
    { name: "PDF to Images", href: "/pdf/pdf-to-images" },
    { name: "Images to PDF", href: "/pdf/images-to-pdf" },
    { name: "PDF to Text", href: "/pdf/pdf-text-extract" },
    { name: "Extract Images", href: "/pdf/pdf-image-extract" },
    { name: "OCR PDF", href: "/pdf/pdf-ocr" },
    { name: "PDF/A Converter", href: "/pdf/pdf-a" },
  ],
  pdfOrganize: [
    { name: "Merge PDF", href: "/pdf/pdf-merge" },
    { name: "Split PDF", href: "/pdf/pdf-split" },
    { name: "Remove Pages", href: "/pdf/remove-pdf-pages" },
    { name: "Rotate PDF", href: "/pdf/pdf-rotate" },
    { name: "Crop PDF", href: "/pdf/pdf-crop" },
    { name: "Flatten PDF", href: "/pdf/pdf-flatten" },
  ],
  pdfOptimize: [
    { name: "Compress PDF", href: "/pdf/pdf-compressor" },
    { name: "Optimize PDF", href: "/pdf/pdf-optimize" },
    { name: "Sign PDF", href: "/pdf/pdf-sign" },
    { name: "Watermark PDF", href: "/pdf/pdf-watermark" },
    { name: "Secure PDF", href: "/pdf/pdf-secure" },
    { name: "Unlock PDF", href: "/pdf/pdf-unlock" },
  ],
};

/* ================= Reusable Link Component ================= */
const FooterLink = ({ href, name }: { href: string; name: string }) => (
  <li>
    <Link
      href={href}
      className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 
      hover:text-zinc-900 dark:hover:text-zinc-100 
      transition-colors relative inline-block group py-1"
    >
      {name}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
    </Link>
  </li>
);

/* ================= Footer Section ================= */
const FooterSection = ({ title, links }: { title: string; links: { name: string; href: string }[] }) => (
  <div className="flex flex-col gap-3">
    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-2">
      {title}
    </h3>
    <ul className="flex flex-col">
      {links.map((link) => (
        <FooterLink key={link.href} {...link} />
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full mt-12 px-2 py-12 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-8xl mx-auto">
        
        {/* Brand & Intro */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
            Zemrev<span className="text-blue-600">.</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-xl text-lg">
            Superfast, privacy-focused tools for PDF and Image manipulation. 
            No logins, no databases—just pure performance.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10">
          
          {/* Image Tools */}
          <FooterSection title="Image Tools" links={footerLinks.imageTools} />

          {/* PDF Tools (Split into 3) */}
          <FooterSection title="PDF Convert" links={footerLinks.pdfConvert} />
          <FooterSection title="PDF Organize" links={footerLinks.pdfOrganize} />
          <FooterSection title="PDF Security" links={footerLinks.pdfOptimize} />

          {/* Company & Legal (Bigger like requested) */}
          <FooterSection title="Company" links={footerLinks.company} />
          <FooterSection title="Legal" links={footerLinks.legal} />
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            &copy; {year} Zemrev Tools. All rights reserved. Built for the web.
          </p>
          
          <div className="flex gap-6">
            {/* Social icons placeholder */}
            <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:scale-110 transition-transform cursor-pointer" />
            <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:scale-110 transition-transform cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);