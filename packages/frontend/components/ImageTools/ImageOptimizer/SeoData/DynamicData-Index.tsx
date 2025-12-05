// ImageOptimizer/SeoData/DynamicData-Index.tsx

import { optimizerDynamicData } from './DynamicData';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export { optimizerDynamicData };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get optimizer data by slug
 * @param slug - The optimizer slug (e.g., 'remove-exif-data')
 * @returns Optimizer data or undefined if not found
 */
export const getOptimizerData = (slug: string) => {
  return optimizerDynamicData[slug as keyof typeof optimizerDynamicData];
};

/**
 * Get all optimizer slugs
 * @returns Array of all available optimizer slugs
 */
export const getAllOptimizerSlugs = () => {
  return Object.keys(optimizerDynamicData);
};

/**
 * Check if slug is valid
 * @param slug - The slug to check
 * @returns Boolean indicating if slug exists
 */
export const isValidOptimizerSlug = (slug: string): boolean => {
  return slug in optimizerDynamicData;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type OptimizerData = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export type OptimizerSlug = keyof typeof optimizerDynamicData;