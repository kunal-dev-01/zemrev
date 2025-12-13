// PDFTools/PdfToPdfA/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfToPdfA = dynamic(() => import("./PdfToPdfA"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#6366f1]" />,
});

export default PdfToPdfA