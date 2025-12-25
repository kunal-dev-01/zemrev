// PDFTools/PdfRotate/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfRotate = dynamic(() => import("./PdfRotate"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfRotate;