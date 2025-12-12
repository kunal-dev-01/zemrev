// PDFTools/PdfSercure/PdfSecure.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfSecure = dynamic(() => import("./PdfSecure"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#10b981]" />,
});

export default PdfSecure