// PDFTools/PdfCrop/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfCrop = dynamic(() => import("./PdfCrop"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#4D7C0F]" />,
});

export default PdfCrop;