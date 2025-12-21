// ============================================================================
// /app/pdf/pdf-a/page.tsx
// ============================================================================

import type { Metadata } from "next";
import {
  pdfToPdfAMetadata,
  pdfToPdfAContent,
} from "@/components/PDFTools/PdfToPdfA/SeoData";
import Index from "@/components/PDFTools/PdfToPdfA/Index";

export const metadata: Metadata = {
  title: pdfToPdfAMetadata.title,
  description: pdfToPdfAMetadata.description,
  keywords: pdfToPdfAMetadata.keywords,

  alternates: {
    canonical: "https://www.zemrev.com/pdf/pdf-a",
  },

  openGraph: {
    title: pdfToPdfAMetadata.title,
    description: pdfToPdfAMetadata.description,
    url: "https://www.zemrev.com/pdf/pdf-a",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev PDF to PDF/A Converter Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: pdfToPdfAMetadata.title,
    description: pdfToPdfAMetadata.description,
    images: ["/og-image.png"],
  },

  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev PDF to PDF/A Converter",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online PDF to PDF/A converter for long-term document archiving and preservation.",
      url: "https://www.zemrev.com/pdf/pdf-a",
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

const PdfA = () => {
  return (
    <main className="w-full">
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-900 rounded-xl">
        {pdfToPdfAContent.mainHeading}
      </h1>

      <Index />

      <div className="w-full border border-zinc-200 dark:border-zinc-900 rounded-xl p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {pdfToPdfAContent.intro && (
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            {pdfToPdfAContent.intro}
          </p>
        )}

        {pdfToPdfAContent.sections.map((section, index) => (
          <div key={index} className="mb-8">
            {section.heading && (
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
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

            {section.standards && (
              <ul className="space-y-3 mb-4">
                {section.standards.map((standard, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {standard.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {standard.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {section.requirements && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.requirements.map((req, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {req.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

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

            {section.faqs && (
              <div className="space-y-4 mb-4">
                {section.faqs.map((faq, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
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

export default PdfA;
