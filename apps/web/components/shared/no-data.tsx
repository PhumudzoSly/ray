import { Database } from "lucide-react";
import React from "react";
import { Card } from "@workspace/ui/components/card";

const NoData = ({ message, title }: { message?: string; title?: string }) => {
  return (
    <div className="w-full mx-auto max-w-md">
      <Card className="my-5 border rounded-lg py-5">
        <div className="flex flex-col items-center justify-center gap-3">
          <Database color="red" />
          <h1 className="text-center font-medium mt-4">
            {title ? title : "Nothing here..."}
          </h1>
          <p className="text-sm text-center">
            {message ? message : "Check again in a moment"}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NoData;
