"use client"
import dynamic from "next/dynamic"
import Skeleton from "@/components/Layouts/Skeleton"
const Index = dynamic(() => import("@/components/ImageTools/ImageConverter/ImageConverter"), {
    ssr: false,
    loading: () => (
        <Skeleton />
    ),
})

const Conveter = () => {
  return (
    <div className="w-full">
        <Index />
    </div>
  )
}

export default Conveter