"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface MoveTypeSelectorProps {
  moveType: string;
  onChange: (moveType: string) => void;
}

const moveTypes = [
  { value: "PRODUCT_LAUNCH", label: "Product Launch" },
  { value: "FEATURE_UPDATE", label: "Feature Update" },
  { value: "PRICING_CHANGE", label: "Pricing Change" },
  { value: "MARKET_EXPANSION", label: "Market Expansion" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "ACQUISITION", label: "Acquisition" },
  { value: "OTHER", label: "Other" },
];

export function MoveTypeSelector({
  moveType,
  onChange,
}: MoveTypeSelectorProps) {
  const selectedMoveType = moveTypes.find((type) => type.value === moveType);

  return (
    <Select value={moveType} onValueChange={onChange}>
      <SelectTrigger className="w-auto min-w-[140px]">
        <SelectValue>{selectedMoveType?.label || "Select type"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {moveTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
