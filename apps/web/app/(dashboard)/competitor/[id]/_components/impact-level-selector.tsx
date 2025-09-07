"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface ImpactLevelSelectorProps {
  impactLevel: string;
  onChange: (impactLevel: string) => void;
}

const impactLevels = [
  { value: "LOW", label: "Low Impact" },
  { value: "MEDIUM", label: "Medium Impact" },
  { value: "HIGH", label: "High Impact" },
  { value: "CRITICAL", label: "Critical Impact" },
];

export function ImpactLevelSelector({
  impactLevel,
  onChange,
}: ImpactLevelSelectorProps) {
  const selectedLevel = impactLevels.find(
    (level) => level.value === impactLevel
  );

  return (
    <Select value={impactLevel} onValueChange={onChange}>
      <SelectTrigger className="w-auto min-w-[130px]">
        <SelectValue>{selectedLevel?.label || "Select impact"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {impactLevels.map((level) => (
          <SelectItem key={level.value} value={level.value}>
            {level.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
