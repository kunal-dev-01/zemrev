// ============================================================================
// FILE: /ImageConverter/SeoData/DynamicData-Index.tsx
// PURPOSE: Main index file that combines all dynamic data parts
// ============================================================================

import { converterDynamicDataPart1 } from './DynamicData-Part1';
import { converterDynamicDataPart2 } from './DynamicData-Part2';

// ============================================================================
// COMBINED EXPORT
// ============================================================================

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

export const getConverterData = (slug: string) => {
  return converterDynamicData[slug as keyof typeof converterDynamicData];
};

export const getAllConverterSlugs = () => {
  return Object.keys(converterDynamicData);
};

export const getConvertersBySourceFormat = (format: string) => {
  const lowerFormat = format.toLowerCase();
  return Object.entries(converterDynamicData)
    .filter(([slug]) => slug.startsWith(`${lowerFormat}-to-`))
    .map(([_, data]) => data);
};

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