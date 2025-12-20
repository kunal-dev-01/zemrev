"use client"

import dynamic from "next/dynamic";
import { Spinner } from "../Layouts/Spinner";

const Index = dynamic(() => import("./MyFiles"), {
    ssr: false,
    loading: () => <div className="w-full h-[80vh] flex items-center justify-center">
        <Spinner />
    </div>
});

export default Index