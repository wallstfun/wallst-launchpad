"use client";

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import type { Token } from "./db";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TickerCheck {
  available: boolean;
  minutesRemaining: number | null;
}

export interface CreateTokenInput {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string | null;
  bondingCurveTarget: number;
  creatorWallet: string | null;
  mintAddress: string | null;
}

// ─── Query keys ────────────────────────────────────────────────────────────

export function getGetTokensQueryKey() {
  return ["/api/launchpad/tokens"] as const;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────

export function useGetTokens(
  options?: Omit<UseQueryOptions<Token[]>, "queryKey" | "queryFn">
) {
  return useQuery<Token[]>({
    queryKey: getGetTokensQueryKey(),
    queryFn: async () => {
      const res = await fetch("/api/launchpad/tokens");
      if (!res.ok) throw new Error("Failed to fetch tokens");
      return res.json();
    },
    ...options,
  });
}

export function useCheckTicker(
  params: { ticker: string },
  options?: { enabled?: boolean }
) {
  return useQuery<TickerCheck>({
    queryKey: ["/api/launchpad/check-ticker", params.ticker],
    queryFn: async () => {
      const res = await fetch(
        `/api/launchpad/check-ticker?ticker=${encodeURIComponent(params.ticker)}`
      );
      if (!res.ok) throw new Error("Failed to check ticker");
      return res.json();
    },
    enabled: options?.enabled !== false && params.ticker.length >= 1,
  });
}

export function useCreateToken(
  options?: UseMutationOptions<Token, unknown, CreateTokenInput>
) {
  return useMutation<Token, unknown, CreateTokenInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/launchpad/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        // Attach response metadata so error handlers in the modal can read it
        const err = Object.assign(new Error(json?.error || "Request failed"), {
          response: { status: res.status, data: json },
        });
        throw err;
      }

      return json as Token;
    },
    ...options,
  });
}
