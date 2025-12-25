// PDFTools/PdfImageExtract/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfImageExtract = dynamic(() => import("./PdfImageExtract"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfImageExtract