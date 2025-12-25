// PDFTools/PdfSercure/PdfSecure.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfSecure = dynamic(() => import("./PdfSecure"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfSecure