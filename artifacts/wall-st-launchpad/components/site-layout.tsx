"use client";

import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import Link from "next/link";
import { Wallet, LogOut } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div
      className="min-h-screen flex flex-col text-foreground"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background:
            "linear-gradient(180deg, hsl(240 56% 6% / 0.98) 0%, hsl(240 56% 6% / 0.92) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid hsl(240 40% 18%)",
        }}
      >
        <div className="container mx-auto px-4 md:px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 flex items-center justify-center font-black font-mono text-sm tracking-tight"
              style={{
                background: "rgba(0, 255, 157, 0.1)",
                border: "1px solid rgba(0, 255, 157, 0.5)",
                borderRadius: "6px",
                color: "#00ff9d",
                boxShadow: "0 0 14px rgba(0, 255, 157, 0.2)",
              }}
            >
              W
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-bold text-base tracking-tight text-white"
                style={{ letterSpacing: "-0.02em" }}
              >
                WALL ST.
              </span>
              <span
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "rgba(0, 255, 157, 0.7)" }}
              >
                LAUNCHPAD
              </span>
            </div>
          </Link>

          {/* Wallet */}
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
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "#00ff9d",
                    boxShadow: "0 0 6px #00ff9d",
                  }}
                />
                <span className="font-mono text-xs">{address}</span>
                <LogOut className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 ml-1" />
              </button>
            ) : (
              <button
                onClick={connect}
                className="btn-primary flex items-center gap-2 px-4 py-2"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold tracking-wide">
                  Connect Phantom
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        className="mt-24 py-8"
        style={{ borderTop: "1px solid hsl(240 40% 18%)" }}
      >
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#00ff9d", boxShadow: "0 0 6px #00ff9d" }}
            />
            <p
              className="text-xs font-mono"
              style={{ color: "hsl(240 28% 45%)" }}
            >
              © {new Date().getFullYear()} Wall St. Launchpad — Solana Devnet
            </p>
          </div>
          <div className="flex gap-5">
            {["Twitter", "Discord", "Docs"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-medium transition-colors"
                style={{ color: "hsl(240 28% 45%)" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#00ff9d")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color =
                    "hsl(240 28% 45%)")
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
