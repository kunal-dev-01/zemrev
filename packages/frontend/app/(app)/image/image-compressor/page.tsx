// Image/image-compressor/page.tsx

import type { Metadata } from "next";
import {
  compressorMetadata,
  compressorContent,
} from "@/components/ImageTools/ImageCompressor/SeoData/Blog";
import Index from "@/components/ImageTools/ImageCompressor/MainCompressor/Index";

// ============================================================================
// FULL SEO METADATA
// ============================================================================
export const metadata: Metadata = {
  title: compressorMetadata.title,
  description: compressorMetadata.description,
  keywords: compressorMetadata.keywords,

  // Canonical URL
  alternates: {
    canonical: "https://www.zemrev.com/image/image-compressor",
  },

  // OpenGraph for social preview
  openGraph: {
    title: compressorMetadata.title,
    description: compressorMetadata.description,
    url: "https://www.zemrev.com/image/image-compressor",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev Image Compressor Tool",
      },
    ],
  },

  // Twitter card preview
  twitter: {
    card: "summary_large_image",
    title: compressorMetadata.title,
    description: compressorMetadata.description,
    images: ["/og-image.png"],
  },

  // JSON-LD Structured Data
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev Image Compressor",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online image compressor to reduce image size without losing quality.",
      url: "https://www.zemrev.com/image/image-compressor",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    }),
  },
};

const repeatOne = "text-zinc-700 dark:text-zinc-300"
const repeatTwo = "text-zinc-600 dark:text-zinc-400"

// ============================================================================
// PAGE COMPONENT
// ============================================================================
const Compressor = () => {
  return (
    <main className="w-full">
      {/* Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-900 rounded-xl">
        {compressorContent.mainHeading}
      </h1>

      {/* Tool Component */}
      <Index />

      {/* Blog Section */}
      <div className="w-full border border-zinc-200 dark:border-zinc-900 rounded-xl p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {compressorContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
            
            {/* Introduction */}
            {compressorContent.intro && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {compressorContent.intro}
              </p>
            )}

            {/* Section Heading */}
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-200 mb-3">
                {section.heading}
              </h2>
            )}

            {/* Section Content */}
            {section.content && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {section.content}
              </p>
            )}

            {/* Generic List */}
            {section.list && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.list.map((item, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {item.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Formats */}
            {section.formats && (
              <ul className="space-y-3 mb-4">
                {section.formats.map((format, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {format.name}:
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {format.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Steps */}
            {section.steps && (
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                {section.steps.map((stepItem, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {stepItem.step}:
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {stepItem.description}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {/* Features */}
            {section.features && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.features.map((feature, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {feature.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Use Cases */}
            {section.useCases && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.useCases.map((useCase, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {useCase.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {useCase.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Compressor;
