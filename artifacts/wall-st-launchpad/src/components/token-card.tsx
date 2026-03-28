import { Token } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { Rocket, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface TokenCardProps {
  token: Token;
  index: number;
}

export function TokenCard({ token, index }: TokenCardProps) {
  const progressPercent = Math.min(100, Math.max(0, (token.solRaised / token.bondingCurveTarget) * 100));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all duration-300 flex flex-col h-full overflow-hidden hover:shadow-[0_8px_30px_-12px_rgba(0,255,136,0.15)]"
    >
      {/* Accent Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center">
            {token.imageUrl ? (
              <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
            ) : (
              <Rocket className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground line-clamp-1" title={token.name}>
              {token.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                ${token.ticker}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
        {token.description}
      </p>

      <div className="space-y-4 mt-auto">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Bonding Curve</span>
            <span className="font-mono text-foreground font-semibold flex items-center gap-1">
              {token.solRaised.toFixed(2)} <span className="text-muted-foreground">/ {token.bondingCurveTarget} SOL</span>
            </span>
          </div>
          
          <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_10px_rgba(0,255,136,0.8)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
          </div>
          
          {token.migrated ? (
            <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Migrated
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
              Live
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
