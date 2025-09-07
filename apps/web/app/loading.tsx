import LoadingSpinner from "@workspace/ui/components/loading-spinner";
import React from "react";

const LoadingPage = () => {
  return (
    <div className="py-10 px-10 mx-auto max-w-7xl flex justify-center items-center">
      <LoadingSpinner variant="card" />
    </div>
  );
};

export default LoadingPage;
