import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import BN from "bn.js";

const RPC_URL =
  (import.meta as any).env?.VITE_RPC_URL || "https://api.devnet.solana.com";

// ─── Devnet Raydium LaunchLab constants ────────────────────────────────────
// Source: @raydium-io/raydium-sdk-v2 src/common/programId.ts
const DEV_LAUNCHPAD_PROGRAM_ID = "DRay6fNdQ5J82H7xV6uq2aV3mNrUZ1J4PgSKsWgptcm6";
const DEV_LAUNCHPAD_AUTH_ID = "5xqNaZXX5eUi4p5HU4oz9i5QnwRNT2y6oN7yyn4qENeq";
const DEV_LAUNCHPAD_CONFIG_ID = "7ZR4zD7PYfY2XxoG1Gxcy2EgEeGYrpxrwzPuwdUBssEt";

// ─── Platform Fee Configuration ────────────────────────────────────────────
// Raydium LaunchLab expresses fees relative to FEE_RATE_DENOMINATOR = 1_000_000
// 0.75% = 7500 / 1_000_000
//
// To change the fee rate, update PLATFORM_FEE_BPS.
// To change the recipient, update PLATFORM_FEE_WALLET.
export const PLATFORM_FEE_PERCENT = 0.75; // human-readable display value
export const PLATFORM_FEE_BPS = 7500;     // fee units: bps relative to 1_000_000
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
    typeof window !== "undefined"
      ? window.location.origin
      : "https://localhost";

  // The API server is proxied at /api-server on the same domain
  return `${domain}/api-server/api/launchpad/token-metadata?${qs.toString()}`;
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
 *
 * The platform fee (PLATFORM_FEE_PERCENT%) is automatically added to every
 * buy and sell during the bonding curve phase and routed to PLATFORM_FEE_WALLET.
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

    // ── Platform fee: 0.75% of every trade routed to PLATFORM_FEE_WALLET ──
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
 * Buy tokens on the bonding curve for a given pool mint.
 *
 * Includes the platform fee so PLATFORM_FEE_WALLET receives PLATFORM_FEE_PERCENT%
 * of every purchase.
 *
 * @param mintAddress  - The token mint address
 * @param buyAmountSol - Amount of SOL to spend (in lamports as BN)
 * @param wallet       - Connected Phantom wallet
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

    // ── Platform fee: 0.75% of every buy routed to PLATFORM_FEE_WALLET ──
    shareFeeRate: new BN(PLATFORM_FEE_BPS),
    shareFeeReceiver: new PublicKey(PLATFORM_FEE_WALLET),
  });

  const result = await execute({ sequentially: true });
  const txId = Array.isArray(result) ? result[0] : (result as any).txId || "";
  return { txId };
}

/**
 * Sell tokens on the bonding curve for a given pool mint.
 *
 * Includes the platform fee so PLATFORM_FEE_WALLET receives PLATFORM_FEE_PERCENT%
 * of every sale.
 *
 * @param mintAddress    - The token mint address
 * @param sellAmountAtoms - Amount of tokens to sell (in token atoms as BN)
 * @param wallet         - Connected Phantom wallet
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

    // ── Platform fee: 0.75% of every sell routed to PLATFORM_FEE_WALLET ──
    shareFeeRate: new BN(PLATFORM_FEE_BPS),
    shareFeeReceiver: new PublicKey(PLATFORM_FEE_WALLET),
  });

  const result = await execute({ sequentially: true });
  const txId = Array.isArray(result) ? result[0] : (result as any).txId || "";
  return { txId };
}
