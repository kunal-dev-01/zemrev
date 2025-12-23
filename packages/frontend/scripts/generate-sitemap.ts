// ============================================================================
// FILE: scripts/generate-sitemap.ts
// PURPOSE: Static sitemap generate karna for Cloudflare Pages (TypeScript)
// RUN: pnpm tsx scripts/generate-sitemap.ts
// ============================================================================

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.zemrev.com';

// Type definitions
interface SitemapPage {
  url: string;
  priority: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Converter slugs (Part 1 - JPG, PNG, WEBP, AVIF)
const converterPart1Slugs: string[] = [
  // JPG conversions
  "jpg-to-png", "jpg-to-webp", "jpg-to-avif", "jpg-to-gif", 
  "jpg-to-bmp", "jpg-to-tiff", "jpg-to-heic", "jpg-to-heif",
  // PNG conversions
  "png-to-jpg", "png-to-webp", "png-to-avif", "png-to-gif",
  "png-to-bmp", "png-to-tiff", "png-to-heic", "png-to-heif",
  // WEBP conversions
  "webp-to-jpg", "webp-to-png", "webp-to-avif", "webp-to-gif",
  "webp-to-bmp", "webp-to-tiff", "webp-to-heic", "webp-to-heif",
  // AVIF conversions
  "avif-to-jpg", "avif-to-png", "avif-to-webp", "avif-to-gif",
  "avif-to-bmp", "avif-to-tiff", "avif-to-heic", "avif-to-heif"
];

// Converter slugs (Part 2 - TIFF, HEIC, HEIF)
const converterPart2Slugs: string[] = [
  // TIFF conversions
  "tiff-to-jpg", "tiff-to-png", "tiff-to-webp", "tiff-to-avif",
  "tiff-to-gif", "tiff-to-bmp", "tiff-to-heic", "tiff-to-heif",
  // HEIC conversions
  "heic-to-jpg", "heic-to-png", "heic-to-webp", "heic-to-avif",
  "heic-to-gif", "heic-to-bmp", "heic-to-tiff", "heic-to-heif",
  // HEIF conversions
  "heif-to-jpg", "heif-to-png", "heif-to-webp", "heif-to-avif",
  "heif-to-gif", "heif-to-bmp", "heif-to-tiff", "heif-to-heic"
];

// Compressor slugs
const compressorSlugs: string[] = [
  "jpg-compressor", "jpeg-compressor", "png-compressor", 
  "webp-compressor", "gif-compressor"
];

// Optimizer slugs
const optimizerSlugs: string[] = [
  "remove-exif-data", "remove-gps-location", "fix-image-orientation",
  "optimize-jpg", "optimize-png", "optimize-webp", "strip-image-metadata"
];

// Resizer slugs
const resizerSlugs: string[] = [
  "resize-image-to-200x200", "resize-image-to-500x500", 
  "resize-image-to-1024x1024", "resize-image-to-50x50",
  "resize-image-to-100x100", "resize-image-to-300x300",
  "resize-image-to-800x800", "resize-image-to-2048x2048"
];

// Static pages
const staticPages: SitemapPage[] = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/image/extract-color-palette', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/extract-meta-data', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/image-compressor', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/image-converter', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/image-cropper', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/image-optimizer', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/image-resizer', priority: '0.8', changefreq: 'weekly' },
  { url: '/image/image-watermark', priority: '0.8', changefreq: 'weekly' },
  { url: '/legal/about-us', priority: '0.5', changefreq: 'monthly' },
  { url: '/legal/contact-us', priority: '0.5', changefreq: 'monthly' },
  { url: '/legal/disclaimer', priority: '0.5', changefreq: 'monthly' },
  { url: '/legal/privacy-policy', priority: '0.5', changefreq: 'monthly' },
  { url: '/legal/terms-of-service', priority: '0.5', changefreq: 'monthly' },
  { url: '/my-files', priority: '0.6', changefreq: 'weekly' },
  // PDF pages
  { url: '/pdf/images-to-pdf', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-a', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-compressor', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-crop', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-flatten', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-image-extract', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-merge', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-ocr', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-optimize', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-rotate', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-secure', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-sign', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-split', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-text-extract', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-to-images', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-unlock', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/pdf-watermark', priority: '0.8', changefreq: 'weekly' },
  { url: '/pdf/remove-pdf-pages', priority: '0.8', changefreq: 'weekly' }
];

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages add karein
  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  // Dynamic converter pages (Part 1)
  converterPart1Slugs.forEach(slug => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/image/image-converter/${slug}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';
  });

  // Dynamic converter pages (Part 2)
  converterPart2Slugs.forEach(slug => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/image/image-converter/${slug}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';
  });

  // Dynamic compressor pages
  compressorSlugs.forEach(slug => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/image/image-compressor/${slug}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';
  });

  // Dynamic optimizer pages
  optimizerSlugs.forEach(slug => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/image/image-optimizer/${slug}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';
  });

  // Dynamic resizer pages
  resizerSlugs.forEach(slug => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/image/image-resizer/${slug}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';
  
  return sitemap;
}

// Main execution
async function main() {
  try {
    const sitemapContent = generateSitemap();
    const publicDir = path.join(process.cwd(), 'public');

    // Public directory banayein agar nahi hai
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Sitemap file save karein
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    
    const urlCount = sitemapContent.split('<url>').length - 1;
    
    console.log('✅ Sitemap successfully generated!');
    console.log(`📁 Location: public/sitemap.xml`);
    console.log(`📊 Total URLs: ${urlCount}`);
    console.log(`🌐 Will be available at: ${BASE_URL}/sitemap.xml`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();