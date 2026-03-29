"use client";

import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { TokenCard } from "@/components/token-card";
import { CreateTokenModal } from "@/components/create-token-modal";
import { useGetTokens } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/lib/launchpad";
import { Layers, TrendingUp, ArrowUpRight, Shield, Plus } from "lucide-react";

/* ─── Small stat card (wallst.fun dashboard style) ──────────────── */
function StatPanel({
  label,
  value,
  sub,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
  icon: React.ElementType;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{
        background: "#141628",
        border: "1px solid rgba(148, 153, 187, 0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: "rgba(160, 160, 204, 0.4)" }}
        >
          {label}
        </span>
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: highlight ? "#00ff9d" : "rgba(160, 160, 204, 0.3)" }}
        />
      </div>
      <div
        className="text-3xl font-black font-mono leading-none"
        style={
          highlight
            ? { color: "#00ff9d", textShadow: "0 0 24px rgba(0,255,157,0.4)" }
            : { color: "#ffffff" }
        }
      >
        {value}
      </div>
      {sub && (
        <p
          className="text-xs font-mono"
          style={{ color: "rgba(160, 160, 204, 0.35)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tokens, isLoading, refetch } = useGetTokens();

  const totalRaised = tokens?.reduce((a, t) => a + t.solRaised, 0) || 0;
  const migratedCount = tokens?.filter((t) => t.migrated).length || 0;
  const liveCount = tokens?.filter((t) => !t.migrated).length || 0;

  return (
    <SiteLayout>
      <div
        className="flex-1"
        style={{ background: "#0d0f1a" }}
      >
        <div className="container mx-auto px-5 py-8 max-w-7xl">

          {/* ── Page header: title + deployed badge + CTA ──────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(160, 160, 204, 0.07)",
                    border: "1px solid rgba(160, 160, 204, 0.1)",
                    color: "rgba(160, 160, 204, 0.6)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Deployed
                </span>
                <div
                  className="flex items-center gap-1 text-xs font-mono"
                  style={{ color: "#00ff9d" }}
                >
                  <span className="live-dot" />
                  AUTONOMOUS MODE ACTIVE
                </div>
              </div>
              <h1
                className="font-bold"
                style={{ color: "#ffffff", fontSize: "1.75rem", letterSpacing: "-0.02em" }}
              >
                Wall St. Launchpad
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "#a0a0cc" }}
              >
                Permissionless memecoin launches on Solana with automated bonding
                curves and Raydium migration.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Create Coin
              </button>

            </div>
          </div>

          {/* ── Stats row (4 panels) ────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatPanel
              label="SOL Price"
              value={`$${totalRaised.toFixed(2)}`}
              sub={`${liveCount} active launches`}
              highlight={true}
              icon={TrendingUp}
            />
            <StatPanel
              label="Platform Fee"
              value={`${PLATFORM_FEE_PERCENT}%`}
              sub="Per trade, auto-collected"
              icon={Shield}
            />
            <StatPanel
              label="Total Launches"
              value={tokens?.length || 0}
              sub="All time"
              icon={Layers}
            />
            <StatPanel
              label="Graduated"
              value={migratedCount}
              sub="Migrated to Raydium"
              icon={ArrowUpRight}
            />
          </div>

          {/* ── Live Launches (Scope-style card grid) ───────────────── */}
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2
                  className="font-bold text-base"
                  style={{ color: "#ffffff", letterSpacing: "-0.01em" }}
                >
                  Live Launches
                </h2>
                <div
                  className="flex items-center gap-1 text-xs font-mono"
                  style={{ color: "#00ff9d" }}
                >
                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                  LIVE
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-ghost px-3 py-1.5 text-xs font-mono"
                  style={{ letterSpacing: "0.04em" }}
                >
                  Trending
                </button>
                <button
                  className="btn-ghost px-3 py-1.5 text-xs font-mono hidden sm:block"
                  style={{ letterSpacing: "0.04em" }}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[280px] rounded-xl animate-pulse"
                    style={{
                      background: "#141620",
                      border: "1px solid rgba(160, 160, 204, 0.06)",
                    }}
                  />
                ))}
              </div>
            ) : tokens && tokens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map((token, index) => (
                  <TokenCard key={token.id} token={token} index={index} />
                ))}
              </div>
            ) : (
              <div
                className="py-24 flex flex-col items-center text-center rounded-xl"
                style={{
                  border: "1px dashed rgba(160, 160, 204, 0.1)",
                  background: "rgba(0, 255, 157, 0.01)",
                }}
              >
                <div
                  className="text-3xl font-black font-mono mb-3"
                  style={{ color: "rgba(160, 160, 204, 0.12)" }}
                >
                  [ EMPTY ]
                </div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "#ffffff" }}
                >
                  No launches yet
                </h3>
                <p
                  className="text-xs mb-5 max-w-xs"
                  style={{ color: "#a0a0cc" }}
                >
                  Be the first to launch a fair memecoin on Wall St. Launchpad.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary px-5 py-2.5 text-xs font-semibold"
                >
                  Launch First Token
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTokenModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </SiteLayout>
  );
}
