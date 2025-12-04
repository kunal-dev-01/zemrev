// ============================================================================
// FILE: src/app/image/image-converter/[slug]/page.tsx
// ============================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { 
  getConverterData,
  getAllConverterSlugs,
} from "@/components/ImageTools/ImageConverter/SeoData/DynamicData-Index";
import Index from "@/components/ImageTools/ImageConverter/DynamicConverter/Index";

// ============================================================================
// GENERATE STATIC PARAMS
// ============================================================================

export async function generateStaticParams() {
  // Use utility function from index
  const allSlugs = getAllConverterSlugs();
  return allSlugs.map(slug => ({ slug }));
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;

  // Use utility function to get converter data
  const data = getConverterData(slug);

  // If converter not found, return empty metadata
  if (!data) {
    return {
      title: "Converter Not Found",
      description: "The requested image converter could not be found."
    };
  }

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function ConverterDynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // Use utility function to get converter data
  const data = getConverterData(slug);

  // If converter not found, show 404
  if (!data) {
    return notFound();
  }

  // Extract formats from slug
  const [inputFormat, outputFormat] = slug.split("-to-");

  // Validate formats exist
  if (!inputFormat || !outputFormat) {
    return notFound();
  }

  return (
    <main className="w-full">
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
        {data.title}
      </h1>

      <Index
        inputFormat={inputFormat}
        outputFormat={outputFormat}
      />
    </main>
  );
}