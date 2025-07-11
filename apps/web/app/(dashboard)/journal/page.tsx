"use client";
import { ExpandedLayoutContainer } from "@/components/expanded-layout-container";
import Header from "@/components/shared/header";
import React, { useState } from "react";
import JournalSidebar from "./journal-sidebar";
import DaySwitcher from "./day-switcher";

const JornalPage = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <>
      <Header crumb={[{ title: "Journal", url: "/journal" }]}>{null}</Header>
      <ExpandedLayoutContainer sidebar={<JournalSidebar />}>
        <div className="container mx-auto p-6">
          <DaySwitcher
            selectedDate={selectedDate}
            onDateSelect={handleDateChange}
          />
          {/* Main content area for rich text editor will go here */}
          <div className="mt-8">
            <div className="bg-card border rounded-lg p-6 min-h-[400px]">
              <p className="text-muted-foreground text-center">
                Rich text editor will go here...
              </p>
            </div>
          </div>
        </div>
      </ExpandedLayoutContainer>
    </>
  );
};

export default JornalPage;
