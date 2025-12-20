// ImageResizer/SeoData/DynamicData-Index.tsx

import { resizerDynamicData } from './DynamicData';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export { resizerDynamicData };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getResizerData = (slug: string) => {
  return resizerDynamicData[slug as keyof typeof resizerDynamicData];
};

export const getAllResizerSlugs = () => {
  return Object.keys(resizerDynamicData);
};

export const isValidResizerSlug = (slug: string): boolean => {
  return slug in resizerDynamicData;
};

export const getDimensionBasedSlugs = () => {
  return Object.keys(resizerDynamicData).filter(
    slug => slug.includes('to-') && /\d+x\d+/.test(slug)
  );
};

export const getPlatformBasedSlugs = () => {
  return Object.keys(resizerDynamicData).filter(
    slug => slug.includes('for-')
  );
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ResizerData = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export type ResizerSlug = keyof typeof resizerDynamicData;