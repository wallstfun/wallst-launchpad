"use client";

import { Token } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";
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
      className="w-full rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "hsl(240 50% 13%)" : "hsl(240 50% 11%)",
        border: hovered
          ? "1px solid rgba(0, 255, 157, 0.25)"
          : "1px solid hsl(240 40% 18%)",
        boxShadow: hovered
          ? "0 4px 24px rgba(0,255,157,0.04)"
          : "none",
      }}
    >
      <div className="flex items-center gap-3">

        {/* ── Avatar ─────────────────────────────────────────────── */}
        <div
          className="shrink-0 rounded-lg flex items-center justify-center overflow-hidden"
          style={{
            width: 40,
            height: 40,
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
              className="font-black font-mono text-sm"
              style={{ color: "#00ff9d" }}
            >
              {token.ticker.charAt(0)}
            </span>
          )}
        </div>

        {/* ── Token name + ticker ─────────────────────────────────── */}
        <div className="shrink-0" style={{ width: 168 }}>
          <p
            className="text-sm font-semibold text-white leading-tight line-clamp-1"
            title={token.name}
          >
            {token.name}
          </p>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: "#00ff9d" }}
          >
            ${token.ticker}
          </span>
        </div>

        {/* ── Description ────────────────────────────────────────── */}
        <p
          className="hidden md:block flex-1 min-w-0 text-xs leading-relaxed line-clamp-1"
          style={{ color: "hsl(240 28% 50%)" }}
        >
          {token.description || "—"}
        </p>

        {/* ── Bonding curve ──────────────────────────────────────── */}
        <div className="shrink-0 hidden sm:flex flex-col gap-1" style={{ width: 190 }}>
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "#00ff9d" }}
            >
              {progressPercent.toFixed(1)}%
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: "hsl(240 28% 42%)" }}
            >
              {token.solRaised.toFixed(1)}/{token.bondingCurveTarget} SOL
            </span>
          </div>
          {/* Progress track */}
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 5, background: "rgba(0,255,157,0.08)" }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00cc7a, #00ff9d)",
                boxShadow: "0 0 8px rgba(0,255,157,0.55)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* ── Status + time ──────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 ml-auto shrink-0"
          style={{ width: 110, justifyContent: "flex-end" }}
        >
          <span
            className="text-xs font-mono hidden lg:block"
            style={{ color: "hsl(240 28% 36%)" }}
          >
            {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
          </span>

          {token.migrated ? (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-semibold shrink-0"
              style={{
                background: "rgba(0,255,157,0.08)",
                border: "1px solid rgba(0,255,157,0.28)",
                color: "#00ff9d",
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Done
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono shrink-0"
              style={{
                background: "rgba(0,255,157,0.05)",
                border: "1px solid rgba(0,255,157,0.15)",
                color: "rgba(0,255,157,0.85)",
              }}
            >
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              LIVE
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile-only progress (visible only on xs) ───────────── */}
      <div
        className="flex sm:hidden mt-2.5 items-center gap-3"
        style={{ paddingLeft: 52 }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono" style={{ color: "#00ff9d", fontWeight: 700 }}>
              {progressPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-mono" style={{ color: "hsl(240 28% 42%)" }}>
              {token.solRaised.toFixed(1)}/{token.bondingCurveTarget} SOL
            </span>
          </div>
          <div
            className="rounded-full"
            style={{ height: 4, background: "rgba(0,255,157,0.08)", overflow: "hidden" }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00cc7a, #00ff9d)",
                boxShadow: "0 0 6px rgba(0,255,157,0.5)",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
