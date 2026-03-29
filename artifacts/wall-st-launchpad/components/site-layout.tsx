"use client";

import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import Link from "next/link";
import {
  Wallet,
  LogOut,
  LayoutDashboard,
  Zap,
  Info,
  Settings,
} from "lucide-react";

/* ─── Ticker content — duplicated for seamless loop ──────────────── */
const TICKER_SEGMENTS = [
  { label: "SYSTEM STATUS", value: "ONLINE", green: true },
  null,
  { label: "PLATFORM FEE", value: "0.75%", green: false },
  null,
  { label: "NETWORK", value: "SOL DEVNET", green: false },
  null,
  { label: "WALL ST.", value: "LAUNCHPAD", green: false },
  null,
  { label: "RAYDIUM", value: "LAUNCHLAB", green: false },
  null,
  { label: "BONDING CURVE", value: "42 SOL TARGET", green: false },
  null,
  { label: "PHANTOM", value: "REQUIRED", green: false },
  null,
];

function TickerItem({
  seg,
}: {
  seg: { label: string; value: string; green: boolean } | null;
}) {
  if (!seg)
    return (
      <span
        className="mx-5 select-none font-mono"
        style={{ color: "rgba(148, 163, 184, 0.2)" }}
      >
        ///
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span style={{ color: "rgba(148, 163, 184, 0.45)" }}>{seg.label}:</span>
      <span
        style={{
          color: seg.green ? "#36d39a" : "#a0a0cc",
          textShadow: seg.green ? "0 0 12px rgba(0,255,157,0.7)" : "none",
          fontWeight: seg.green ? 700 : 400,
        }}
      >
        {seg.value}
      </span>
    </span>
  );
}

/* ─── Nav tabs ───────────────────────────────────────────────────── */
const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Zap, label: "Live Launches", active: false },
  { icon: Info, label: "How It Works", active: false },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div
      className="min-h-screen flex flex-col text-foreground"
      style={{ fontFamily: "Inter, sans-serif", background: "#07101e" }}
    >
      {/* ── Scrolling ticker (wallst.fun style) ─────────────────────── */}
      <div
        className="w-full overflow-hidden shrink-0"
        style={{
          height: 30,
          background: "#0f1729",
          borderBottom: "1px solid rgba(148, 163, 184, 0.05)",
        }}
      >
        <div className="h-full flex items-center">
          <div className="ticker-track">
            {/* Render twice for seamless loop */}
            {[...TICKER_SEGMENTS, ...TICKER_SEGMENTS].map((seg, i) => (
              <span key={i} className="inline-flex items-center px-2">
                <TickerItem seg={seg} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Header: logo | nav | connect ────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full shrink-0"
        style={{
          background: "rgba(7, 16, 30, 0.97)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.07)",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-5 h-[54px] flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center justify-center font-black font-mono text-sm shrink-0"
              style={{
                width: 30,
                height: 30,
                background: "rgba(54, 211, 154, 0.08)",
                border: "1px solid rgba(54, 211, 154, 0.4)",
                borderRadius: 6,
                color: "#36d39a",
                boxShadow: "0 0 16px rgba(0,255,157,0.2)",
              }}
            >
              W
            </div>
            <span
              className="font-bold text-sm"
              style={{ color: "#ffffff", letterSpacing: "-0.01em" }}
            >
              wallst{" "}
              <span style={{ color: "#36d39a", fontWeight: 400 }}>
                .fun
              </span>
            </span>
          </Link>

          {/* Nav tabs — centered */}
          <nav className="flex items-center gap-0.5 mx-auto">
            {NAV.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  active
                    ? {
                        background: "rgba(148, 163, 184, 0.08)",
                        border: "1px solid rgba(148, 163, 184, 0.1)",
                        color: "#ffffff",
                      }
                    : {
                        background: "transparent",
                        border: "1px solid transparent",
                        color: "rgba(148, 163, 184, 0.5)",
                      }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right: settings + wallet */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{
                background: "transparent",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                color: "rgba(148, 163, 184, 0.5)",
              }}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {connected ? (
              <button
                onClick={disconnect}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(54, 211, 154, 0.06)",
                  border: "1px solid rgba(54, 211, 154, 0.2)",
                  color: "#36d39a",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#36d39a",
                    boxShadow: "0 0 6px #36d39a",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span className="font-mono text-xs">{address}</span>
                <LogOut className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <button
                onClick={connect}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect Phantom
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer
        className="py-6"
        style={{ borderTop: "1px solid rgba(148, 163, 184, 0.06)" }}
      >
        <div className="container mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span
            className="text-xs font-mono"
            style={{ color: "rgba(148, 163, 184, 0.3)" }}
          >
            wallst .fun
          </span>
          <div className="flex gap-4">
            {["Twitter", "Discord", "Docs"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "rgba(148, 163, 184, 0.3)" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#36d39a")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color =
                    "rgba(148, 163, 184, 0.3)")
                }
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
