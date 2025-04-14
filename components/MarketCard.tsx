import { Market } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brands } from "@/components/Brands";

interface MarketCardProps {
  market: Omit<Market, "embedding" | "created_at">;
}

export function MarketCard({ market }: MarketCardProps) {
  const BrandLogo = brands[market.site as keyof typeof brands];
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                <BrandLogo className="h-4 w-4 mr-2" />
                {market.site}
              </Badge>
            </div>
            <h3 className="font-medium leading-tight">
              <a
                href={market.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                {market.title}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </h3>
            {market.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {market.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
