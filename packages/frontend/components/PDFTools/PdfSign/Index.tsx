// PDFTools/PdfSign/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfSign = dynamic(() => import("./PdfSign"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#3b82f6]" />
});

export default PdfSign