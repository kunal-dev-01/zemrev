// ImageResizer/SeoData/DynamicData-Index.tsx

import { resizerDynamicData } from './DynamicData';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export { resizerDynamicData };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get resizer data by slug
 * @param slug - The resizer slug (e.g., 'resize-image-to-200x200')
 * @returns Resizer data or undefined if not found
 */
export const getResizerData = (slug: string) => {
  return resizerDynamicData[slug as keyof typeof resizerDynamicData];
};

/**
 * Get all resizer slugs
 * @returns Array of all available resizer slugs
 */
export const getAllResizerSlugs = () => {
  return Object.keys(resizerDynamicData);
};

/**
 * Check if slug is valid
 * @param slug - The slug to check
 * @returns Boolean indicating if slug exists
 */
export const isValidResizerSlug = (slug: string): boolean => {
  return slug in resizerDynamicData;
};

/**
 * Get dimension-based slugs
 * @returns Array of slugs for specific dimensions
 */
export const getDimensionBasedSlugs = () => {
  return Object.keys(resizerDynamicData).filter(
    slug => slug.includes('to-') && /\d+x\d+/.test(slug)
  );
};

/**
 * Get platform-based slugs
 * @returns Array of slugs for social media platforms
 */
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