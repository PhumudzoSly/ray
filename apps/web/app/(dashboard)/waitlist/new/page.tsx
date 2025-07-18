"use client";

import Header from "@/components/shared/header";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import WaitlistForm from "../_components/waitlist-form";

export default function NewWaitlistPage() {
  const { mainContent, apiDocsContent } = WaitlistForm({
    mode: "create",
  });

  return (
    <>
      <Header
        crumb={[
          { title: "Waitlists", url: "/waitlist" },
          { title: "New Waitlist" },
        ]}
      >
        <></>
      </Header>
      <ExpandedLayoutContainer sidebar={apiDocsContent}>
        {mainContent}
      </ExpandedLayoutContainer>
    </>
  );
}
