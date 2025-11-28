import Hero from "./Hero"
import FeaturedTools from "./FeaturedTools"
import WhyZemrev from "./WhyZemrev"
import HowItWorks from "./HowItWorks"
import UpcomingTools from "./UpcomingTools"

const Index = () => {
  return (
    <div className="w-full">
      <Hero />
      <FeaturedTools />
      <WhyZemrev />
      <HowItWorks />
      <UpcomingTools />
    </div>
  )
}

export default Index