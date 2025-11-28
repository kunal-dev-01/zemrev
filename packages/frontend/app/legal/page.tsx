"use client"
import Skeleton from "@/components/Layouts/Skeleton"
import dynamic from "next/dynamic"
const Index = dynamic(() => import("@/components/Legal/Index"), {
  ssr: false,
  loading: () => (
    <Skeleton />
  )
})

const Legal = () => {
  return (
    <div className="w-full">
      <Index />
    </div>
  )
}

export default Legal