import { useState } from "react";
import { Layout } from "@/components/layout";
import { TokenCard } from "@/components/token-card";
import { CreateTokenModal } from "@/components/create-token-modal";
import { useGetTokens } from "@workspace/api-client-react";
import { useWallet } from "@/hooks/use-wallet";
import { Zap, Activity, CheckCircle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { connected, connect } = useWallet();
  const { data: tokens, isLoading } = useGetTokens();

  const handleCreateClick = () => {
    if (!connected) {
      connect();
      // Wait for mock connection to resolve
      setTimeout(() => setIsCreateModalOpen(true), 600);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const totalRaised = tokens?.reduce((acc, token) => acc + token.solRaised, 0) || 0;
  const migratedCount = tokens?.filter(t => t.migrated).length || 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono font-medium mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            LIVE ON SOLANA DEVNET
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 glow-text max-w-4xl"
          >
            LAUNCH THE NEXT ALPHA
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 font-medium"
          >
            Fair memecoin launches with automated bonding curves. 
            Reach the target and automatically migrate to Raydium liquidity pools.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={handleCreateClick}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg uppercase tracking-wider glow-box hover:glow-box-hover transition-all flex items-center gap-3 active:scale-95"
          >
            <Zap className="w-5 h-5" />
            Launch Coin Now
          </motion.button>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
              <Activity className="w-5 h-5 text-muted-foreground mb-3" />
              <div className="text-3xl font-mono font-bold text-foreground mb-1">{tokens?.length || 0}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Launches</div>
            </div>
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-5 h-5 text-primary mb-3" />
              <div className="text-3xl font-mono font-bold text-primary mb-1">{totalRaised.toFixed(2)}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SOL Raised</div>
            </div>
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-5 h-5 text-muted-foreground mb-3" />
              <div className="text-3xl font-mono font-bold text-foreground mb-1">{migratedCount}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Graduated</div>
            </div>
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-5 h-5 text-muted-foreground mb-3 flex items-center justify-center font-mono font-bold text-xs">%</div>
              <div className="text-3xl font-mono font-bold text-foreground mb-1">1.0</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Launches Grid */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Live Launches
            </h2>
            <div className="flex gap-2">
              {/* Filter pills placeholder */}
              <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">Trending</button>
              <button className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium hover:bg-secondary/50 transition-colors hidden sm:block">Recent</button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse p-5" />
              ))}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tokens.map((token, index) => (
                <TokenCard key={token.id} token={token} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-card/20">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No tokens launched yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to create a memecoin on Wall St. Launchpad.</p>
              <button 
                onClick={handleCreateClick}
                className="px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                Create Token
              </button>
            </div>
          )}
        </div>
      </section>

      <CreateTokenModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </Layout>
  );
}
