"use client";

import { track } from "@vercel/analytics";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RippleButtonProps = React.ComponentProps<typeof Button>;

const rippleVariants: Variants = {
  idle: { opacity: 0, scale: 0.75 },
  hovered: { opacity: 0.16, scale: 1.18 },
  rippling: {
    opacity: [0.32, 0.2, 0.14],
    scale: [0.7, 1.1, 1.32],
    transition: { duration: 0.9, ease: "easeOut" },
  },
  settled: { opacity: 0.16, scale: 1.28 },
};

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const [variant, setVariant] = React.useState<keyof typeof rippleVariants>(
      prefersReducedMotion ? "settled" : "idle",
    );
    const [hovered, setHovered] = React.useState(false);
    const [hasTracked, setHasTracked] = React.useState(prefersReducedMotion);

    React.useEffect(() => {
      if (prefersReducedMotion) {
        setVariant("settled");
        setHasTracked(true);
      }
    }, [prefersReducedMotion]);

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(event);
      setHovered(true);

      if (!prefersReducedMotion && !hasTracked) {
        setVariant("rippling");
        setHasTracked(true);
        try {
          track("ripple_activated");
        } catch {
          /* noop in development without analytics */
        }
      }
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(event);
      setHovered(false);
      if (variant === "rippling") return;
      if (variant === "idle") return;
      setVariant("settled");
    };

    const animateVariant =
      prefersReducedMotion || variant === "settled"
        ? "settled"
        : variant === "rippling"
          ? "rippling"
          : hovered
            ? "hovered"
            : "idle";

    return (
      <Button
        ref={ref}
        variant="outline"
        size="lg"
        className={cn(
          "relative overflow-hidden rounded-full border border-white/15 bg-white/10 px-8 py-2 text-base font-medium text-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.25)] transition-transform duration-200",
          "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/12",
          "active:translate-y-0 active:scale-95 active:bg-white/20",
          "focus-visible:outline-none",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <span className="relative z-10">{props.children}</span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_65%)]"
          initial={prefersReducedMotion ? "settled" : "idle"}
          animate={animateVariant}
          variants={rippleVariants}
          transition={
            animateVariant === "rippling"
              ? { duration: 0.9, ease: "easeOut" }
              : { duration: 0.4, ease: "easeOut" }
          }
          onAnimationComplete={(definition) => {
            if (definition === "rippling") {
              setVariant("settled");
            }
          }}
        />
      </Button>
    );
  },
);

RippleButton.displayName = "RippleButton";

export default RippleButton;
