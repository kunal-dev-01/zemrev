// ============================================================================
// FILE: app/image/extract-color-palette/page.tsx
// ============================================================================

import type { Metadata } from "next";
import {
  colorPaletteExtractorMetadata,
  colorPaletteExtractorContent,
} from "@/components/ImageTools/ImageColorPalette/SeoData/Blog";
import Index from "@/components/ImageTools/ImageColorPalette/MainColorPalette/Index";

export const metadata: Metadata = {
  title: colorPaletteExtractorMetadata.title,
  description: colorPaletteExtractorMetadata.description,
  keywords: colorPaletteExtractorMetadata.keywords,

  // Canonical URL
  alternates: {
    canonical: "https://www.zemrev.com/image/extract-color-palette",
  },

  // OpenGraph for social media rich preview
  openGraph: {
    title: colorPaletteExtractorMetadata.title,
    description: colorPaletteExtractorMetadata.description,
    url: "https://www.zemrev.com/image/extract-color-palette",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: colorPaletteExtractorMetadata.title,
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: colorPaletteExtractorMetadata.title,
    description: colorPaletteExtractorMetadata.description,
    images: ["/og-image.png"],
  },
};


const ExtractColor = () => {
  return (
    <main className="w-full">
      {/* Page Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
        {colorPaletteExtractorContent.mainHeading}
      </h1>

      {/* Tool */}
      <Index />

      {/* Blog Section */}
      <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {colorPaletteExtractorContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
            {/* Introduction */}
            {index === 0 && colorPaletteExtractorContent.intro && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {colorPaletteExtractorContent.intro}
              </p>
            )}

            {/* Section heading */}
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                {section.heading}
              </h2>
            )}

            {/* Section main paragraph */}
            {section.content && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {section.content}
              </p>
            )}

            {/* Generic list renderer */}
            {section.list && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.list.map((item, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {item.title}
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Formats */}
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
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 italic mb-4">
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
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {stepItem.step}:
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
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
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {feature.title}
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Coordinates/List Items */}
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
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 italic">
                {section.example}
              </p>
            )}

            {/* Use Cases */}
            {section.useCases && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.useCases.map((useCase, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {useCase.title}
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
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

export default ExtractColor;