// ============================================================================
// FILE: app/sitemap.ts
// PURPOSE: Next.js App Router ke liye automatic sitemap - www.zemrev.com
// ============================================================================

import { MetadataRoute } from 'next';
import { converterDynamicDataPart1 } from '@/components/ImageTools/ImageConverter/SeoData/DynamicData-Part1';
import { converterDynamicDataPart2 } from '@/components/ImageTools/ImageConverter/SeoData/DynamicData-Part2';

const BASE_URL = 'https://www.zemrev.com';

// Compressor data
const compressorDynamicData = {
  "jpg-compressor": { slug: "jpg-compressor" },
  "jpeg-compressor": { slug: "jpeg-compressor" },
  "png-compressor": { slug: "png-compressor" },
  "webp-compressor": { slug: "webp-compressor" },
  "gif-compressor": { slug: "gif-compressor" }
};

// Optimizer data
const optimizerDynamicData = {
  "remove-exif-data": { slug: "remove-exif-data" },
  "remove-gps-location": { slug: "remove-gps-location" },
  "fix-image-orientation": { slug: "fix-image-orientation" },
  "optimize-jpg": { slug: "optimize-jpg" },
  "optimize-png": { slug: "optimize-png" },
  "optimize-webp": { slug: "optimize-webp" },
  "strip-image-metadata": { slug: "strip-image-metadata" }
};

// Resizer data
const resizerDynamicData = {
  "resize-image-to-200x200": { slug: "resize-image-to-200x200" },
  "resize-image-to-500x500": { slug: "resize-image-to-500x500" },
  "resize-image-to-1024x1024": { slug: "resize-image-to-1024x1024" },
  "resize-image-to-50x50": { slug: "resize-image-to-50x50" },
  "resize-image-to-100x100": { slug: "resize-image-to-100x100" },
  "resize-image-to-300x300": { slug: "resize-image-to-300x300" },
  "resize-image-to-800x800": { slug: "resize-image-to-800x800" },
  "resize-image-to-2048x2048": { slug: "resize-image-to-2048x2048" }
};

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/image/extract-color-palette`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/extract-meta-data`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/image-compressor`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/image-converter`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/image-cropper`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/image-optimizer`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/image-resizer`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/image/image-watermark`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/legal/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/contact-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/my-files`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    // PDF pages
    {
      url: `${BASE_URL}/pdf/images-to-pdf`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-a`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-compressor`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-crop`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-flatten`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-image-extract`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-merge`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-ocr`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-optimize`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-rotate`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-secure`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-sign`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-split`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-text-extract`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-to-images`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-unlock`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/pdf-watermark`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pdf/remove-pdf-pages`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic converter pages (Part 1 aur Part 2)
  const converterPages = [
    ...Object.values(converterDynamicDataPart1),
    ...Object.values(converterDynamicDataPart2)
  ].map(item => ({
    url: `${BASE_URL}/image/image-converter/${item.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic compressor pages
  const compressorPages = Object.values(compressorDynamicData).map(item => ({
    url: `${BASE_URL}/image/image-compressor/${item.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic optimizer pages
  const optimizerPages = Object.values(optimizerDynamicData).map(item => ({
    url: `${BASE_URL}/image/image-optimizer/${item.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic resizer pages
  const resizerPages = Object.values(resizerDynamicData).map(item => ({
    url: `${BASE_URL}/image/image-resizer/${item.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Sab pages ko combine karein
  return [
    ...staticPages,
    ...converterPages,
    ...compressorPages,
    ...optimizerPages,
    ...resizerPages,
  ];
}