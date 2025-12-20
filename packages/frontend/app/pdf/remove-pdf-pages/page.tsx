// ============================================================================
// /app/pdf/remove-pdf-pages/page.tsx
// ============================================================================

import type { Metadata } from "next";
import {
  pdfPageRemoverMetadata,
  pdfPageRemoverContent,
} from "@/components/PDFTools/RemovePdfPages/SeoData";
import Index from "@/components/PDFTools/RemovePdfPages/Index";

export const metadata: Metadata = {
  title: pdfPageRemoverMetadata.title,
  description: pdfPageRemoverMetadata.description,
  keywords: pdfPageRemoverMetadata.keywords,

  alternates: {
    canonical: "https://www.zemrev.com/pdf/remove-pdf-pages",
  },

  openGraph: {
    title: pdfPageRemoverMetadata.title,
    description: pdfPageRemoverMetadata.description,
    url: "https://www.zemrev.com/pdf/remove-pdf-pages",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev PDF Page Remover Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: pdfPageRemoverMetadata.title,
    description: pdfPageRemoverMetadata.description,
    images: ["/og-image.png"],
  },

  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev PDF Page Remover",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online PDF page remover to delete unwanted pages from your PDF documents instantly.",
      url: "https://www.zemrev.com/pdf/remove-pdf-pages",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    }),
  },
};

const RemovePdfPages = () => {
  return (
    <main className="w-full">
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
        {pdfPageRemoverContent.mainHeading}
      </h1>

      <Index />

      <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {pdfPageRemoverContent.intro && (
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            {pdfPageRemoverContent.intro}
          </p>
        )}

        {pdfPageRemoverContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                {section.heading}
              </h2>
            )}

            {section.content && (
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {section.content}
              </p>
            )}

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

            {section.comparison && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.comparison.map((item, idx) => (
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

export default RemovePdfPages;