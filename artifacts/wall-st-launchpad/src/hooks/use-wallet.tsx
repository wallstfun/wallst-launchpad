import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

// Phantom provider interface (typed against what Phantom exposes)
interface PhantomProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicKey: any | null;
  isPhantom?: boolean;
  isConnected: boolean;
  connect: (opts?: {
    onlyIfTrusted?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => Promise<{ publicKey: any }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: unknown) => Promise<unknown>;
  signAllTransactions: (txs: unknown[]) => Promise<unknown[]>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
}

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const { solana } = window as unknown as { solana?: PhantomProvider };
  if (solana?.isPhantom) return solana;
  return null;
}

function shortenBase58(base58: string): string {
  return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
}

interface WalletContextType {
  connected: boolean;
  address: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicKey: any | null;
  isPhantomInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAllTransactions: ((txs: unknown[]) => Promise<unknown[]>) | null;
  signTransaction: ((tx: unknown) => Promise<unknown>) | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [publicKey, setPublicKey] = useState<any | null>(null);

  const isPhantomInstalled = !!getPhantomProvider();

  const connect = useCallback(async () => {
    const phantom = getPhantomProvider();

    if (!phantom) {
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      const resp = await phantom.connect();
      const pk = resp.publicKey;
      const b58 = pk.toBase58();
      setPublicKey(pk);
      setAddress(shortenBase58(b58));
      setConnected(true);
    } catch (err: unknown) {
      console.warn("Phantom connection rejected:", err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const phantom = getPhantomProvider();
    if (phantom) {
      try {
        await phantom.disconnect();
      } catch {
        // ignore
      }
    }
    setConnected(false);
    setAddress(null);
    setPublicKey(null);
  }, []);

  const signAllTransactions = useCallback(
    (txs: unknown[]): Promise<unknown[]> => {
      const phantom = getPhantomProvider();
      if (!phantom) throw new Error("Phantom not installed");
      return phantom.signAllTransactions(txs);
    },
    []
  );

  const signTransaction = useCallback((tx: unknown): Promise<unknown> => {
    const phantom = getPhantomProvider();
    if (!phantom) throw new Error("Phantom not installed");
    return phantom.signTransaction(tx);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        publicKey,
        isPhantomInstalled,
        connect,
        disconnect,
        signAllTransactions: connected ? signAllTransactions : null,
        signTransaction: connected ? signTransaction : null,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
