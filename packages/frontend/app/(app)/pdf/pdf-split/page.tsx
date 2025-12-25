// app/pdf/pdf-split/page.tsx

import type { Metadata } from "next";
import {
  splitMetadata,
  splitContent,
} from "@/components/PDFTools/PdfSplit/SeoData";
import Index from "@/components/PDFTools/PdfSplit/Index";

// ============================================================================
// FULL SEO METADATA
// ============================================================================
export const metadata: Metadata = {
  title: splitMetadata.title,
  description: splitMetadata.description,
  keywords: splitMetadata.keywords,

  // Canonical URL
  alternates: {
    canonical: "https://www.zemrev.com/pdf/pdf-split",
  },

  // OpenGraph for social preview
  openGraph: {
    title: splitMetadata.title,
    description: splitMetadata.description,
    url: "https://www.zemrev.com/pdf/pdf-split",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev PDF Splitter Tool",
      },
    ],
  },

  // Twitter card preview
  twitter: {
    card: "summary_large_image",
    title: splitMetadata.title,
    description: splitMetadata.description,
    images: ["/og-image.png"],
  },

  // JSON-LD Structured Data
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev PDF Splitter",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online PDF splitter to extract and separate PDF pages instantly.",
      url: "https://www.zemrev.com/pdf/pdf-split",
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
const Split = () => {
  return (
    <main className="w-full">
      {/* Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-900 rounded-xl">
        {splitContent.mainHeading}
      </h1>

      {/* Tool Component */}
      <Index />

      {/* Blog Section */}
      <div className="w-full border border-zinc-200 dark:border-zinc-900 rounded-xl p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {/* Introduction */}
        {splitContent.intro && (
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            {splitContent.intro}
          </p>
        )}

        {/* All Sections */}
        {splitContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
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

            {/* Scenarios */}
            {section.scenarios && (
              <ul className="space-y-3 mb-4">
                {section.scenarios.map((scenario, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {scenario.name}:
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {scenario.description}
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

            {/* Methods */}
            {section.methods && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.methods.map((method, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {method.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {method.text}
                    </span>
                  </li>
                ))}
              </ul>
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

            {/* Tips */}
            {section.tips && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.tips.map((tip, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {tip.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {tip.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* FAQs */}
            {section.faqs && (
              <div className="space-y-4 mb-4">
                {section.faqs.map((faq, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Split;