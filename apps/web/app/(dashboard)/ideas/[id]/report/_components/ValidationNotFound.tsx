import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";

export function ValidationNotFound() {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Validation Data</h3>
          <p className="text-muted-foreground mb-4">
            This idea hasn't been validated yet. Start the validation process to see detailed insights and analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}