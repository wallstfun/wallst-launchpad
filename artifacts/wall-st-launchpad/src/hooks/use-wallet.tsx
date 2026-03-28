import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  connected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = () => {
    // Mock Phantom wallet connection
    setTimeout(() => {
      setConnected(true);
      setAddress("8xKf7p...3mPq");
    }, 500);
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ connected, address, connect, disconnect }}>
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
