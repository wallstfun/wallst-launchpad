import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Link } from "wouter";
import { Wallet, LogOut, ChevronRight } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { connected, address, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-xl">
              W
            </div>
            <span className="font-bold tracking-tighter text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">
              WALL ST. <span className="text-muted-foreground font-mono text-sm tracking-normal ml-1">LAUNCHPAD</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {connected ? (
              <button
                onClick={disconnect}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-destructive/50 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-sm text-foreground">{address}</span>
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
              </button>
            ) : (
              <button
                onClick={connect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 glow-box transition-all active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Phantom</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card/30 mt-24">
        <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center text-background font-bold font-mono text-sm">
              W
            </div>
            <span className="font-bold tracking-tighter text-sm">WALL ST. LAUNCHPAD</span>
          </div>
          <p className="text-muted-foreground text-sm font-mono">
            &copy; {new Date().getFullYear()} Wall St. Launchpad. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono">Discord</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
