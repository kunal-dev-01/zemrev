// PDFTools/PdfCrop/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfCrop = dynamic(() => import("./PdfCrop"), {
    ssr: false,
    loading: () => <ToolLoader/>,
});

export default PdfCrop;