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
    { name: "PDF to JPG", href: "/pdf/pdf-to-jpg" },
    { name: "JPG to PDF", href: "/pdf/jpg-to-pdf" },
    { name: "Compress PDF", href: "/pdf/compress-pdf" },
    { name: "Merge PDF", href: "/pdf/merge-pdf" },
    { name: "Split PDF", href: "/pdf/split-pdf" },
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
              transition-colors"
          >
            {link.name}
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
      className="w-full p-8 md:p-12 rounded-xl 
      bg-white/50 dark:bg-zinc-900/40 
      border border-zinc-200 dark:border-zinc-800 
      backdrop-blur-sm"
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
        
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Zemrev.
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            Superfast, privacy-focused tools built for creators, developers, and
            anyone who values speed without compromise.
          </p>
        </div>

        {/* Sections */}
        <FooterSection title="Company" links={footerLinks.company} />
        <FooterSection title="Legal" links={footerLinks.legal} />
        <FooterSection title="Image Tools" links={footerLinks.imageTools} />
        <FooterSection title="PDF Tools" links={footerLinks.pdfTools} />
      </div>

      {/* Bottom Section */}
      <div
        className="border-t border-zinc-200 dark:border-zinc-800 
        pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          © {year} Zemrev. Built for performance. Engineered for privacy.
        </p>

        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 transition-colors"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
