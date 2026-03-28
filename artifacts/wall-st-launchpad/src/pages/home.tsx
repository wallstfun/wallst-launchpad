import { useState } from "react";
import { Layout } from "@/components/layout";
import { TokenCard } from "@/components/token-card";
import { CreateTokenModal } from "@/components/create-token-modal";
import { useGetTokens } from "@workspace/api-client-react";
import { PLATFORM_FEE_PERCENT } from "@/lib/launchpad";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tokens, isLoading } = useGetTokens();

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const totalRaised = tokens?.reduce((acc, token) => acc + token.solRaised, 0) || 0;
  const migratedCount = tokens?.filter(t => t.migrated).length || 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-20 pb-16 border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-muted-foreground text-xs font-mono mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            LIVE ON SOLANA DEVNET
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Wall St. Launchpad
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-xl mb-8 font-normal">
            Fair memecoin launches with automated bonding curves. 
            Reach the target and automatically migrate to Raydium liquidity pools.
          </p>

          <button
            onClick={handleCreateClick}
            className="btn-primary px-6 py-2.5 flex items-center justify-center"
          >
            Create Coin
          </button>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <div className="py-5 px-6 flex flex-col">
              <div className="text-2xl font-mono font-bold text-foreground mb-1">{tokens?.length || 0}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Total Launches</div>
            </div>
            <div className="py-5 px-6 flex flex-col">
              <div className="text-2xl font-mono font-bold text-primary mb-1">{totalRaised.toFixed(2)}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">SOL Raised</div>
            </div>
            <div className="py-5 px-6 flex flex-col">
              <div className="text-2xl font-mono font-bold text-foreground mb-1">{migratedCount}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Graduated</div>
            </div>
            <div className="py-5 px-6 flex flex-col">
              <div className="text-2xl font-mono font-bold text-foreground mb-1">{PLATFORM_FEE_PERCENT}%</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Platform Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Launches Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono font-medium text-muted-foreground uppercase tracking-widest">
              Live Launches
            </h2>
            <div className="flex gap-2">
              <button className="btn-ghost px-3 py-1.5 text-xs">Trending</button>
              <button className="btn-ghost px-3 py-1.5 text-xs hidden sm:block">Recent</button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tokens.map((token, index) => (
                <TokenCard key={token.id} token={token} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-xl bg-card/20">
              <h3 className="text-sm font-medium text-foreground mb-1">No tokens launched yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Be the first to create a memecoin on Wall St. Launchpad.</p>
              <button 
                onClick={handleCreateClick}
                className="btn-ghost px-4 py-2 text-sm"
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
