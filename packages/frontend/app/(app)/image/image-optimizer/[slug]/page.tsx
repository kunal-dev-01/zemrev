// app/image/image-optimizer/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getOptimizerData,
  getAllOptimizerSlugs,
} from "@/components/ImageTools/ImageOptimizer/SeoData/DynamicData-Index";

import Index from "@/components/ImageTools/ImageOptimizer/DynamicOptimizer/Index";

// ============================================================================
// GENERATE STATIC PARAMS
// ============================================================================
export async function generateStaticParams() {
  const allSlugs = getAllOptimizerSlugs();
  return allSlugs.map((slug) => ({ slug }));
}

// ============================================================================
// METADATA GENERATION
// ============================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getOptimizerData(slug);

  // ❌ If no tool found
  if (!data) {
    return {
      title: "Optimizer Not Found",
      description: "The requested image optimizer could not be found.",
    };
  }

  const canonicalUrl = `https://www.zemrev.com/image/image-optimizer/${slug}`;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // OpenGraph (Social Sharing)
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
          alt: `Zemrev ${data.title}`,
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

    // JSON-LD Structured Data
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
export default async function OptimizerDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = getOptimizerData(slug);
  if (!data) return notFound();

  return (
    <main className="w-full">
      {/* Page Title */}
      <h1
        className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 
                   dark:text-zinc-300 text-center font-semibold leading-tight 
                   px-3 py-2 border border-zinc-200 dark:border-zinc-900 
                   rounded-xl"
      >
        {data.title}
      </h1>

      {/* Tool */}
      <Index slug={slug} />
    </main>
  );
}
