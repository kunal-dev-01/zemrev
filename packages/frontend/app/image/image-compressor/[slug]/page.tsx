// app/image/image-compressor/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { 
  getCompressorData,
  getAllCompressorSlugs,
} from "@/components/ImageTools/ImageCompressor/SeoData/DynamicData-Index";

import Index from "@/components/ImageTools/ImageCompressor/DynamicCompressor/Index";

// ============================================================================
// GENERATE STATIC PARAMS
// ============================================================================
export async function generateStaticParams() {
  const allSlugs = getAllCompressorSlugs();
  return allSlugs.map((slug) => ({ slug }));
}

// ============================================================================
// DYNAMIC METADATA
// ============================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getCompressorData(slug);

  // If missing → fallback
  if (!data) {
    return {
      title: "Compressor Not Found",
      description: "The requested image compressor could not be found.",
    };
  }

  const canonicalUrl = `https://www.zemrev.com/image/image-compressor/${slug}`;

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

    // JSON-LD (Structured Data)
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
export default async function CompressorDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = getCompressorData(slug);
  if (!data) return notFound();

  // Extract "jpg" from "jpg-compressor"
  const format = slug.replace("-compressor", "");
  if (!format) return notFound();

  return (
    <main className="w-full">
      {/* Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
        {data.title}
      </h1>

      {/* Tool */}
      <Index format={format} />
    </main>
  );
}
