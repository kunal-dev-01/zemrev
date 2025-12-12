// PDFTools/PdfUnlock/Index.tsx
"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfUnlock = dynamic(() => import("./PdfUnlock"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#eab308]" />,
});

export default PdfUnlock