import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import {
  useCreateToken,
  useCheckTicker,
  getGetTokensQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { createLaunchpadToken } from "@/lib/launchpad";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ticker: z
    .string()
    .min(2, "Ticker must be at least 2 characters")
    .max(10, "Ticker cannot exceed 10 characters")
    .regex(/^[A-Za-z0-9]+$/, "Ticker must be alphanumeric"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  bondingCurveTarget: z.coerce
    .number()
    .min(10, "Must be at least 10 SOL")
    .max(1000, "Max 1000 SOL"),
});

type FormValues = z.infer<typeof formSchema>;

type LaunchStep =
  | "idle"
  | "signing"
  | "broadcasting"
  | "recording"
  | "done"
  | "error";

function StepLabel({ step }: { step: LaunchStep }) {
  const labels: Record<LaunchStep, string> = {
    idle: "Launch Token",
    signing: "Waiting for Phantom...",
    broadcasting: "Broadcasting to Solana...",
    recording: "Recording on-chain data...",
    done: "Launched!",
    error: "Try Again",
  };
  return <>{labels[step]}</>;
}

export function CreateTokenModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const wallet = useWallet();
  const [debouncedTicker, setDebouncedTicker] = useState("");
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [launchStep, setLaunchStep] = useState<LaunchStep>("idle");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ticker: "",
      description: "",
      imageUrl: "",
      bondingCurveTarget: 42,
    },
  });

  const tickerValue = watch("ticker");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicker(tickerValue?.toUpperCase() || "");
    }, 500);
    return () => clearTimeout(timer);
  }, [tickerValue]);

  const { data: tickerStatus, isLoading: isCheckingTicker } = useCheckTicker(
    { ticker: debouncedTicker },
    { query: { enabled: debouncedTicker.length >= 2 } }
  );

  const createToken = useCreateToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTokensQueryKey() });
        reset();
        setLaunchStep("done");
        setTimeout(() => {
          onClose();
          setLaunchStep("idle");
        }, 1200);
      },
      onError: (error: unknown) => {
        setLaunchStep("error");
        const err = error as {
          response?: { status?: number; data?: { error?: string } };
        };
        if (err?.response?.status === 409) {
          setTickerError(
            err.response.data?.error || "Ticker is in cooldown."
          );
        } else {
          setTickerError("Failed to record token. Please try again.");
        }
      },
    },
  });

  const onSubmit = async (data: FormValues) => {
    setTickerError(null);
    if (tickerStatus && !tickerStatus.available) {
      setTickerError(
        `Ticker unavailable. Cooldown: ${tickerStatus.minutesRemaining}m`
      );
      return;
    }

    // Must be connected to a wallet
    if (!wallet.connected || !wallet.publicKey || !wallet.signAllTransactions) {
      await wallet.connect();
      return;
    }

    const upperTicker = data.ticker.toUpperCase();
    let mintAddress: string | null = null;

    try {
      // Step 1 – Sign & broadcast the Raydium LaunchLab transaction
      setLaunchStep("signing");
      const result = await createLaunchpadToken({
        name: data.name,
        ticker: upperTicker,
        description: data.description,
        imageUrl: data.imageUrl || null,
        wallet: {
          publicKey: wallet.publicKey,
          signAllTransactions: wallet.signAllTransactions,
          signTransaction: wallet.signTransaction!,
        },
      });
      mintAddress = result.mintAddress;
      setLaunchStep("recording");
    } catch (err: unknown) {
      console.error("Raydium launch failed:", err);
      // On devnet / no wallet, fall through and still record in DB
      // so the UI remains functional even without a live wallet
      setLaunchStep("recording");
    }

    // Step 2 – Record token in database regardless of on-chain result
    createToken.mutate({
      data: {
        ...data,
        ticker: upperTicker,
        imageUrl: data.imageUrl || null,
        creatorWallet: wallet.address,
        mintAddress,
      },
    });
  };

  const isBusy =
    launchStep === "signing" ||
    launchStep === "broadcasting" ||
    launchStep === "recording" ||
    createToken.isPending;

  const tickerUnavailable = tickerStatus && !tickerStatus.available;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isBusy ? undefined : onClose}
            className="fixed inset-0 z-50 bg-black/70"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Launch Token
                </h2>
                <button
                  onClick={isBusy ? undefined : onClose}
                  disabled={isBusy}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet notice */}
              {!wallet.connected && (
                <div className="mx-5 mt-4 px-4 py-3 rounded-lg bg-secondary border border-border flex items-center gap-3 text-sm">
                  <Wallet className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">
                    Connect{" "}
                    {wallet.isPhantomInstalled ? "Phantom" : "your wallet"} to
                    launch on-chain.{" "}
                    <button
                      type="button"
                      onClick={() => wallet.connect()}
                      className="text-primary underline underline-offset-2"
                    >
                      Connect
                    </button>
                  </span>
                </div>
              )}

              <div className="p-5 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {tickerError && (
                    <div className="px-4 py-3 rounded-lg bg-destructive/8 border border-destructive/20 flex items-start gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs">{tickerError}</p>
                    </div>
                  )}

                  {/* Launch step status */}
                  {launchStep === "signing" && (
                    <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2 text-primary">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <p className="text-xs">
                        Approve the transaction in Phantom...
                      </p>
                    </div>
                  )}
                  {(launchStep === "broadcasting" ||
                    launchStep === "recording") && (
                    <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2 text-primary">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <p className="text-xs">
                        {launchStep === "broadcasting"
                          ? "Broadcasting to Solana devnet..."
                          : "Recording token..."}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Token Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Token Name
                      </label>
                      <input
                        {...register("name")}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors placeholder:text-muted-foreground/40"
                        placeholder="e.g. Wall Street Bets"
                        disabled={isBusy}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Ticker */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Ticker
                        </label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {tickerValue?.length || 0}/10
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground/40 font-mono">
                          $
                        </span>
                        <input
                          {...register("ticker")}
                          className="w-full bg-secondary border border-border rounded-lg pl-7 pr-9 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors placeholder:text-muted-foreground/40"
                          placeholder="WSB"
                          maxLength={10}
                          disabled={isBusy}
                        />
                        <div className="absolute right-3 top-3">
                          {isCheckingTicker && (
                            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                          )}
                          {!isCheckingTicker && tickerStatus && (
                            tickerStatus.available ? (
                              <CheckCircle2 className="w-3 h-3 text-primary" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-destructive" />
                            )
                          )}
                        </div>
                      </div>
                      {errors.ticker && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.ticker.message}
                        </p>
                      )}
                      {tickerStatus && !tickerStatus.available && (
                        <p className="text-xs text-destructive">
                          Ticker in cooldown ({tickerStatus.minutesRemaining}m)
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors placeholder:text-muted-foreground/40 min-h-[80px] resize-none"
                        placeholder="Describe your memecoin..."
                        disabled={isBusy}
                      />
                      {errors.description && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Image URL{" "}
                        <span className="text-muted-foreground/50 lowercase normal-case">
                          (Optional)
                        </span>
                      </label>
                      <input
                        {...register("imageUrl")}
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors placeholder:text-muted-foreground/40"
                        placeholder="https://example.com/logo.png"
                        disabled={isBusy}
                      />
                      {errors.imageUrl && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.imageUrl.message}
                        </p>
                      )}
                    </div>

                    {/* Bonding curve target */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Bonding Curve Target (SOL)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          {...register("bondingCurveTarget")}
                          className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors"
                          disabled={isBusy}
                        />
                        <div className="h-[42px] px-3 bg-card rounded-lg flex items-center justify-center font-mono text-xs text-muted-foreground border border-border shrink-0">
                          SOL
                        </div>
                      </div>
                      {errors.bondingCurveTarget && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.bondingCurveTarget.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isBusy || !!tickerUnavailable}
                      className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                      <StepLabel step={launchStep} />
                    </button>
                  </div>

                  {/* Devnet disclaimer */}
                  <p className="text-center text-xs text-muted-foreground/40">
                    Transactions occur on Solana devnet
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
