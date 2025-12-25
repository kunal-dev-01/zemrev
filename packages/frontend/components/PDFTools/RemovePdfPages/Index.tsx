"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const RemovePdfPages = dynamic(() => import("./RemovePdfPages"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default RemovePdfPages;