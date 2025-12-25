// app/image/image-optimizer/page.tsx

import type { Metadata } from "next";
import {
  optimizerMetadata,
  optimizerContent,
} from "@/components/ImageTools/ImageOptimizer/SeoData/Blog";
import Index from "@/components/ImageTools/ImageOptimizer/MainOptimizer/Index";

export const metadata: Metadata = {
  title: optimizerMetadata.title,
  description: optimizerMetadata.description,
  keywords: optimizerMetadata.keywords,

  // Canonical URL
  alternates: {
    canonical: "https://www.zemrev.com/image/image-optimizer",
  },

  // OpenGraph
  openGraph: {
    title: optimizerMetadata.title,
    description: optimizerMetadata.description,
    url: "https://www.zemrev.com/image/image-optimizer",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev Image Optimizer",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: optimizerMetadata.title,
    description: optimizerMetadata.description,
    images: ["/og-image.png"],
  },

  // JSON-LD Structured Data
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev Image Optimizer",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online image optimizer to reduce size, remove metadata, and improve performance without losing quality.",
      url: "https://www.zemrev.com/image/image-optimizer",
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

const ImageOptimizer = () => {
  return (
    <main className="w-full">
      {/* Page Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 
        border border-zinc-200 dark:border-zinc-900 
        rounded-xl">
        {optimizerContent.mainHeading}
      </h1>

      {/* Tool */}
      <Index />

      {/* Blog Section */}
      <div className="w-full border border-zinc-200 dark:border-zinc-900 rounded-xl p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {optimizerContent.sections.map((section, index) => (
          <div key={index} className="mb-8">

            {/* Introduction */}
            {optimizerContent.intro && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {optimizerContent.intro}
              </p>
            )}

            {/* Heading */}
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-200 mb-3">
                {section.heading}
              </h2>
            )}

            {/* Content */}
            {section.content && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {section.content}
              </p>
            )}

            {/* List */}
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
                {section.steps.map((step, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {step.step}:
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {step.description}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {/* Features */}
            {section.features && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.features.map((f, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {f.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Use Cases */}
            {section.useCases && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.useCases.map((use, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {use.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {use.text}
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

export default ImageOptimizer;
