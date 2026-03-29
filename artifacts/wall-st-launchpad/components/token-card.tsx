"use client";

import { Token } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Zap } from "lucide-react";
import { useState } from "react";

interface TokenCardProps {
  token: Token;
  index: number;
}

export function TokenCard({ token }: TokenCardProps) {
  const [hovered, setHovered] = useState(false);
  const progressPercent = Math.min(
    100,
    Math.max(0, (token.solRaised / token.bondingCurveTarget) * 100)
  );

  return (
    <div
      className="relative flex flex-col h-full rounded-xl p-4 cursor-pointer transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, hsl(240 52% 13%) 0%, hsl(240 50% 11%) 100%)"
          : "hsl(240 50% 11%)",
        border: hovered
          ? "1px solid rgba(0, 255, 157, 0.35)"
          : "1px solid hsl(240 40% 18%)",
        boxShadow: hovered
          ? "0 0 30px rgba(0, 255, 157, 0.06), inset 0 0 40px rgba(0, 255, 157, 0.025)"
          : "none",
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: "hsl(240 48% 16%)",
            border: "1px solid hsl(240 40% 22%)",
          }}
        >
          {token.imageUrl ? (
            <img
              src={token.imageUrl}
              alt={token.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="font-black font-mono text-base"
              style={{ color: "#00ff9d" }}
            >
              {token.ticker.charAt(0)}
            </span>
          )}
        </div>

        {/* Name & ticker */}
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold text-sm text-white leading-tight line-clamp-1"
            title={token.name}
          >
            {token.name}
          </h3>
          <span
            className="text-xs font-mono font-medium mt-0.5 inline-block"
            style={{ color: "#00ff9d" }}
          >
            ${token.ticker}
          </span>
        </div>

        {/* Status badge */}
        {token.migrated ? (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium shrink-0"
            style={{
              background: "rgba(0, 255, 157, 0.1)",
              border: "1px solid rgba(0, 255, 157, 0.3)",
              color: "#00ff9d",
            }}
          >
            <CheckCircle2 className="w-3 h-3" />
            Done
          </div>
        ) : (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono shrink-0"
            style={{
              background: "rgba(0, 255, 157, 0.06)",
              border: "1px solid rgba(0, 255, 157, 0.18)",
              color: "rgba(0, 255, 157, 0.8)",
            }}
          >
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            LIVE
          </div>
        )}
      </div>

      {/* Description */}
      <p
        className="text-xs leading-relaxed line-clamp-2 flex-1 mb-4"
        style={{ color: "hsl(240 28% 58%)" }}
      >
        {token.description || "No description provided."}
      </p>

      {/* Bonding curve progress */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "hsl(240 28% 50%)" }}
          >
            <Zap className="w-3 h-3" style={{ color: "#00ff9d" }} />
            Bonding Curve
          </span>
          <span className="text-xs font-mono" style={{ color: "hsl(240 28% 58%)" }}>
            <span style={{ color: "#00ff9d", fontWeight: 600 }}>
              {progressPercent.toFixed(1)}%
            </span>
            <span className="ml-1">
              {token.solRaised.toFixed(1)}/{token.bondingCurveTarget} SOL
            </span>
          </span>
        </div>
        {/* Track */}
        <div
          className="h-1"
          style={{
            background: "rgba(0, 255, 157, 0.08)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00cc7a, #00ff9d)",
              boxShadow: "0 0 8px rgba(0, 255, 157, 0.6)",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid hsl(240 40% 18%)" }}
      >
        <span
          className="text-xs font-mono"
          style={{ color: "hsl(240 28% 42%)" }}
        >
          {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
        </span>
        {token.migrated && (
          <span
            className="text-xs font-mono font-medium"
            style={{ color: "#00ff9d" }}
          >
            Raydium ↗
          </span>
        )}
      </div>
    </div>
  );
}
