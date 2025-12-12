// ============================================================================
// FILE: app/image/extract-meta-data/page.tsx
// ============================================================================

import type { Metadata } from "next";
import {
  metadataExtractorMetadata,
  metadataExtractorContent,
} from "@/components/ImageTools/ImageMetadata/SeoData/Blog";
import Index from "@/components/ImageTools/ImageMetadata/MainMetadata/Index";

// ============================================================================
// FULL SEO METADATA
// ============================================================================
export const metadata: Metadata = {
  title: metadataExtractorMetadata.title,
  description: metadataExtractorMetadata.description,
  keywords: metadataExtractorMetadata.keywords,

  alternates: {
    canonical: "https://www.zemrev.com/image/extract-meta-data",
  },

  openGraph: {
    title: metadataExtractorMetadata.title,
    description: metadataExtractorMetadata.description,
    url: "https://www.zemrev.com/image/extract-meta-data",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: metadataExtractorMetadata.title,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: metadataExtractorMetadata.title,
    description: metadataExtractorMetadata.description,
    images: ["/og-image.png"],
  },
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================
const ExtractMetadata = () => {
  return (
    <main className="w-full">
      {/* Page Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 
        text-center font-semibold leading-tight px-3 py-2 
        border border-zinc-200 dark:border-zinc-800 rounded-xl 
        bg-white/50 dark:bg-zinc-900/40">
        {metadataExtractorContent.mainHeading}
      </h1>

      {/* Tool Component */}
      <Index />

      {/* Blog Section */}
      <div
        className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl
        bg-white/50 dark:bg-zinc-900/40 p-2 md:p-6 md:mt-[1vw] mt-[1vh]"
      >
        {metadataExtractorContent.sections.map((section, index) => (
          <div key={index} className="mb-8">

            {/* INTRO only for first section */}
            {index === 0 && metadataExtractorContent.intro && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {metadataExtractorContent.intro}
              </p>
            )}

            {/* Heading */}
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold 
                text-zinc-800 dark:text-zinc-200 mb-3">
                {section.heading}
              </h2>
            )}

            {/* Content Paragraph */}
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
                    <strong className="text-zinc-800 dark:text-zinc-200">{item.title}</strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">{item.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Formats + Note */}
            {section.formats && (
              <>
                <ul className="space-y-3 mb-4">
                  {section.formats.map((format, idx) => (
                    <li key={idx}>
                      <strong className="text-zinc-800 dark:text-zinc-200">
                        {format.name}:
                      </strong>{" "}
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {format.description}
                      </span>
                    </li>
                  ))}
                </ul>
                {section.note && (
                  <p className="text-sm italic text-zinc-600 dark:text-zinc-400 mb-4">
                    {section.note}
                  </p>
                )}
              </>
            )}

            {/* Steps */}
            {section.steps && (
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                {section.steps.map((stepItem, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">{stepItem.step}:</strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">{stepItem.description}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* Features */}
            {section.features && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.features.map((feature, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">{feature.title}</strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">{feature.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* GPS Coordinates */}
            {section.coordinates && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.coordinates.map((item, idx) => (
                  <li key={idx} className="text-zinc-600 dark:text-zinc-400">
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Example */}
            {section.example && (
              <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed mb-4">
                {section.example}
              </p>
            )}

            {/* Use Cases */}
            {section.useCases && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.useCases.map((useCase, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">{useCase.title}</strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">{useCase.text}</span>
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

export default ExtractMetadata;
