import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

// ─── Devnet Raydium LaunchLab constants ────────────────────────────────────
const DEV_LAUNCHPAD_PROGRAM_ID = "DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6";
const DEV_LAUNCHPAD_AUTH_ID = "5xqNaZXX5eUi4p5HU4oz9i5QnwRNT2y6oN7yyn4qENeq";
const DEV_LAUNCHPAD_CONFIG_ID = "7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt";

// ─── Platform Fee Configuration ────────────────────────────────────────────
// FEE_RATE_DENOMINATOR = 1_000_000  →  0.75% = 7500 / 1_000_000
export const PLATFORM_FEE_PERCENT = 0.75;
export const PLATFORM_FEE_BPS = 7500;
export const PLATFORM_FEE_WALLET =
  "Hw7yc27h6Lws6YsQmdLoj4M7psyFHRhosFwoGuSESmTh";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PhantomWallet {
  publicKey: PublicKey;
  signAllTransactions: (txs: unknown[]) => Promise<unknown[]>;
  signTransaction: (tx: unknown) => Promise<unknown>;
}

export interface LaunchpadResult {
  mintAddress: string;
  txId: string;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function buildMetadataUri(params: {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string | null;
}): string {
  const qs = new URLSearchParams({
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    ...(params.imageUrl ? { image: params.imageUrl } : {}),
  });

  const domain =
    typeof window !== "undefined" ? window.location.origin : "https://localhost";

  return `${domain}/api/launchpad/token-metadata?${qs.toString()}`;
}

async function initRaydium(wallet: PhantomWallet) {
  const connection = new Connection(RPC_URL, "confirmed");
  return Raydium.load({
    owner: wallet.publicKey,
    connection,
    cluster: "devnet",
    signAllTransactions: wallet.signAllTransactions as (txs: any[]) => Promise<any[]>,
    disableFeatureCheck: true,
    disableLoadToken: true,
    blockhashCommitment: "finalized",
  });
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Create a new LaunchLab token on Raydium devnet.
 * Platform fee (0.75%) is routed to PLATFORM_FEE_WALLET on every trade.
 */
export async function createLaunchpadToken(params: {
  name: string;
  ticker: string;
  description: string;
  imageUrl?: string | null;
  wallet: PhantomWallet;
}): Promise<LaunchpadResult> {
  const { name, ticker, description, imageUrl, wallet } = params;

  const mintKeypair = Keypair.generate();

  const metadataUri = buildMetadataUri({
    name,
    symbol: ticker,
    description,
    imageUrl,
  });

  const raydium = await initRaydium(wallet);

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
    shareFeeRate: new BN(PLATFORM_FEE_BPS),
    shareFeeReceiver: new PublicKey(PLATFORM_FEE_WALLET),
  });

  const result = await execute({ sequentially: true });
  const txId = Array.isArray(result) ? result[0] : (result as any).txId || "";

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    txId,
  };
}

/**
 * Buy tokens on the bonding curve — includes 0.75% platform fee.
 */
export async function buyBondingCurveToken(params: {
  mintAddress: string;
  buyAmountLamports: BN;
  slippageBps?: number;
  wallet: PhantomWallet;
}): Promise<{ txId: string }> {
  const { mintAddress, buyAmountLamports, slippageBps = 100, wallet } = params;
  const raydium = await initRaydium(wallet);

  const { execute } = await raydium.launchpad.buyToken({
    mintA: new PublicKey(mintAddress),
    buyAmount: buyAmountLamports,
    programId: new PublicKey(DEV_LAUNCHPAD_PROGRAM_ID),
    authProgramId: new PublicKey(DEV_LAUNCHPAD_AUTH_ID),
    slippage: new BN(slippageBps),
    txVersion: TxVersion.V0,
    shareFeeRate: new BN(PLATFORM_FEE_BPS),
    shareFeeReceiver: new PublicKey(PLATFORM_FEE_WALLET),
  });

  const result = await execute({ sequentially: true });
  const txId = Array.isArray(result) ? result[0] : (result as any).txId || "";
  return { txId };
}

/**
 * Sell tokens on the bonding curve — includes 0.75% platform fee.
 */
export async function sellBondingCurveToken(params: {
  mintAddress: string;
  sellAmountAtoms: BN;
  slippageBps?: number;
  wallet: PhantomWallet;
}): Promise<{ txId: string }> {
  const { mintAddress, sellAmountAtoms, slippageBps = 100, wallet } = params;
  const raydium = await initRaydium(wallet);

  const { execute } = await raydium.launchpad.sellToken({
    mintA: new PublicKey(mintAddress),
    sellAmount: sellAmountAtoms,
    programId: new PublicKey(DEV_LAUNCHPAD_PROGRAM_ID),
    authProgramId: new PublicKey(DEV_LAUNCHPAD_AUTH_ID),
    slippage: new BN(slippageBps),
    txVersion: TxVersion.V0,
    shareFeeRate: new BN(PLATFORM_FEE_BPS),
    shareFeeReceiver: new PublicKey(PLATFORM_FEE_WALLET),
  });

  const result = await execute({ sequentially: true });
  const txId = Array.isArray(result) ? result[0] : (result as any).txId || "";
  return { txId };
}
