// PDFTools/PdfTextExtract/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfTextExtract = dynamic(() => import("./PdfTextExtract"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#7C3AED]" />,
});

export default PdfTextExtract;