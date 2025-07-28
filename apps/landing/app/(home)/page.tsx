import Features from "./features";
import Hero from "./hero";
import StatsSection from "./stats";
import FAQ from "./faq";
import Issues from "./issues";

export default function Page() {
  return (
    <>
      <Hero />
      <Features />
      <Issues />
      <StatsSection />
      <FAQ />
    </>
  );
}
