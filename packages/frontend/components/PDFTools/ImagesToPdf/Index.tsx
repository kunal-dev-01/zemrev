// PDFTools/ImagesToPdf/Index.tsx
"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const ImagesToPdf = dynamic(() => import("./ImagesToPdf"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#f97316]" />,
});

export default ImagesToPdf