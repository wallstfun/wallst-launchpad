import { Token } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface TokenCardProps {
  token: Token;
  index: number;
}

export function TokenCard({ token, index }: TokenCardProps) {
  const progressPercent = Math.min(100, Math.max(0, (token.solRaised / token.bondingCurveTarget) * 100));
  
  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 flex flex-col h-full terminal-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center">
            {token.imageUrl ? (
              <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-primary font-bold text-lg">{token.ticker.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground line-clamp-1" title={token.name}>
              {token.name}
            </h3>
            <div className="mt-0.5">
              <span className="text-xs font-mono text-primary">
                ${token.ticker}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 mb-4 flex-1">
        {token.description}
      </p>

      <div className="space-y-4 mt-auto">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs text-muted-foreground">Bonding Curve</span>
            <span className="font-mono text-xs text-foreground flex items-center gap-1">
              {token.solRaised.toFixed(2)} <span className="text-muted-foreground">/ {token.bondingCurveTarget} SOL</span>
              <span className="text-primary ml-1">{progressPercent.toFixed(1)}%</span>
            </span>
          </div>
          
          <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 bottom-0 bg-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40">
          <div className="text-xs text-muted-foreground font-mono">
            {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
          </div>
          
          {token.migrated ? (
            <div className="flex items-center gap-1 text-xs font-mono text-primary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Migrated
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
