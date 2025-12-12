// PDFTools/PdfMerge/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfMerge = dynamic(() => import("./PdfMerge"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#9333ea]" />
});

export default PdfMerge