// PDFTools/PdfOCR/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfOCR = dynamic(() => import("./PdfOCR"), {
    ssr: false,
    loading: () => <ToolLoader />
});

export default PdfOCR