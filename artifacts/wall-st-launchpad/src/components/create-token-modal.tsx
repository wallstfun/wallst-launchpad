import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCreateToken, useCheckTicker, getGetTokensQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ticker: z.string()
    .min(2, "Ticker must be at least 2 characters")
    .max(10, "Ticker cannot exceed 10 characters")
    .regex(/^[A-Za-z0-9]+$/, "Ticker must be alphanumeric"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bondingCurveTarget: z.coerce.number().min(10, "Must be at least 10 SOL").max(1000, "Max 1000 SOL"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTokenModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [debouncedTicker, setDebouncedTicker] = useState("");
  const [tickerError, setTickerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ticker: "",
      description: "",
      imageUrl: "",
      bondingCurveTarget: 42,
    }
  });

  const tickerValue = watch("ticker");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicker(tickerValue?.toUpperCase() || "");
    }, 500);
    return () => clearTimeout(timer);
  }, [tickerValue]);

  // Check ticker availability
  const { data: tickerStatus, isLoading: isCheckingTicker } = useCheckTicker(
    { ticker: debouncedTicker },
    { query: { enabled: debouncedTicker.length >= 2 } }
  );

  const createToken = useCreateToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTokensQueryKey() });
        reset();
        onClose();
      },
      onError: (error: any) => {
        // Handle 409 conflict
        if (error?.response?.status === 409) {
          setTickerError(error.response.data?.error || "Ticker is in cooldown.");
        } else {
          setTickerError("Failed to launch token. Please try again.");
        }
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    setTickerError(null);
    if (tickerStatus && !tickerStatus.available) {
      setTickerError(`Ticker unavailable. Cooldown: ${tickerStatus.minutesRemaining}m`);
      return;
    }

    createToken.mutate({
      data: {
        ...data,
        ticker: data.ticker.toUpperCase(),
        imageUrl: data.imageUrl || null,
        creatorWallet: "8xKf7p...3mPq", // Using mock wallet
        mintAddress: null,
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
                <h2 className="text-xl font-bold">Launch New Token</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  
                  {tickerError && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{tickerError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Token Name <span className="text-primary">*</span></label>
                      <input
                        {...register("name")}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                        placeholder="e.g. Wall Street Bets"
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-muted-foreground">Ticker <span className="text-primary">*</span></label>
                        <span className="text-xs font-mono text-muted-foreground">{tickerValue?.length || 0}/10</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-muted-foreground font-mono">$</span>
                        <input
                          {...register("ticker")}
                          className="w-full bg-input border border-border rounded-xl pl-8 pr-10 py-3 text-sm font-mono uppercase focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                          placeholder="WSB"
                          maxLength={10}
                        />
                        <div className="absolute right-4 top-3.5">
                          {isCheckingTicker && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                          {!isCheckingTicker && tickerStatus && (
                            tickerStatus.available 
                              ? <CheckCircle2 className="w-4 h-4 text-primary" />
                              : <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      {errors.ticker && <p className="text-xs text-destructive">{errors.ticker.message}</p>}
                      {tickerStatus && !tickerStatus.available && (
                        <p className="text-xs text-destructive">Ticker in cooldown ({tickerStatus.minutesRemaining}m)</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description <span className="text-primary">*</span></label>
                    <textarea
                      {...register("description")}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50 min-h-[100px] resize-y"
                      placeholder="Describe your memecoin's mission and utility..."
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Image URL <span className="text-muted-foreground/50">(Optional)</span></label>
                    <input
                      {...register("imageUrl")}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                      placeholder="https://example.com/logo.png"
                    />
                    {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Bonding Curve Target (SOL)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        {...register("bondingCurveTarget")}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                      <div className="h-12 px-4 bg-secondary rounded-xl flex items-center justify-center font-mono text-sm text-muted-foreground border border-border shrink-0">
                        SOL
                      </div>
                    </div>
                    {errors.bondingCurveTarget && <p className="text-xs text-destructive">{errors.bondingCurveTarget.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Amount of SOL needed to automatically migrate to Raydium.</p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={createToken.isPending || (tickerStatus && !tickerStatus.available)}
                      className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider glow-box hover:glow-box-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {createToken.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Deploying to Network...
                        </>
                      ) : (
                        "Launch Token"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
