import { Database } from "lucide-react";
import React from "react";
import { Card } from "@workspace/ui/components/card";

interface NoDataProps {
  message?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const NoData = ({ message, title, description, action }: NoDataProps) => {
  return (
    <div className="w-full mx-auto max-w-md">
      <Card className="my-5 border rounded-lg py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Database className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h1 className="text-lg font-semibold">
              {title ? title : "Nothing here..."}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground max-w-sm">
                {description}
              </p>
            )}
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </Card>
    </div>
  );
};

export default NoData;
