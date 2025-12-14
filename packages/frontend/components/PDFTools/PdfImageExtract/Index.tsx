// PDFTools/PdfImageExtract/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfImageExtract = dynamic(() => import("./PdfImageExtract"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#2563EB]" />,
});

export default PdfImageExtract