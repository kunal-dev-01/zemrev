// app/image/image-converter/page.tsx

import type { Metadata } from "next";
import {
  converterContent,
  converterMetadata,
} from "@/components/ImageTools/ImageConverter/SeoData/Blog";

import ToolWrapper from "@/components/ImageTools/ImageConverter/MainConverter/Index";

// ============================================================================
// Metadata (SEO)
// ============================================================================
export const metadata: Metadata = {
  title: converterMetadata.title,
  description: converterMetadata.description,
  keywords: converterMetadata.keywords,

  alternates: {
    canonical: "https://www.zemrev.com/image/image-converter",
  },

  openGraph: {
    title: converterMetadata.title,
    description: converterMetadata.description,
    url: "https://www.zemrev.com/image/image-converter",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev Image Converter Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: converterMetadata.title,
    description: converterMetadata.description,
    images: ["/og-image.png"],
  },

  // JSON-LD Structured Data
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev Image Converter",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online image converter to convert images instantly without signup.",
      url: "https://www.zemrev.com/image/image-converter",
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
// Page Component
// ============================================================================
const Conveter = () => {
  return (
    <main className="w-full">
      {/* Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-900 rounded-xl">
        {converterContent.mainHeading}
      </h1>

      {/* Main Tool */}
      <ToolWrapper />

      {/* Blog Section */}
      <div className="w-full border border-zinc-200 dark:border-zinc-900 rounded-xl p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {converterContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
            {/* Heading */}
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                {section.heading}
              </h2>
            )}

            {/* Paragraph */}
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

            {/* Use cases */}
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

            {/* Footer */}
            {section.footer && (
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {section.footer}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Conveter;
