import ComingSoon from "@/components/shared/coming-soon";
import React from "react";

const AppFeedback = () => {
  if (process.env.NODE_ENV === "production") {
    return <ComingSoon />;
  }
  return (
    <div>
      <h1>AppFeedback</h1>
    </div>
  );
};

export default AppFeedback;
