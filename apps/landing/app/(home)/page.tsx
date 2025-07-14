import CTA from "./cta";
import Features from "./features";
import Hero from "./hero";
import HowItWorks from "./how-it-works";
import StatsSection from "./stats";
import DemoTeaser from "./demo-teaser";
import Testimonials from "./testimonials";
import FAQ from "./faq";

export default function Page() {
  return (
    <>
      <Hero />
      <DemoTeaser />
      <Features />
      <HowItWorks />
      <Testimonials />
      <StatsSection />
      <FAQ />
      <CTA />
    </>
  );
}
