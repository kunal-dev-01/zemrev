// PDFTools/PdfRotate/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfRotate = dynamic(() => import("./PdfRotate"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#DB2777]" />,
});

export default PdfRotate;