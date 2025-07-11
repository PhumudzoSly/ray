import { Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function ComingSoon() {
  return (
    <Card className="w-full max-w-lg mx-auto mt-20">
      <CardHeader className="text-center space-y-6 pb-8">
        <div className="w-16 h-16 mx-auto bg-primary/10 flex items-center justify-center rounded-full">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Coming Soon
          </CardTitle>
          <CardDescription className="text-base">
            We're working hard to bring you this feature. Stay tuned for
            updates!
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px] bg-muted/30 rounded-lg flex items-center justify-center">
          <img
            src="/coming-soon.jpg"
            alt="Feature preview"
            className="h-full w-full object-cover rounded-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}
