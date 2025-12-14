// PDFTools/PdfOCR/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfOCR = dynamic(() => import("./PdfOCR"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#4F46E5]" />
});

export default PdfOCR