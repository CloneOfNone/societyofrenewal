"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import dropletAnimation from "@/data/droplet.json";
import { cn } from "@/lib/utils";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => null,
});

interface DropletIntroProps {
  children: React.ReactNode;
}

export default function DropletIntro({ children }: DropletIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [contentVisible, setContentVisible] = useState(prefersReducedMotion);
  const [showOverlay, setShowOverlay] = useState(!prefersReducedMotion);
  const [lottieKey] = useState(
    () => globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
  );

  const handleComplete = useCallback(() => {
    setContentVisible(true);
    window.setTimeout(() => {
      setShowOverlay(false);
    }, 600);
  }, []);

  const droplet = useMemo(
    () => (
      <Lottie
        key={lottieKey}
        animationData={dropletAnimation}
        autoplay
        loop={false}
        style={{ width: "100%", height: "100%" }}
        onComplete={handleComplete}
      />
    ),
    [handleComplete, lottieKey],
  );

  return (
    <div className="relative min-h-screen bg-[#030711] text-zinc-100">
      <motion.div
        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {!prefersReducedMotion && showOverlay ? (
          <motion.div
            key="droplet-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: contentVisible ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div
              className={cn(
                "aspect-square w-[min(440px,75vw)]",
                "rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.85)_70%)]",
              )}
              aria-hidden
            >
              {droplet}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
