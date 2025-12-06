import Link from "next/link";
import { memo } from "react";

/* ================= Footer Links ================= */
const footerLinks = {
  company: [
    { name: "About Us", href: "/legal?page=about" },
    { name: "Contact", href: "/legal?page=contact" },
  ],

  legal: [
    { name: "Privacy Policy", href: "/legal?page=privacy" },
    { name: "Terms of Service", href: "/legal?page=terms" },
    { name: "Disclaimer", href: "/legal?page=disclaimer" },
  ],

  imageTools: [
    { name: "Image Converter", href: "/image/image-converter" },
    { name: "Image Compressor", href: "/image/image-compressor" },
    { name: "Image Resizer", href: "/image/image-resizer" },
    { name: "Image Optimizer", href: "/image/image-optimizer" },
    { name: "Image Cropper", href: "/image/image-cropper" },
    { name: "Watermark Tool", href: "/image/image-watermark" },
  ],

  pdfTools: [
    { name: "Compress PDF", href: "/pdf/pdf-compressor" },
    { name: "Convert to CSV", href: "/pdf/pdf-to-csv" },
    { name: "Convert to EPUB", href: "/pdf/pdf-to-epub" },
    { name: "Convert to Excel", href: "/pdf/pdf-to-excel" },
    { name: "Convert to HTML", href: "/pdf/pdf-to-html" },
    { name: "Convert to Images", href: "/pdf/pdf-to-images" },
    { name: "Convert to Text", href: "/pdf/pdf-to-text" },
    { name: "Convert to Word", href: "/pdf/pdf-to-word" },
    { name: "Extract Images", href: "/pdf/pdf-image-extract" },
    { name: "Extract Text", href: "/pdf/pdf-text-extract" },
    { name: "Images to PDF", href: "/pdf/images-to-pdf" },
    { name: "Add Watermark", href: "/pdf/pdf-watermark" },
    { name: "Merge PDF", href: "/pdf/pdf-merge" },
    { name: "Optimize PDF", href: "/pdf/pdf-optimize" },
    { name: "Rotate Pages", href: "/pdf/pdf-rotate" },
    { name: "Secure PDF", href: "/pdf/pdf-secure" },
    { name: "Split PDF", href: "/pdf/pdf-split" },
    { name: "Unlock PDF", href: "/pdf/pdf-unlock" },
  ],
};

/* ================= Section Component ================= */
type FooterLink = { name: string; href: string };
type FooterSectionProps = { title: string; links: FooterLink[] };

const FooterSection = memo(({ title, links }: FooterSectionProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
      {title}
    </h3>

    <ul className="space-y-1">
      {links.map((link) => (
        <li key={link.name}>
          <Link
            href={link.href}
            className="text-sm text-zinc-500 dark:text-zinc-400 
              hover:text-zinc-800 dark:hover:text-zinc-200 
              transition-colors relative inline-block group"
          >
            {link.name}
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
));

FooterSection.displayName = "FooterSection";

/* ================= Footer ================= */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full p-6 md:p-12 rounded-xl 
      bg-white/50 dark:bg-zinc-900/40 
      border border-zinc-200 dark:border-zinc-800"
    >
      {/* Brand Section */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Zemrev.
        </h2>
        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Superfast, privacy-focused tools built for creators, developers, and
          anyone who values speed without compromise.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-10">
        
        {/* Image Tools */}
        <div>
          <h3 className="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b-2 border-zinc-300 dark:border-zinc-700">
            Image Tools
          </h3>
          <ul className="space-y-2.5">
            {footerLinks.imageTools.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 
                    hover:text-zinc-900 dark:hover:text-zinc-100 
                    transition-colors inline-block relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* PDF Tools */}
        <div className="md:col-span-2">
          <h3 className="font-bold text-base md:text-lg text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b-2 border-zinc-300 dark:border-zinc-700">
            PDF Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
            {footerLinks.pdfTools.map((tool) => (
              <div key={tool.name}>
                <Link
                  href={tool.href}
                  className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 
                    hover:text-zinc-900 dark:hover:text-zinc-100 
                    transition-colors inline-block relative group"
                >
                  {tool.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company & Legal */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <FooterSection title="Company" links={footerLinks.company} />
        <FooterSection title="Legal" links={footerLinks.legal} />
      </div>

      {/* Bottom Section */}
      <div
        className="border-t border-zinc-200 dark:border-zinc-800 
        pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 text-center md:text-left">
          © {year} Zemrev. Built for performance. Engineered for privacy.
        </p>

        <div className="flex gap-4">
          {['Twitter', 'GitHub', 'Discord'].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 
                hover:bg-zinc-300 dark:hover:bg-zinc-700 
                transition-all cursor-pointer flex items-center justify-center"
            >
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);