// ============================================================================
// SERVER COMPONENT
// ============================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { converterDynamicData } from "@/components/ImageTools/ImageConverter/DynamicData";
import ConverterDynamicTool from "@/components/ImageTools/ImageConverter/ConverterDynamicTool";

type ConverterSlug = keyof typeof converterDynamicData;

export async function generateStaticParams() {
  return Object.keys(converterDynamicData).map(slug => ({ slug }));
}

// METADATA
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; // <-- FIX

  if (!(slug in converterDynamicData)) return {};

  const data = converterDynamicData[slug as ConverterSlug];

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
  };
}

// PAGE
export default async function ConverterDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // <-- FIX

  if (!(slug in converterDynamicData)) return notFound();

  const data = converterDynamicData[slug as ConverterSlug];

  const [inputFormat, outputFormat] = slug.split("-to-");

  return (
    <main className="w-full">
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
        {data.title}
      </h1>

      <ConverterDynamicTool
        inputFormat={inputFormat}
        outputFormat={outputFormat}
        slug={slug}
      />

    </main>
  );
}
