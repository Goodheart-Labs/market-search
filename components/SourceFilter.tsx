import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as Checkbox from "@radix-ui/react-checkbox";

export type MarketSource = "manifold" | "polymarket" | "kalshi";

const SOURCES: { id: MarketSource; label: string }[] = [
  { id: "manifold", label: "Manifold" },
  { id: "polymarket", label: "Polymarket" },
  { id: "kalshi", label: "Kalshi" },
];

interface SourceFilterProps {
  selectedSources: MarketSource[];
  onChange: (sources: MarketSource[]) => void;
}

export function SourceFilter({ selectedSources, onChange }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {SOURCES.map((source) => (
        <div key={source.id} className="flex items-center">
          <Checkbox.Root
            className={cn(
              "peer h-5 w-5 shrink-0 rounded border border-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-white"
            )}
            checked={selectedSources.includes(source.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selectedSources, source.id]);
              } else {
                onChange(selectedSources.filter((s) => s !== source.id));
              }
            }}
            id={`source-${source.id}`}
          >
            <Checkbox.Indicator className="flex items-center justify-center text-current">
              <Check className="h-3.5 w-3.5" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label
            htmlFor={`source-${source.id}`}
            className="pl-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
          >
            {source.label}
          </label>
        </div>
      ))}
    </div>
  );
}
