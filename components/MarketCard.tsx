import { Market } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brands } from "@/components/Brands";

interface MarketCardProps {
  market: Omit<Market, "embedding" | "created_at">;
}

export function MarketCard({ market }: MarketCardProps) {
  const BrandLogo = brands[market.site as keyof typeof brands];
  return (
    <div className="group border-b border-zinc-200/50 last:border-0">
      <div className="py-5 space-y-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="capitalize bg-transparent text-zinc-500 bg-zinc-100 transition-colors px-2.5 py-0.5 text-xs"
          >
            <BrandLogo className="h-6 w-6 mr-1 opacity-80" />
            {market.site}
          </Badge>
        </div>
        <h3 className="font-serif text-lg leading-snug tracking-tight">
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
          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 font-light">
            {market.description}
          </p>
        )}
      </div>
    </div>
  );
}
