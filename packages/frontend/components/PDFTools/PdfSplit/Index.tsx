// PDFTools/PdfSplit/Index.tsx
"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfSplit = dynamic(() => import("./PdfSplit"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#0891b2]" />,
});

export default PdfSplit