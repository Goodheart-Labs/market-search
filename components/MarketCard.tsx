import { Market } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brandColors, brands } from "@/components/Brands";
import { MarketDetails } from "./MarketDetails";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  market: Omit<Market, "embedding" | "open_time">;
  index: number;
}

export function MarketCard({ market, index }: MarketCardProps) {
  const BrandLogo = brands[market.site as keyof typeof brands];
  return (
    <div className="group border-b border-zinc-200/50 last:border-0">
      <div className="py-3 flex items-start gap-4">
        <div className="text-zinc-400 text-sm font-mono pt-1 w-6 shrink-0">
          {index + 1}.
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="secondary"
              className={cn(
                "capitalize px-2 py-0.5 text-xs",
                brandColors[market.site as keyof typeof brandColors]
              )}
            >
              <BrandLogo className="h-4 w-4 mr-1 opacity-80" />
              {market.site}
            </Badge>
            <MarketDetails
              details={market.details as Record<string, unknown>}
            />
          </div>
          <h3 className="text-base leading-snug">
            <a
              href={market.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600 transition-colors flex items-start gap-1.5 group/link"
            >
              {market.title}
              <ExternalLink className="h-3.5 w-3.5 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
          </h3>
          {market.description && (
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-1 font-light mt-1">
              {market.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
