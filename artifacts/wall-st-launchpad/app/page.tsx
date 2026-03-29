"use client";

import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { TokenCard } from "@/components/token-card";
import { CreateTokenModal } from "@/components/create-token-modal";
import { useGetTokens } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/lib/launchpad";
import {
  Layers,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Plus,
  ChevronRight,
} from "lucide-react";

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  highlight,
  sub,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  highlight: boolean;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: "#16162a",
        border: "1px solid rgba(160, 160, 204, 0.08)",
        boxShadow: highlight
          ? "0 0 30px rgba(0, 255, 157, 0.04), inset 0 0 40px rgba(0, 255, 157, 0.02)"
          : "none",
      }}
    >
      {/* Subtle corner glow for SOL card */}
      {highlight && (
        <div
          className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, rgba(0,255,157,0.1) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest"
          style={{ color: "rgba(160, 160, 204, 0.45)" }}
        >
          <Icon
            className="w-3.5 h-3.5"
            style={{ color: highlight ? "#00ff9d" : "rgba(160, 160, 204, 0.5)" }}
          />
          {label}
        </div>
        <ChevronRight
          className="w-3.5 h-3.5"
          style={{ color: "rgba(160, 160, 204, 0.2)" }}
        />
      </div>

      <div
        className="text-4xl font-black font-mono leading-none"
        style={
          highlight
            ? {
                color: "#00ff9d",
                textShadow: "0 0 28px rgba(0, 255, 157, 0.45)",
              }
            : { color: "#ffffff" }
        }
      >
        {value}
        {suffix && (
          <span
            className="text-2xl"
            style={{
              color: highlight ? "rgba(0, 255, 157, 0.7)" : "#a0a0cc",
              marginLeft: 3,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {sub && (
        <p
          className="text-xs font-mono"
          style={{ color: "rgba(160, 160, 204, 0.38)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tokens, isLoading } = useGetTokens();

  const totalRaised =
    tokens?.reduce((acc, t) => acc + t.solRaised, 0) || 0;
  const migratedCount = tokens?.filter((t) => t.migrated).length || 0;
  const liveCount = tokens?.filter((t) => !t.migrated).length || 0;

  return (
    <SiteLayout>
      {/* ═══════════════════════════════════════════════════════════
          DASHBOARD HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative"
        style={{
          background:
            "linear-gradient(160deg, #05050f 0%, #0a0a1f 55%, #0d0d24 100%)",
          borderBottom: "1px solid rgba(160, 160, 204, 0.07)",
        }}
      >
        {/* Ambient green glow on left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 18% 50%, rgba(0,255,157,0.035) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-4 md:px-6 py-14 md:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* ── Left column ────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Protocol badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-7"
                style={{
                  background: "rgba(0, 255, 157, 0.05)",
                  border: "1px solid rgba(0, 255, 157, 0.18)",
                  color: "rgba(0, 255, 157, 0.8)",
                  letterSpacing: "0.09em",
                }}
              >
                <span className="live-dot" />
                FAIR LAUNCH PROTOCOL · SOLANA DEVNET
              </div>

              {/* Title: white + green glow on key word */}
              <h1
                className="font-black leading-[1.05] mb-5"
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.035em",
                  color: "#ffffff",
                }}
              >
                Wall Street
                <br />
                <span
                  style={{
                    color: "#ffffff",
                    textShadow:
                      "0 0 30px #00ff9d, 0 0 80px rgba(0, 255, 157, 0.35)",
                  }}
                >
                  Launchpad
                </span>
              </h1>

              <p
                className="text-sm leading-relaxed mb-8 max-w-sm"
                style={{ color: "#a0a0cc" }}
              >
                Permissionless memecoin launches with automated bonding curves.
                Hit{" "}
                <span
                  className="font-mono font-bold"
                  style={{ color: "#ffffff" }}
                >
                  42 SOL
                </span>{" "}
                and automatically migrate to Raydium liquidity.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold"
                  style={{ letterSpacing: "0.04em" }}
                >
                  <Plus className="w-4 h-4" />
                  Create Coin
                </button>
                <button className="btn-ghost flex items-center gap-2 px-5 py-3 text-sm">
                  View Docs
                </button>
              </div>

              {/* Mini stats row */}
              <div
                className="flex flex-wrap items-center gap-4 pt-6 text-xs font-mono"
                style={{ borderTop: "1px solid rgba(160, 160, 204, 0.07)" }}
              >
                <span style={{ color: "#a0a0cc" }}>
                  <span style={{ color: "#00ff9d", fontWeight: 700 }}>
                    {liveCount}
                  </span>{" "}
                  LIVE
                </span>
                <span
                  style={{
                    display: "inline-block",
                    width: 1,
                    height: 12,
                    background: "rgba(160, 160, 204, 0.2)",
                  }}
                />
                <span style={{ color: "#a0a0cc" }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    {migratedCount}
                  </span>{" "}
                  GRADUATED
                </span>
                <span
                  style={{
                    display: "inline-block",
                    width: 1,
                    height: 12,
                    background: "rgba(160, 160, 204, 0.2)",
                  }}
                />
                <span style={{ color: "rgba(160, 160, 204, 0.5)" }}>
                  RAYDIUM LAUNCHLAB
                </span>
              </div>
            </div>

            {/* ── Right column: 2×2 stat cards ──────────────────── */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Launches"
                  value={tokens?.length || 0}
                  icon={Layers}
                  highlight={false}
                  sub="Total tokens created"
                />
                <StatCard
                  label="SOL Raised"
                  value={totalRaised.toFixed(1)}
                  suffix=" SOL"
                  icon={TrendingUp}
                  highlight={true}
                  sub="Across all launches"
                />
                <StatCard
                  label="Graduated"
                  value={migratedCount}
                  icon={ArrowUpRight}
                  highlight={false}
                  sub="Migrated to Raydium"
                />
                <StatCard
                  label="Platform Fee"
                  value={PLATFORM_FEE_PERCENT}
                  suffix="%"
                  icon={Shield}
                  highlight={false}
                  sub="Per trade, auto-collected"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LIVE LAUNCHES — Trading feed
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6">

          {/* Feed header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="live-dot" />
              <h2
                className="text-xs font-mono font-bold uppercase"
                style={{ color: "#a0a0cc", letterSpacing: "0.15em" }}
              >
                Live Launches
              </h2>
              {tokens && tokens.length > 0 && (
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(0, 255, 157, 0.07)",
                    border: "1px solid rgba(0, 255, 157, 0.2)",
                    color: "#00ff9d",
                  }}
                >
                  {tokens.length}
                </span>
              )}
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

          {/* Column headers */}
          {!isLoading && tokens && tokens.length > 0 && (
            <div
              className="hidden md:flex items-center mb-2 px-4 text-xs font-mono uppercase"
              style={{
                color: "rgba(160, 160, 204, 0.3)",
                letterSpacing: "0.1em",
              }}
            >
              <div style={{ width: 40 }} />
              <div style={{ width: 180, marginLeft: 12 }}>Token</div>
              <div className="flex-1 mx-3">Description</div>
              <div style={{ width: 190 }}>Bonding Curve</div>
              <div style={{ width: 110, textAlign: "right" }}>Status</div>
            </div>
          )}

          {/* Rows */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[68px] rounded-xl animate-pulse"
                  style={{
                    background: "#16162a",
                    border: "1px solid rgba(160, 160, 204, 0.06)",
                  }}
                />
              ))}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((token, index) => (
                <TokenCard key={token.id} token={token} index={index} />
              ))}
            </div>
          ) : (
            <div
              className="py-24 flex flex-col items-center text-center rounded-2xl"
              style={{
                border: "1px dashed rgba(160, 160, 204, 0.12)",
                background: "rgba(0, 255, 157, 0.01)",
              }}
            >
              <div
                className="text-3xl font-black font-mono mb-3"
                style={{ color: "rgba(160, 160, 204, 0.15)" }}
              >
                [ EMPTY ]
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                No tokens launched yet
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
      </section>

      <CreateTokenModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </SiteLayout>
  );
}
