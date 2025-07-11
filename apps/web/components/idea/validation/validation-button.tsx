import React from "react";
import { Button } from "@workspace/ui/components/button";
import { Sparkles } from "lucide-react";

interface ValidationButtonProps {
  onClick: () => void;
  isValidating: boolean;
  hasValidation: boolean;
}

const ValidationButton: React.FC<ValidationButtonProps> = ({
  onClick,
  isValidating,
  hasValidation,
}) => {
  return (
    <Button
      onClick={onClick}
      variant={hasValidation ? "outline" : "default"}
      disabled={isValidating}
      className={
        hasValidation ? "border-primary/20 bg-primary/5 text-primary" : ""
      }
    >
      {isValidating ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Validating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          {hasValidation ? "Re-validate Idea" : "Validate Idea with AI"}
        </>
      )}
    </Button>
  );
};

export default ValidationButton;
