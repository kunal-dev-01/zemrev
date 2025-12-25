// PDFTools/PdfToImages/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfToImages = dynamic(() => import("./PdfToImages"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfToImages