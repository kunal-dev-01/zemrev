// PDFTools/PdfMerge/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfMerge = dynamic(() => import("./PdfMerge"), {
    ssr: false,
    loading: () => <ToolLoader />
});

export default PdfMerge