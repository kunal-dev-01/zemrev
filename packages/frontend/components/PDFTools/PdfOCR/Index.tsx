// PDFTools/PdfOCR/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfOCR = dynamic(() => import("./PdfOCR"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#a855f7]" />
});

export default PdfOCR