import { DollarSignIcon, PercentIcon, UsersIcon } from "lucide-react";
import { ReactNode } from "react";
interface MarketDetailsProps {
  details: Record<string, unknown>;
}

type Detail = {
  propertyName: string;
  icon: typeof PercentIcon;
  process?: (value: unknown) => ReactNode;
  title: (value: unknown) => string;
};

const possibleDetails: Detail[] = [
  {
    propertyName: "probability",
    icon: PercentIcon,
    process: (value) => {
      if (typeof value === "number") {
        return `${Math.round(value * 100)}`;
      }
      return "N/A";
    },
    title: (value) => {
      return `Probability: ${Math.round(value * 100)}%`;
    },
  },
  {
    propertyName: "uniqueBettorCount",
    icon: UsersIcon,
    process: (value) => {
      if (typeof value === "number") {
        return `${value}`;
      }
      return "N/A";
    },
    title: (value) => {
      return `Unique Bettors: ${value}`;
    },
  },
  {
    propertyName: "volume",
    icon: DollarSignIcon,
    process: (value) => {
      if (typeof value === "number") {
        return `${Math.round(value)}`;
      }
      return "N/A";
    },
    title: (value) => {
      return `Trading Volume: ${Math.round(value as number)}`;
    },
  },
];

export function MarketDetails({ details }: MarketDetailsProps) {
  console.log("Market details:", details);

  return (
    <div className="flex items-center gap-1">
      {possibleDetails.map(({ propertyName, icon: Icon, process, title }) => {
        if (!(propertyName in details)) {
          return null;
        }
        return (
          <div
            key={propertyName}
            className="flex items-center gap-1 text-xs text-zinc-500 border border-zinc-200 rounded-md px-1.5 py-0.5"
            title={title(details[propertyName])}
          >
            <Icon className="h-3 w-3" />
            {process
              ? process(details[propertyName])
              : (details[propertyName] as ReactNode)}
          </div>
        );
      })}
    </div>
  );
}
