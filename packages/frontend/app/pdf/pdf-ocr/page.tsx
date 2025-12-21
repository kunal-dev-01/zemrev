// ============================================================================
// /app/pdf/pdf-ocr/page.tsx
// ============================================================================


import type { Metadata } from "next";
import {
  pdfOCRMetadata,
  pdfOCRContent,
} from "@/components/PDFTools/PdfOCR/SeoData";
import Index from "@/components/PDFTools/PdfOCR/Index";

export const metadata: Metadata = {
  title: pdfOCRMetadata.title,
  description: pdfOCRMetadata.description,
  keywords: pdfOCRMetadata.keywords,

  alternates: {
    canonical: "https://www.zemrev.com/pdf/pdf-ocr",
  },

  openGraph: {
    title: pdfOCRMetadata.title,
    description: pdfOCRMetadata.description,
    url: "https://www.zemrev.com/pdf/pdf-ocr",
    siteName: "Zemrev",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zemrev PDF OCR Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: pdfOCRMetadata.title,
    description: pdfOCRMetadata.description,
    images: ["/og-image.png"],
  },

  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Zemrev PDF OCR",
      applicationCategory: "WebApplication",
      operatingSystem: "All",
      description:
        "Free online PDF OCR to convert scanned PDFs into searchable text.",
      url: "https://www.zemrev.com/pdf/pdf-ocr",
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

const PDFOCR = () => {
  return (
    <main className="w-full">
      <h1 className="md:text-[1.8vw] text-[2.5vh] text-zinc-700 dark:text-zinc-300 text-center font-semibold leading-tight px-3 py-2 border border-zinc-200 dark:border-zinc-900 rounded-xl">
        {pdfOCRContent.mainHeading}
      </h1>

      <Index />

      <div className="w-full border border-zinc-200 dark:border-zinc-900 rounded-xl p-2 md:p-6 md:mt-[1vw] mt-[1vh]">
        {pdfOCRContent.intro && (
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
            {pdfOCRContent.intro}
          </p>
        )}

        {pdfOCRContent.sections.map((section, index) => (
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

            {section.outputTypes && (
              <ul className="space-y-3 mb-4">
                {section.outputTypes.map((type, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {type.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {type.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {section.languages && (
              <ul className="list-disc pl-5 space-y-2 mb-4">
                {section.languages.map((lang, idx) => (
                  <li key={idx}>
                    <strong className={repeatOne}>
                      {lang.title}
                    </strong>{" "}
                    <span className={repeatTwo}>
                      {lang.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}

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

export default PDFOCR;
