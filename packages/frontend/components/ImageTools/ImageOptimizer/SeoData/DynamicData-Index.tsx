// ImageOptimizer/SeoData/DynamicData-Index.tsx

import { optimizerDynamicData } from './DynamicData';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export { optimizerDynamicData };

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getOptimizerData = (slug: string) => {
  return optimizerDynamicData[slug as keyof typeof optimizerDynamicData];
};

export const getAllOptimizerSlugs = () => {
  return Object.keys(optimizerDynamicData);
};

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