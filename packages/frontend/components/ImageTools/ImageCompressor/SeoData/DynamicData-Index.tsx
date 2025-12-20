// ImageCompressor/SeoData/DynamicData-Index.tsx

import { compressorDynamicData } from './DynamicData';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export { compressorDynamicData };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getCompressorData = (slug: string) => {
  return compressorDynamicData[slug as keyof typeof compressorDynamicData];
};

export const getAllCompressorSlugs = () => {
  return Object.keys(compressorDynamicData);
};

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