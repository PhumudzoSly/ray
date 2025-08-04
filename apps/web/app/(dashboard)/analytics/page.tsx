import ComingSoon from "@/components/shared/coming-soon";
import React from "react";

const Analytics = () => {
  if (process.env.NODE_ENV === "production") {
    return <ComingSoon />;
  }

  return (
    <div>
      <h1>Analytics</h1>
    </div>
  );
};

export default Analytics;
