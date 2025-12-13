// PDFTools/PdfFlatten/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfFlatten = dynamic(() => import("./PdfFlatten"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#6366f1]" />,
});

export default PdfFlatten