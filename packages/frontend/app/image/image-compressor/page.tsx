"use client"
import dynamic from "next/dynamic"
import Skeleton from "@/components/Layouts/Skeleton"
const Index = dynamic(() => import("@/components/ImageTools/ImageCompressor"), {
    ssr: false,
    loading: () => <Skeleton />,
})

const Compressor = () => {
  return (
    <div className='w-full'>
        <Index />
    </div>
  )
}

export default Compressor