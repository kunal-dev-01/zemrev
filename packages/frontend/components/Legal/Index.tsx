import { useSearchParams } from "next/navigation"
import AboutUs from "./About"
import Terms from "./Terms"
import PrivacyPolicy from "./Privacy"
const Index = () => {

    const searchParams = useSearchParams()
    const slug = searchParams.get("page")
    

  return (
    <div className="w-full">
        {slug === "about" && <AboutUs />}
        {slug === "terms" && <Terms />}
        {slug === "privacy" && <PrivacyPolicy />}
    </div>
  )
}

export default Index