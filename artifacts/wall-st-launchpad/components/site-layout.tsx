"use client";

import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import Link from "next/link";
import { Wallet, LogOut, Activity } from "lucide-react";

const STATUS_ITEMS = [
  { label: "SYSTEM", value: "ONLINE", green: true },
  { label: "NETWORK", value: "SOL DEVNET", green: false },
  { label: "FEE RATE", value: "0.75%", green: false },
  { label: "PROGRAM", value: "LanMV9s...J3uj", green: false },
  { label: "STATUS", value: "OPERATIONAL", green: false },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen flex flex-col text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Top status ticker bar ───────────────────────────────────── */}
      <div
        className="w-full hidden sm:flex items-center px-6 shrink-0"
        style={{
          height: 30,
          background: "hsl(240 62% 4%)",
          borderBottom: "1px solid hsl(240 42% 12%)",
        }}
      >
        <div className="flex items-center gap-0 text-xs font-mono flex-1 overflow-hidden">
          {STATUS_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center shrink-0">
              {i > 0 && (
                <span
                  className="mx-4 select-none"
                  style={{ color: "hsl(240 40% 20%)" }}
                >
                  |
                </span>
              )}
              <span style={{ color: "hsl(240 28% 38%)" }}>{item.label}:&nbsp;</span>
              <span
                style={{
                  color: item.green ? "#00ff9d" : "hsl(240 28% 60%)",
                  textShadow: item.green ? "0 0 12px rgba(0,255,157,0.6)" : "none",
                  fontWeight: item.green ? 700 : 400,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <Activity
            className="w-3 h-3"
            style={{ color: "#00ff9d", filter: "drop-shadow(0 0 4px #00ff9d)" }}
          />
          <span className="text-xs font-mono" style={{ color: "hsl(240 28% 38%)" }}>
            SOLANA DEVNET
          </span>
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full shrink-0"
        style={{
          background: "linear-gradient(180deg, hsl(240 56% 6% / 0.98) 0%, hsl(240 56% 6% / 0.94) 100%)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid hsl(240 40% 18%)",
        }}
      >
        <div className="container mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center font-black font-mono text-sm"
              style={{
                background: "rgba(0, 255, 157, 0.1)",
                border: "1px solid rgba(0, 255, 157, 0.5)",
                borderRadius: 7,
                color: "#00ff9d",
                boxShadow: "0 0 16px rgba(0, 255, 157, 0.22)",
              }}
            >
              W
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-bold text-base text-white"
                style={{ letterSpacing: "-0.025em" }}
              >
                WALL ST.
              </span>
              <span
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "rgba(0, 255, 157, 0.65)" }}
              >
                LAUNCHPAD
              </span>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {connected ? (
              <button
                onClick={disconnect}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(0, 255, 157, 0.06)",
                  border: "1px solid rgba(0, 255, 157, 0.25)",
                  color: "#00ff9d",
                }}
              >
                <span
                  className="rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#00ff9d",
                    boxShadow: "0 0 8px #00ff9d",
                    display: "inline-block",
                  }}
                />
                <span className="font-mono text-xs">{address}</span>
                <LogOut className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 ml-1 transition-opacity" />
              </button>
            ) : (
              <button
                onClick={connect}
                className="btn-primary flex items-center gap-2 px-4 py-2"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold" style={{ letterSpacing: "0.03em" }}>
                  Connect Phantom
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className="mt-20 py-8"
        style={{ borderTop: "1px solid hsl(240 40% 15%)" }}
      >
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <p className="text-xs font-mono" style={{ color: "hsl(240 28% 38%)" }}>
              © {new Date().getFullYear()} Wall St. Launchpad — Solana Devnet
            </p>
          </div>
          <div className="flex gap-5">
            {["Twitter", "Discord", "Docs"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-medium transition-colors"
                style={{ color: "hsl(240 28% 38%)" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#00ff9d")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "hsl(240 28% 38%)")
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
