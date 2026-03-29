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
  Skull,
  Trophy,
} from "lucide-react";

/* ─── Small stat card ────────────────────────────────────────────── */
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
        background: "#0f1729",
        border: "1px solid rgba(148, 163, 184, 0.08)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: "rgba(148, 163, 184, 0.4)" }}
        >
          {label}
        </span>
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: highlight ? "#36d39a" : "rgba(148, 163, 184, 0.3)" }}
        />
      </div>
      <div
        className="text-3xl font-black font-mono leading-none"
        style={
          highlight
            ? { color: "#36d39a", textShadow: "0 0 24px rgba(54,211,154,0.4)" }
            : { color: "#ffffff" }
        }
      >
        {value}
      </div>
      {sub && (
        <p
          className="text-xs font-mono"
          style={{ color: "rgba(148, 163, 184, 0.35)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────── */
function SectionHeader({
  title,
  badge,
  badgeColor,
  dotColor,
  icon: Icon,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
  dotColor?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && (
        <Icon className="w-4 h-4" style={{ color: badgeColor || "#94a3b8" }} />
      )}
      <h2
        className="font-bold text-base"
        style={{ color: "#ffffff", letterSpacing: "-0.01em" }}
      >
        {title}
      </h2>
      {badge && (
        <div
          className="flex items-center gap-1 text-xs font-mono"
          style={{ color: badgeColor || "#36d39a" }}
        >
          {dotColor && (
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: dotColor,
                boxShadow: `0 0 6px ${dotColor}`,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          )}
          {badge}
        </div>
      )}
    </div>
  );
}

/* ─── Empty state placeholder ────────────────────────────────────── */
function EmptyState({
  message,
  sub,
  cta,
  onCta,
}: {
  message: string;
  sub?: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div
      className="py-14 flex flex-col items-center text-center rounded-xl"
      style={{
        border: "1px dashed rgba(148, 163, 184, 0.1)",
        background: "rgba(54, 211, 154, 0.01)",
      }}
    >
      <div
        className="text-2xl font-black font-mono mb-2"
        style={{ color: "rgba(148, 163, 184, 0.12)" }}
      >
        [ EMPTY ]
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "#ffffff" }}>
        {message}
      </h3>
      {sub && (
        <p className="text-xs mb-4 max-w-xs" style={{ color: "#94a3b8" }}>
          {sub}
        </p>
      )}
      {cta && onCta && (
        <button
          onClick={onCta}
          className="btn-primary px-5 py-2.5 text-xs font-semibold"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

/* ─── Token grid ─────────────────────────────────────────────────── */
function TokenGrid({
  tokens,
  isLoading,
}: {
  tokens: ReturnType<typeof useGetTokens>["data"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[280px] rounded-xl animate-pulse"
            style={{
              background: "#0f1729",
              border: "1px solid rgba(148, 163, 184, 0.06)",
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(tokens ?? []).map((token, index) => (
        <TokenCard key={token.id} token={token} index={index} />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tokens, isLoading } = useGetTokens();

  // Split into three buckets
  const liveTokens = tokens?.filter(
    (t) => !t.migrated && t.solRaised / t.bondingCurveTarget >= 0.05
  );
  const dudTokens = tokens?.filter(
    (t) => !t.migrated && t.solRaised / t.bondingCurveTarget < 0.05
  );
  const graduatedTokens = tokens?.filter((t) => t.migrated);

  const totalRaised = tokens?.reduce((a, t) => a + t.solRaised, 0) || 0;
  const migratedCount = graduatedTokens?.length || 0;
  const liveCount = liveTokens?.length || 0;

  return (
    <SiteLayout>
      <div className="flex-1" style={{ background: "#07101e" }}>
        <div className="container mx-auto px-5 py-8 max-w-7xl">

          {/* ── Page header ──────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(148, 163, 184, 0.07)",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    color: "rgba(148, 163, 184, 0.6)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Deployed
                </span>
                <div
                  className="flex items-center gap-1 text-xs font-mono"
                  style={{ color: "#36d39a" }}
                >
                  <span className="live-dot" />
                  AUTONOMOUS MODE ACTIVE
                </div>
              </div>
              <h1
                className="font-bold"
                style={{
                  color: "#ffffff",
                  fontSize: "1.75rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Wall St. Launchpad
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "#a0a0cc" }}
              >
                Permissionless memecoin launches on Solana with automated
                bonding curves and Raydium migration.
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

          {/* ── Stats row ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
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

          {/* ── Live Launches ─────────────────────────────────────── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                title="Live Launches"
                badge="LIVE"
                badgeColor="#36d39a"
                dotColor="#36d39a"
              />
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

            {isLoading ? (
              <TokenGrid tokens={undefined} isLoading={true} />
            ) : liveTokens && liveTokens.length > 0 ? (
              <TokenGrid tokens={liveTokens} isLoading={false} />
            ) : (
              <EmptyState
                message="No live launches yet"
                sub="Be the first to launch a fair memecoin on Wall St. Launchpad."
                cta="Launch First Token"
                onCta={() => setIsCreateModalOpen(true)}
              />
            )}
          </div>

          {/* ── Dud Tokens ───────────────────────────────────────── */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                title="Dud Tokens"
                badge="DEAD"
                badgeColor="#ef4444"
                icon={Skull}
              />
            </div>

            {isLoading ? (
              <TokenGrid tokens={undefined} isLoading={true} />
            ) : dudTokens && dudTokens.length > 0 ? (
              <TokenGrid tokens={dudTokens} isLoading={false} />
            ) : (
              <EmptyState
                message="No duds so far"
                sub="Tokens with less than 5% bonding curve progress will appear here."
              />
            )}
          </div>

          {/* ── Graduated ────────────────────────────────────────── */}
          {(graduatedTokens?.length ?? 0) > 0 && (
            <div className="mb-10">
              <SectionHeader
                title="Graduated"
                badge="RAYDIUM"
                badgeColor="#f59e0b"
                icon={Trophy}
              />
              <TokenGrid tokens={graduatedTokens} isLoading={false} />
            </div>
          )}
        </div>
      </div>

      <CreateTokenModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </SiteLayout>
  );
}
