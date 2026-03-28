import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";

const RPC_URL =
  (import.meta as any).env?.VITE_RPC_URL || "https://api.devnet.solana.com";

// Devnet Raydium LaunchLab constants (from @raydium-io/raydium-sdk-v2 source)
const DEV_LAUNCHPAD_PROGRAM_ID = "DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6";
const DEV_LAUNCHPAD_AUTH_ID = "5xqNaZXX5eUi4p5HU4oz9i5QnwRNT2y6oN7yyn4qENeq";
const DEV_LAUNCHPAD_CONFIG_ID = "7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt";

export interface PhantomWallet {
  publicKey: PublicKey;
  signAllTransactions: (txs: unknown[]) => Promise<unknown[]>;
  signTransaction: (tx: unknown) => Promise<unknown>;
}

export interface LaunchpadResult {
  mintAddress: string;
  txId: string;
}

function getApiBase(): string {
  const base = (import.meta as any).env?.BASE_URL || "";
  // Remove trailing slash
  return base.replace(/\/$/, "");
}

function buildMetadataUri(params: {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string | null;
}): string {
  const apiBase = getApiBase();
  // The metadata endpoint is on the API server, not the frontend
  // Use a query-string based approach so it's fully self-contained
  const qs = new URLSearchParams({
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    ...(params.imageUrl ? { image: params.imageUrl } : {}),
  });

  // The API server is behind the same domain, served at /api-server
  const domain =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://localhost";

  return `${domain}/api-server/api/launchpad/token-metadata?${qs.toString()}`;
}

export async function createLaunchpadToken(params: {
  name: string;
  ticker: string;
  description: string;
  imageUrl?: string | null;
  wallet: PhantomWallet;
}): Promise<LaunchpadResult> {
  const { name, ticker, description, imageUrl, wallet } = params;

  const connection = new Connection(RPC_URL, "confirmed");

  // Generate a new keypair for the token mint
  const mintKeypair = Keypair.generate();

  // Build token metadata URI pointing to our backend
  const metadataUri = buildMetadataUri({
    name,
    symbol: ticker,
    description,
    imageUrl,
  });

  // Initialize Raydium SDK with the user's wallet for devnet
  const raydium = await Raydium.load({
    owner: wallet.publicKey,
    connection,
    cluster: "devnet",
    signAllTransactions: wallet.signAllTransactions as (
      txs: any[]
    ) => Promise<any[]>,
    disableFeatureCheck: true,
    disableLoadToken: true,
    blockhashCommitment: "finalized",
  });

  // Build the createLaunchpad transaction
  const { execute } = await raydium.launchpad.createLaunchpad({
    mintA: mintKeypair.publicKey,
    name,
    symbol: ticker,
    uri: metadataUri,
    migrateType: "cpmm",
    configId: new PublicKey(DEV_LAUNCHPAD_CONFIG_ID),
    programId: new PublicKey(DEV_LAUNCHPAD_PROGRAM_ID),
    authProgramId: new PublicKey(DEV_LAUNCHPAD_AUTH_ID),
    buyAmount: new BN(0),
    txVersion: TxVersion.V0,
    extraSigners: [mintKeypair],
  });

  // Execute — Raydium signs with signAllTransactions internally
  const result = await execute({ sequentially: true });

  const txId = Array.isArray(result) ? result[0] : (result as any).txId || "";

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    txId,
  };
}
