import React from "react";
import { Metadata } from "next";
import IdeaValidation from "./idea-validation";
import ProductDev from "./product-dev";
import CustomerEngagement from "./engagement";
import { Workflow } from "./workflow";

const Features = () => {
  return (
    <>
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            All-in-One SaaS Management.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Ray AI unifies market validation, product planning & management,
            analytics and customer feedback into a single, intelligent platform,
            so you can focus on building, launching, and growing with
            confidence.
          </p>
        </div>
      </section>

      <IdeaValidation />
      <ProductDev />
      <CustomerEngagement />
      <Workflow />
    </>
  );
};

export default Features;
