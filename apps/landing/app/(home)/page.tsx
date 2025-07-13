import CTA from "./cta";
import Features from "./features";
import Hero from "./hero";
import HowItWorks from "./how-it-works";
import StatsSection from "./stats";

export default function Page() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <StatsSection />
      <CTA />
    </>
  );
}
