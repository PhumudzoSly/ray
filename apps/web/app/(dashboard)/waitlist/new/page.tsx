"use client";
import Header from "@/components/shared/header";
import WaitlistForm from "../_components/waitlist-form";

export default function NewWaitlistPage() {
  const waitlistFormContent = WaitlistForm({
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
      {waitlistFormContent}
    </>
  );
}
