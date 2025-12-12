// app/pdf/pdf-merge/page.tsx

import type { Metadata } from "next";
import {
  mergerMetadata,
  mergerContent,
} from "@/components/PDFTools/PdfMerge/SeoData";
import Index from "@/components/PDFTools/PdfMerge/Index";

// ============================================================================
// FULL SEO METADATA
// ============================================================================
export const metadata: Metadata = {
  title: mergerMetadata.title,
  description: mergerMetadata.description,
  keywords: mergerMetadata.keywords,

  // Canonical URL
  alternates: {
    canonical: "https://www.zemrev.com/pdf/pdf-merge",
  },

  // OpenGraph for social preview
  openGraph: {
    title: mergerMetadata.title,
    description: mergerMetadata.description,
    url: "https://www.zemrev.com/pdf/pdf-merge",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev PDF Merger Tool",
      },
    ],
  },

  // Twitter card preview
  twitter: {
    card: "summary_large_image",
    title: mergerMetadata.title,
    description: mergerMetadata.description,
    images: ["/og-image.png"],
  },

  // JSON-LD Structured Data
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev PDF Merger",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online PDF merger to combine multiple PDF files into one document.",
      url: "https://www.zemrev.com/pdf/pdf-merge",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    }),
  },
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================
const Merger = () => {
  return (
    <main className="w-full">
      {/* Title */}
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
        {mergerContent.mainHeading}
      </h1>

      {/* Tool Component */}
      <Index />

      {/* Blog Section */}
      <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {/* Introduction */}
        {mergerContent.intro && (
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            {mergerContent.intro}
          </p>
        )}

        {/* All Sections */}
        {mergerContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
            {/* Section Heading */}
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
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

            {/* Scenarios */}
            {section.scenarios && (
              <ul className="space-y-3 mb-4">
                {section.scenarios.map((scenario, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {scenario.name}:
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
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

            {/* Tips */}
            {section.tips && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.tips.map((tip, idx) => (
                  <li key={idx}>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {tip.title}
                    </strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
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
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
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

export default Merger;