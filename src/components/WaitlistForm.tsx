"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import RippleButton from "@/components/RippleButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { waitlistFormSchema } from "@/lib/validation";

import type { z } from "zod";

type SubmissionStatus = "idle" | "success" | "exists" | "error";

const lotteryCopy =
  "Lottery invitations ensure transparent, random entry for the waitlist.";
const needCopy =
  "Need-based invitations reserve space for those facing urgent hardship. Share enough detail for us to understand.";

type WaitlistFormValues = z.input<typeof waitlistFormSchema>;

export default function WaitlistForm() {
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: "",
      path: "lottery",
      reason: "",
      turnstileToken: undefined,
    },
  });

  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const shouldReduceMotion = useReducedMotion();
  const path = useWatch({ control: form.control, name: "path" }) ?? "lottery";
  const reasonValue = useWatch({ control: form.control, name: "reason" }) ?? "";

  useEffect(() => {
    if (path === "lottery" && reasonValue) {
      form.setValue("reason", "");
    }
  }, [form, path, reasonValue]);

  const handlePathChange = useCallback(
    (checked: boolean) => {
      form.setValue("path", checked ? "need" : "lottery", {
        shouldValidate: true,
      });
      if (!checked) {
        form.setValue("reason", "");
      }
    },
    [form],
  );

  const copy = useMemo(
    () => (path === "need" ? needCopy : lotteryCopy),
    [path],
  );

  const onSubmit = async (values: WaitlistFormValues) => {
    const parsed = waitlistFormSchema.parse(values);
    const payload = {
      ...parsed,
      reason: parsed.reason?.trim() ? parsed.reason.trim() : null,
    };

    setStatus("idle");

    try {
      track("waitlist_submit_attempt", { path: parsed.path });
    } catch {
      /* ignore analytics failures */
    }

    let response: Response;
    try {
      response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[waitlist] network error", error);
      setStatus("error");
      toast.error("We could not reach the waitlist. Check your connection.");
      try {
        track("waitlist_submit_error", { reason: "network" });
      } catch {
        /* noop */
      }
      return;
    }

    if (response.ok) {
      setStatus("success");
      form.reset({
        email: "",
        path: parsed.path,
        reason: parsed.path === "need" ? parsed.reason : "",
        turnstileToken: undefined,
      });
      toast.success("Check your inbox to confirm your place.");
      try {
        track("waitlist_submit_success", { path: parsed.path });
      } catch {
        /* noop */
      }
      return;
    }

    if (response.status === 409) {
      setStatus("exists");
      const data = await response.json().catch(() => null);
      form.setError("email", {
        type: "manual",
        message:
          (data as { message?: string } | null)?.message ??
          "You are already on the waitlist.",
      });
      toast.info("You are already confirmed. Watch your inbox for updates.");
      try {
        track("waitlist_submit_error", { reason: "exists" });
      } catch {
        /* noop */
      }
      return;
    }

    setStatus("error");
    const data = await response.json().catch(() => null);
    const message =
      (data as { message?: string } | null)?.message ??
      "Something unexpected happened. Please try again.";
    toast.error(message);
    try {
      track("waitlist_submit_error", { reason: "server" });
    } catch {
      /* noop */
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-semibold tracking-wide text-slate-100"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
          className="h-12 rounded-xl border-white/10 bg-white/5 text-base text-slate-100 placeholder:text-slate-500"
        />
        {errors.email ? (
          <p className="text-sm text-rose-300">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-100">Selection path</p>
            <p className="text-sm text-slate-400">
              Choose lottery entry or share why you need priority.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <span className="font-medium text-slate-200">Need-based</span>
            <Switch
              checked={path === "need"}
              onCheckedChange={handlePathChange}
              aria-label="Toggle to request need-based consideration"
            />
          </label>
        </div>

        <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
          <motion.p
            key={path}
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: "easeOut",
            }}
            className={cn(
              "rounded-xl border border-white/5 bg-white/10 px-4 py-3 text-sm leading-relaxed",
              path === "need"
                ? "border-cyan-300/20 bg-cyan-400/5 text-cyan-200"
                : "text-slate-300",
            )}
          >
            {copy}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence initial={!shouldReduceMotion}>
        {path === "need" ? (
          <motion.div
            key="need-field"
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              ease: "easeOut",
            }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label
                htmlFor="reason"
                className="text-sm font-semibold tracking-wide text-slate-100"
              >
                Tell us about your need
              </Label>
              <span className="text-xs text-slate-500">
                Minimum 40 characters
              </span>
            </div>
            <Textarea
              id="reason"
              rows={4}
              aria-invalid={Boolean(errors.reason)}
              placeholder="Share how joining now would support your well-being..."
              {...register("reason")}
              className="rounded-xl border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
            {errors.reason ? (
              <p className="text-sm text-rose-300">{errors.reason.message}</p>
            ) : (
              <p className="text-xs text-slate-500">
                We read every request. Keep it concise but specific.
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-3">
        <RippleButton
          type="submit"
          disabled={isSubmitting}
          className="w-full justify-center"
        >
          {isSubmitting ? "Submitting…" : "Join the Waitlist"}
        </RippleButton>
        <p className="text-center text-sm text-slate-400">
          Lottery or need-based invitations. Always transparent.
        </p>
      </div>

      <AnimatePresence initial={!shouldReduceMotion}>
        {status !== "idle" || isSubmitSuccessful ? (
          <motion.div
            key={status}
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: "easeOut",
            }}
          >
            <Alert
              variant={status === "error" ? "destructive" : "default"}
              className={cn(
                "border-white/10 bg-white/5 text-slate-200",
                status === "error" ? "border-rose-400/30 bg-rose-500/10" : "",
              )}
              role="status"
            >
              <AlertTitle className="text-sm font-semibold text-white">
                {status === "success"
                  ? "Confirmation sent"
                  : status === "exists"
                    ? "Already confirmed"
                    : status === "error"
                      ? "We hit a snag"
                      : "Status"}
              </AlertTitle>
              <AlertDescription className="text-sm text-slate-300">
                {status === "success" &&
                  "We emailed a confirmation link. You’ll be fully enrolled once you confirm."}
                {status === "exists" &&
                  "This email is already confirmed. Thank you for being part of the society."}
                {status === "error" &&
                  "Our systems are busy right now. Try again in a moment or contact support."}
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
