"use client";

import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import Link from "next/link";
import { Wallet, LogOut } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-base">
              W
            </div>
            <span className="font-bold tracking-tighter text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">
              WALL ST.{" "}
              <span className="text-muted-foreground font-mono text-xs tracking-normal ml-1">
                LAUNCHPAD
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {connected ? (
              <button
                onClick={disconnect}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border transition-all"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-mono text-sm text-foreground">
                  {address}
                </span>
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors ml-1" />
              </button>
            ) : (
              <button
                onClick={connect}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Phantom</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      <footer className="border-t border-border py-8 mt-24">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs font-mono">
            &copy; {new Date().getFullYear()} Wall St. Launchpad
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              Discord
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
