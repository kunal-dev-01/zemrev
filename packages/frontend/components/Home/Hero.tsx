import HeroContent from "./HeroContent";
import HeroEffects from "./HeroEffects";

const Hero = () => (
  <section className="relative w-full min-h-[70vh] flex items-center justify-center py-20">
    <HeroContent />
    <HeroEffects />
  </section>
);

export default Hero;