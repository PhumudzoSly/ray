import type React from "react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { MarkdownRenderer } from "@workspace/ui/components/markdown-renderer";
import {
  FileText,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";

interface InfoCardProps {
  title: string;
  content: string;
  icon:
    | "summary"
    | "findings"
    | "conclusion"
    | "next-steps"
    | "info"
    | "warning"
    | "success"
    | "error";
  variant?:
    | "default"
    | "accordion"
    | "minimal"
    | "sidebar"
    | "gradient-border"
    | "compact";
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  content,
  icon,
  variant = "default",
  className,
}) => {
  const getIcon = () => {
    switch (icon) {
      case "summary":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "findings":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case "conclusion":
        return <CheckSquare className="h-5 w-5 text-emerald-500" />;
      case "next-steps":
        return <ArrowRight className="h-5 w-5 text-purple-500" />;
      case "info":
        return <FileText className="h-5 w-5 text-sky-500" />;
      case "warning":
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case "success":
        return <CheckSquare className="h-5 w-5 text-teal-500" />;
      case "error":
        return <CheckSquare className="h-5 w-5 text-rose-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const getIconBackground = () => {
    switch (icon) {
      case "summary":
        return "bg-blue-500/10";
      case "findings":
        return "bg-amber-500/10";
      case "conclusion":
        return "bg-emerald-500/10";
      case "next-steps":
        return "bg-purple-500/10";
      case "info":
        return "bg-sky-500/10";
      case "warning":
        return "bg-primary/10";
      case "success":
        return "bg-teal-500/10";
      case "error":
        return "bg-rose-500/10";
      default:
        return "bg-blue-500/10";
    }
  };

  const renderContent = () => {
    // Default rendering for other content types
    return (
      <div className="text-muted-foreground/80 w-full">
        <MarkdownRenderer
          content={content}
          variant="prose"
          className="text-muted-foreground/80"
        />
      </div>
    );
  };

  const renderIcon = () => (
    <div
      className={cn(
        "p-2 rounded-xl",
        "transition-transform duration-200 hover:scale-105",
        "backdrop-blur-xs",
        getIconBackground()
      )}
    >
      {getIcon()}
    </div>
  );

  const renderTitle = () => (
    <h3 className="text-lg font-semibold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
      {title}
    </h3>
  );

  switch (variant) {
    case "accordion":
      return (
        <Collapsible defaultOpen className={cn("w-full", className)}>
          <CollapsibleTrigger className="w-full">
            <Card className="border bg-background shadow-xs hover:shadow-md transition-all duration-200">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {renderIcon()}
                    {renderTitle()}
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2 border shadow-xs bg-muted">
              <CardContent className="p-6">{renderContent()}</CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      );

    case "minimal":
      return (
        <Card
          className={cn(
            "border bg-muted shadow-none hover:bg-muted/20 transition-colors",
            className
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {renderIcon()}
              <div className="flex-1 space-y-2">
                {renderTitle()}
                {renderContent()}
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case "gradient-border":
      return (
        <Card
          className={cn(
            "relative overflow-hidden border shadow-xs",
            "before:absolute before:inset-0 before:bg-linear-to-r",
            "before:from-blue-500/5 before:via-purple-500/5 before:to-emerald-500/5",
            className
          )}
        >
          <CardContent className="p-6 relative">
            <div className="flex items-start gap-4">
              {renderIcon()}
              <div className="flex-1 space-y-3">
                {renderTitle()}
                {renderContent()}
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case "sidebar":
      return (
        <Card className={cn("border-0 shadow-xs", className)}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-3">
              {renderIcon()}
              {renderTitle()}
              <div className="w-12 h-0.5 bg-muted-foreground/20" />
              <div className="w-full">{renderContent()}</div>
            </div>
          </CardContent>
        </Card>
      );

    case "compact":
      return (
        <Card
          className={cn(
            "border-0 shadow-xs hover:shadow-md transition-all",
            className
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {renderIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium truncate">{title}</h3>
                <div className="text-sm text-muted-foreground/80 truncate">
                  {content.split(/\n|\r\n/)[0]}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card
          className={cn(
            "border shadow-xs transition-all duration-200 hover:shadow-md",
            "bg-linear-to-br from-background to-muted/20",
            "hover:from-background hover:to-muted/30",
            className
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {renderIcon()}
              <div className="flex-1 space-y-3">
                {renderTitle()}
                {renderContent()}
              </div>
            </div>
          </CardContent>
        </Card>
      );
  }
};
