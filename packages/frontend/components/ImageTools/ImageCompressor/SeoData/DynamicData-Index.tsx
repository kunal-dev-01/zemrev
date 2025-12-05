// ImageCompressor/SeoData/DynamicData-Index.tsx

import { compressorDynamicData } from './DynamicData';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export { compressorDynamicData };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get compressor data by slug
 * @param slug - The compressor slug (e.g., 'jpg-compressor')
 * @returns Compressor data or undefined if not found
 */
export const getCompressorData = (slug: string) => {
  return compressorDynamicData[slug as keyof typeof compressorDynamicData];
};

/**
 * Get all compressor slugs
 * @returns Array of all available compressor slugs
 */
export const getAllCompressorSlugs = () => {
  return Object.keys(compressorDynamicData);
};

/**
 * Get compressor by format
 * @param format - Format (e.g., 'jpg', 'png')
 * @returns Compressor data for the specified format
 */
export const getCompressorByFormat = (format: string) => {
  const slug = `${format.toLowerCase()}-compressor`;
  return getCompressorData(slug);
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CompressorData = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export type CompressorSlug = keyof typeof compressorDynamicData;