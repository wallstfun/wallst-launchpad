"use client";

import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { TokenCard } from "@/components/token-card";
import { CreateTokenModal } from "@/components/create-token-modal";
import { useGetTokens } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/lib/launchpad";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tokens, isLoading } = useGetTokens();

  const totalRaised =
    tokens?.reduce((acc, token) => acc + token.solRaised, 0) || 0;
  const migratedCount = tokens?.filter((t) => t.migrated).length || 0;

  const stats = [
    { label: "Total Launches", value: tokens?.length || 0, highlight: false },
    { label: "SOL Raised", value: totalRaised.toFixed(2), highlight: true },
    { label: "Graduated", value: migratedCount, highlight: false },
    { label: "Platform Fee", value: `${PLATFORM_FEE_PERCENT}%`, highlight: false },
  ];

  return (
    <SiteLayout>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="pt-24 pb-20 relative"
        style={{ borderBottom: "1px solid hsl(240 40% 18%)" }}
      >
        {/* Radial green glow behind heading */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,255,157,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center relative z-10">
          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-10"
            style={{
              background: "rgba(0, 255, 157, 0.06)",
              border: "1px solid rgba(0, 255, 157, 0.2)",
              color: "rgba(0, 255, 157, 0.85)",
              letterSpacing: "0.08em",
            }}
          >
            <span className="live-dot" />
            LIVE ON SOLANA DEVNET
          </div>

          <h1
            className="text-5xl md:text-6xl font-black tracking-tight text-white mb-5"
            style={{
              letterSpacing: "-0.03em",
              textShadow: "0 0 60px rgba(0, 255, 157, 0.12)",
            }}
          >
            Wall St.{" "}
            <span style={{ color: "#00ff9d" }}>Launchpad</span>
          </h1>

          <p
            className="text-sm md:text-base max-w-lg mb-10 leading-relaxed"
            style={{ color: "hsl(240 28% 58%)" }}
          >
            Fair memecoin launches with automated bonding curves. Reach the
            target and migrate automatically to Raydium liquidity pools.
          </p>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary px-8 py-3 text-sm font-bold tracking-wide"
          >
            + Create Coin
          </button>
        </div>
      </section>

      {/* ─── Stats bar ─────────────────────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid hsl(240 40% 18%)" }}>
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ borderLeft: "1px solid hsl(240 40% 18%)" }}
          >
            {stats.map(({ label, value, highlight }) => (
              <div
                key={label}
                className="py-6 px-6 flex flex-col gap-1"
                style={{ borderRight: "1px solid hsl(240 40% 18%)" }}
              >
                <div
                  className="text-2xl font-black font-mono"
                  style={
                    highlight
                      ? {
                          color: "#00ff9d",
                          textShadow: "0 0 20px rgba(0, 255, 157, 0.4)",
                        }
                      : { color: "#ffffff" }
                  }
                >
                  {value}
                </div>
                <div
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "hsl(240 28% 45%)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Launches grid ────────────────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <h2
                className="text-xs font-mono font-semibold uppercase tracking-[0.15em]"
                style={{ color: "hsl(240 28% 55%)" }}
              >
                Live Launches
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-ghost px-3 py-1.5 text-xs font-mono"
                style={{ letterSpacing: "0.05em" }}
              >
                Trending
              </button>
              <button
                className="btn-ghost px-3 py-1.5 text-xs font-mono hidden sm:block"
                style={{ letterSpacing: "0.05em" }}
              >
                Recent
              </button>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-xl animate-pulse"
                  style={{
                    background: "hsl(240 50% 11%)",
                    border: "1px solid hsl(240 40% 18%)",
                  }}
                />
              ))}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tokens.map((token, index) => (
                <TokenCard key={token.id} token={token} index={index} />
              ))}
            </div>
          ) : (
            <div
              className="py-24 flex flex-col items-center justify-center text-center rounded-xl"
              style={{
                border: "1px dashed hsl(240 40% 22%)",
                background: "rgba(0, 255, 157, 0.015)",
              }}
            >
              <div
                className="text-4xl font-black font-mono mb-3"
                style={{ color: "hsl(240 40% 22%)" }}
              >
                [ ]
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                No tokens launched yet
              </h3>
              <p
                className="text-xs mb-5"
                style={{ color: "hsl(240 28% 45%)" }}
              >
                Be the first to launch a memecoin on Wall St. Launchpad.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary px-5 py-2 text-xs font-semibold"
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
