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
// STATIC PARAMS (SSG)
// ============================================================================
export async function generateStaticParams() {
  const allSlugs = getAllConverterSlugs();
  return allSlugs.map((slug) => ({ slug }));
}

// ============================================================================
// DYNAMIC METADATA GENERATOR
// ============================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const data = getConverterData(slug);

  if (!data) {
    return {
      title: "Converter Not Found",
      description: "The requested image converter could not be found.",
    };
  }

  const canonicalUrl = `https://www.zemrev.com/image/image-converter/${slug}`;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // OpenGraph
    openGraph: {
      title: data.title,
      description: data.description,
      url: canonicalUrl,
      siteName: "Zemrev",
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: ["/og-image.png"],
    },

    // JSON-LD
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: data.title,
        applicationCategory: "WebApplication",
        operatingSystem: "All",
        description: data.description,
        url: canonicalUrl,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }),
    },
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================
export default async function ConverterDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = getConverterData(slug);
  if (!data) return notFound();

  // Extract input & output from slug
  const [inputFormat, outputFormat] = slug.split("-to-");
  if (!inputFormat || !outputFormat) return notFound();

  return (
    <main className="w-full relative">
      {/* Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-900 rounded-xl">
        {data.title}
      </h1>

      <Index inputFormat={inputFormat} outputFormat={outputFormat} />
    </main>
  );
}
