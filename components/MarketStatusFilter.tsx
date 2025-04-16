import { MarketStatus } from "@/lib/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CircleDot, CircleSlash, CircleDashed } from "lucide-react";

interface MarketStatusFilterProps {
  value: MarketStatus;
  onChange: (value: MarketStatus) => void;
}

const itemClassName = "px-4 h-12";

export function MarketStatusFilter({
  value,
  onChange,
}: MarketStatusFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      variant="outline"
      className="!shadow-none"
      onValueChange={(value) => onChange(value as MarketStatus)}
    >
      <ToggleGroupItem
        value="open"
        aria-label="Open markets"
        className="pl-3 pr-4 h-12"
      >
        <CircleDot className="h-3 w-3 inline" />
        Open
      </ToggleGroupItem>
      <ToggleGroupItem
        value="closed"
        aria-label="Closed markets"
        className="px-4 h-12"
      >
        <CircleSlash className="h-3 w-3 inline" />
        Closed
      </ToggleGroupItem>
      <ToggleGroupItem
        value="all"
        aria-label="All markets"
        className="pl-2 pr-2 h-12"
      >
        <CircleDashed className="h-3 w-3 inline" />
        All
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
