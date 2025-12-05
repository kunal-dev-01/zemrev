// ============================================================================
// FILE: /ImageConverter/SeoData/DynamicData-Index.tsx
// PURPOSE: Main index file that combines all dynamic data parts
// ============================================================================

import { converterDynamicDataPart1 } from './DynamicData-Part1';
import { converterDynamicDataPart2 } from './DynamicData-Part2';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

/**
 * Combined converter dynamic data from all parts
 * Use this export to access all converter configurations
 */
export const converterDynamicData = {
  ...converterDynamicDataPart1,
  ...converterDynamicDataPart2
};

// ============================================================================
// INDIVIDUAL PART EXPORTS (Optional - if you need specific parts)
// ============================================================================

export { converterDynamicDataPart1 } from './DynamicData-Part1';
export { converterDynamicDataPart2 } from './DynamicData-Part2';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get converter data by slug
 * @param slug - The converter slug (e.g., 'jpg-to-png')
 * @returns Converter data or undefined if not found
 */
export const getConverterData = (slug: string) => {
  return converterDynamicData[slug as keyof typeof converterDynamicData];
};

/**
 * Get all converter slugs
 * @returns Array of all available converter slugs
 */
export const getAllConverterSlugs = () => {
  return Object.keys(converterDynamicData);
};

/**
 * Get converters by source format
 * @param format - Source format (e.g., 'jpg', 'png')
 * @returns Array of converter data for the specified format
 */
export const getConvertersBySourceFormat = (format: string) => {
  const lowerFormat = format.toLowerCase();
  return Object.entries(converterDynamicData)
    .filter(([slug]) => slug.startsWith(`${lowerFormat}-to-`))
    .map(([_, data]) => data);
};

/**
 * Get converters by target format
 * @param format - Target format (e.g., 'jpg', 'png')
 * @returns Array of converter data for the specified format
 */
export const getConvertersByTargetFormat = (format: string) => {
  const lowerFormat = format.toLowerCase();
  return Object.entries(converterDynamicData)
    .filter(([slug]) => slug.endsWith(`-to-${lowerFormat}`))
    .map(([_, data]) => data);
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ConverterData = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export type ConverterSlug = keyof typeof converterDynamicData;