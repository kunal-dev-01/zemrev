// PDFTools/PdfFlatten/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfFlatten = dynamic(() => import("./PdfFlatten"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#0284C7]" />,
});

export default PdfFlatten