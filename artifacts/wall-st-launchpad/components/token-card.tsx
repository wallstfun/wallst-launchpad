"use client";

import { Token } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface TokenCardProps {
  token: Token;
  index: number;
}

export function TokenCard({ token, index }: TokenCardProps) {
  const [hovered, setHovered] = useState(false);

  const progressPercent = Math.min(
    100,
    Math.max(0, (token.solRaised / token.bondingCurveTarget) * 100)
  );

  const shortAddress = token.mintAddress
    ? `${token.mintAddress.slice(0, 6)}...${token.mintAddress.slice(-4)}`
    : "pending...";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl flex flex-col gap-0 overflow-hidden cursor-pointer transition-all duration-150"
      style={{
        background: hovered ? "#1e1e38" : "#16162a",
        border: hovered
          ? "1px solid rgba(0, 255, 157, 0.18)"
          : "1px solid rgba(160, 160, 204, 0.07)",
        boxShadow: hovered ? "0 4px 30px rgba(0,255,157,0.04)" : "none",
      }}
    >
      {/* ── Card body ────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-3">

        {/* Header row: avatar + name + status */}
        <div className="flex items-center gap-3">
          {/* Rank */}
          <span
            className="text-xs font-mono font-bold shrink-0"
            style={{ color: "rgba(160, 160, 204, 0.3)", minWidth: 16 }}
          >
            #{index + 1}
          </span>

          {/* Avatar */}
          <div
            className="shrink-0 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              width: 38,
              height: 38,
              background: "#1a1a32",
              border: "1px solid rgba(160, 160, 204, 0.1)",
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

          {/* Name + ticker */}
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-sm leading-tight line-clamp-1"
              style={{ color: "#ffffff" }}
              title={token.name}
            >
              {token.name}
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: "rgba(160, 160, 204, 0.6)" }}
            >
              {token.ticker}
            </p>
          </div>

          {/* Status */}
          {token.migrated ? (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold shrink-0"
              style={{
                background: "rgba(0, 255, 157, 0.08)",
                border: "1px solid rgba(0, 255, 157, 0.25)",
                color: "#00ff9d",
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Done
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono shrink-0"
              style={{
                background: "rgba(0, 255, 157, 0.05)",
                border: "1px solid rgba(0, 255, 157, 0.15)",
                color: "rgba(0, 255, 157, 0.85)",
              }}
            >
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              LIVE
            </div>
          )}
        </div>

        {/* Description */}
        {token.description && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "#a0a0cc" }}
          >
            {token.description}
          </p>
        )}

        {/* Stats grid: 24h VOL style */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p
              className="text-xs font-mono uppercase mb-0.5"
              style={{ color: "rgba(160, 160, 204, 0.4)", letterSpacing: "0.08em" }}
            >
              SOL RAISED
            </p>
            <p
              className="text-sm font-bold font-mono"
              style={{ color: "#ffffff" }}
            >
              {token.solRaised.toFixed(2)}{" "}
              <span style={{ color: "rgba(160, 160, 204, 0.5)", fontSize: 11 }}>
                SOL
              </span>
            </p>
          </div>
          <div>
            <p
              className="text-xs font-mono uppercase mb-0.5"
              style={{ color: "rgba(160, 160, 204, 0.4)", letterSpacing: "0.08em" }}
            >
              TARGET
            </p>
            <p
              className="text-sm font-bold font-mono"
              style={{ color: "#ffffff" }}
            >
              {token.bondingCurveTarget}{" "}
              <span style={{ color: "rgba(160, 160, 204, 0.5)", fontSize: 11 }}>
                SOL
              </span>
            </p>
          </div>
        </div>

        {/* Contract address */}
        <div>
          <p
            className="text-xs font-mono uppercase mb-1"
            style={{ color: "rgba(160, 160, 204, 0.4)", letterSpacing: "0.08em" }}
          >
            CONTRACT ADDRESS
          </p>
          <p
            className="text-xs font-mono"
            style={{ color: "rgba(160, 160, 204, 0.6)" }}
          >
            {shortAddress}
          </p>
        </div>

        {/* Bonding progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p
              className="text-xs font-mono uppercase"
              style={{
                color: "rgba(160, 160, 204, 0.4)",
                letterSpacing: "0.08em",
              }}
            >
              BONDING PROGRESS
            </p>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "#00ff9d" }}
            >
              {progressPercent.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "rgba(0, 255, 157, 0.07)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00cc7a, #00ff9d)",
                boxShadow: "0 0 8px rgba(0,255,157,0.5)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Footer button — matches wallst.fun "Trade on Terminal" ─── */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid rgba(160, 160, 204, 0.06)" }}
      >
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: hovered
              ? "rgba(0, 255, 157, 0.1)"
              : "rgba(0, 255, 157, 0.06)",
            border: "1px solid rgba(0, 255, 157, 0.2)",
            color: "#00ff9d",
            letterSpacing: "0.03em",
          }}
        >
          {token.migrated ? (
            <>
              View on Raydium
              <ExternalLink className="w-3 h-3" />
            </>
          ) : (
            <>
              Buy on Launchpad
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>

        <p
          className="text-center text-xs font-mono mt-2"
          style={{ color: "rgba(160, 160, 204, 0.3)" }}
        >
          {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
