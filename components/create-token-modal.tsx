"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCheckTicker } from "@/lib/api";   // keep this for live cooldown check
import { useWallet } from "@/hooks/use-wallet";

const formSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character"),
  ticker: z
    .string()
    .min(1, "Ticker must be at least 1 character")
    .max(10, "Ticker cannot exceed 10 characters")
    .regex(/^[A-Za-z0-9]+$/, "Ticker must be alphanumeric"),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type LaunchStep = "idle" | "submitting" | "done" | "error";

const BONDING_CURVE_TARGET_SOL = 42;

function StepLabel({ step }: { step: LaunchStep }) {
  const labels: Record<LaunchStep, string> = {
    idle: "Launch Coin",
    submitting: "Launching on Wall St...",
    done: "Launched!",
    error: "Try Again",
  };
  return <>{labels[step]}</>;
}

/* ─── Exact wallst.fun palette ───────────────────────────────────────── */
const GREEN = "#36d39a";
const GREEN_RGBA = (a: number) => `rgba(54, 211, 154, ${a})`;
const MUTED = (a: number) => `rgba(148, 163, 184, ${a})`;

const LABEL_STYLE = {
  color: MUTED(0.5),
  fontSize: "0.65rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const INPUT_STYLE = {
  background: "#111c2e",
  border: `1px solid ${MUTED(0.12)}`,
  borderRadius: 8,
  color: "#ffffff",
  fontSize: "0.875rem",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const INPUT_FOCUS_STYLE = {
  borderColor: GREEN_RGBA(0.45),
  boxShadow: `0 0 0 3px ${GREEN_RGBA(0.08)}`,
};

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...INPUT_STYLE,
        ...(focused ? INPUT_FOCUS_STYLE : {}),
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? "not-allowed" : "text",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{
        ...INPUT_STYLE,
        minHeight: 80,
        resize: "none",
        ...(focused ? INPUT_FOCUS_STYLE : {}),
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? "not-allowed" : "text",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export function CreateTokenModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const wallet = useWallet();
  const [debouncedTicker, setDebouncedTicker] = useState("");
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [launchStep, setLaunchStep] = useState<LaunchStep>("idle");
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", ticker: "", description: "", imageUrl: "" },
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
    { enabled: debouncedTicker.length >= 1 }
  );

  const onSubmit = async (data: FormValues) => {
    setTickerError(null);
    setGeneralError(null);

    if (tickerStatus && !tickerStatus.available) {
      setTickerError(`Ticker unavailable. Cooldown: ${tickerStatus.minutesRemaining}m remaining`);
      return;
    }

    if (!wallet.connected || !wallet.publicKey) {
      setGeneralError("Please connect your Phantom wallet first.");
      return;
    }

    setLaunchStep("submitting");

    const upperTicker = data.ticker.toUpperCase();

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("ticker", upperTicker);
      formData.append("description", data.description || "");
      formData.append("imageUrl", data.imageUrl || "");
      formData.append("bondingCurveTarget", BONDING_CURVE_TARGET_SOL.toString());
      formData.append("creatorWallet", wallet.publicKey.toString());

      const response = await fetch("/api/launchpad", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setTickerError(result.error || "Ticker is on cooldown.");
        } else {
          throw new Error(result.error || "Launch failed");
        }
        setLaunchStep("error");
        return;
      }

      // Success
      setLaunchStep("done");

      setTimeout(() => {
        reset();
        onClose();
        setLaunchStep("idle");
        // You can add a toast here later: "Coin launched successfully!"
      }, 1500);

    } catch (err: any) {
      console.error("Launch error:", err);
      setGeneralError(err.message || "Something went wrong. Please try again.");
      setLaunchStep("error");
    }
  };

  const isBusy = launchStep === "submitting" || launchStep === "done";
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
            className="fixed inset-0 z-50"
            style={{ background: "rgba(3, 8, 18, 0.88)", backdropFilter: "blur(6px)" }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="w-full max-w-md pointer-events-auto flex flex-col max-h-[92vh] rounded-2xl overflow-hidden"
              style={{
                background: "#0a1422",
                border: `1px solid ${GREEN_RGBA(0.15)}`,
                boxShadow: `0 0 60px ${GREEN_RGBA(0.05)}, 0 24px 64px rgba(0, 0, 0, 0.7)`,
              }}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0" style={{ borderBottom: `1px solid ${MUTED(0.07)}` }}>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-[0.12em]" style={{ color: GREEN }}>
                    Launch Token
                  </h2>
                </div>
                <button
                  onClick={isBusy ? undefined : onClose}
                  disabled={isBusy}
                  className="p-1.5 rounded-md transition-colors disabled:opacity-40"
                  style={{ color: MUTED(0.4) }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                  {/* Errors */}
                  {(tickerError || generalError) && (
                    <div className="px-4 py-3 rounded-lg flex items-start gap-2" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs">{tickerError || generalError}</p>
                    </div>
                  )}

                  {/* Status */}
                  {launchStep === "submitting" && (
                    <div className="px-4 py-3 rounded-lg flex items-center gap-2" style={{ background: GREEN_RGBA(0.05), border: `1px solid ${GREEN_RGBA(0.18)}`, color: GREEN }}>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <p className="text-xs font-mono">Submitting to launchpad...</p>
                    </div>
                  )}

                  {launchStep === "done" && (
                    <div className="px-4 py-3 rounded-lg flex items-center gap-2" style={{ background: GREEN_RGBA(0.05), border: `1px solid ${GREEN_RGBA(0.18)}`, color: GREEN }}>
                      <CheckCircle2 className="w-4 h-4" />
                      <p className="text-xs font-mono">Coin launched successfully!</p>
                    </div>
                  )}

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label style={LABEL_STYLE}>Token Name</label>
                      <FieldInput {...register("name")} placeholder="e.g. Wall Street Bets" disabled={isBusy} />
                      {errors.name && <p className="text-xs" style={{ color: "#f87171" }}>{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label style={LABEL_STYLE}>Ticker</label>
                        <span className="text-xs font-mono" style={{ color: MUTED(0.35) }}>{tickerValue?.length || 0}/10</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm" style={{ color: MUTED(0.4) }}>$</span>
                        <FieldInput
                          {...register("ticker")}
                          style={{ ...INPUT_STYLE, paddingLeft: 28, textTransform: "uppercase" }}
                          placeholder="WSB"
                          maxLength={10}
                          disabled={isBusy}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingTicker && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: MUTED(0.4) }} />}
                          {!isCheckingTicker && tickerStatus && (
                            tickerStatus.available ? (
                              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                            )
                          )}
                        </div>
                      </div>
                      {errors.ticker && <p className="text-xs" style={{ color: "#f87171" }}>{errors.ticker.message}</p>}
                      {tickerStatus && !tickerStatus.available && (
                        <p className="text-xs" style={{ color: "#f87171" }}>
                          Ticker in cooldown — {tickerStatus.minutesRemaining}m remaining
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label style={LABEL_STYLE}>Description <span style={{ opacity: 0.5 }}>(optional)</span></label>
                      <FieldTextarea {...register("description")} placeholder="Describe your memecoin..." disabled={isBusy} />
                    </div>

                    <div className="space-y-1.5">
                      <label style={LABEL_STYLE}>Image URL <span style={{ opacity: 0.5 }}>(optional)</span></label>
                      <FieldInput {...register("imageUrl")} placeholder="https://example.com/logo.png" disabled={isBusy} />
                      {errors.imageUrl && <p className="text-xs" style={{ color: "#f87171" }}>{errors.imageUrl.message}</p>}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isBusy || tickerUnavailable}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: isBusy ? GREEN_RGBA(0.04) : GREEN_RGBA(0.08),
                        border: `1px solid ${GREEN_RGBA(0.5)}`,
                        color: GREEN,
                        boxShadow: isBusy ? "none" : `0 0 20px ${GREEN_RGBA(0.18)}`,
                      }}
                    >
                      {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                      <StepLabel step={launchStep} />
                    </button>
                  </div>

                  <p className="text-center text-xs font-mono" style={{ color: MUTED(0.3) }}>
                    Solana devnet · Cooldown enforced by Redis
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