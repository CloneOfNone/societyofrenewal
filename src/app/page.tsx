"use client";

import { motion, useReducedMotion } from "framer-motion";

import DropletIntro from "@/components/DropletIntro";
import LinkRow from "@/components/LinkRow";
import WaitlistForm from "@/components/WaitlistForm";

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export default function Page() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <DropletIntro>
      <main className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(94,234,212,0.12)_0%,_rgba(2,6,23,0)_60%)]"
        />
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black via-black/70 to-transparent" />

        <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-16 px-6 pt-32 pb-24 sm:pt-40">
          <motion.div
            variants={staggerChildren}
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            className="space-y-8"
          >
            <motion.div variants={heroVariants} className="space-y-6">
              <p className="text-sm tracking-[0.4em] text-slate-400 uppercase">
                Society of Renewal
              </p>
              <h1 className="text-4xl leading-tight font-semibold text-slate-50 sm:text-5xl">
                Join the Society of Renewal
              </h1>
            </motion.div>

            <motion.div
              variants={heroVariants}
              className="space-y-5 text-lg leading-relaxed text-slate-300"
            >
              <p>
                The next world begins with those who choose compassion as
                infrastructure. Each month, new citizens are invited—some by
                chance, some by need—to receive a universal basic income and
                help build a society without laws, only learning. Entry is open
                to all. The selection is fair, transparent, and human.
              </p>
              <p>
                The Society is an experiment in harmony—proving that education,
                empathy, and shared purpose can guide humanity better than
                enforcement ever did. Here, <em>Universal Basic Income</em> is
                not charity, but foundation: the space to grow, contribute, and
                become. Every citizen learns and teaches in turn, evolving the
                Charter of Renewal—a living document shaped by open
                collaboration and reason. Guidance replaces punishment.
                Understanding replaces control.
              </p>
            </motion.div>

            <motion.div variants={heroVariants}>
              <LinkRow />
            </motion.div>
          </motion.div>

          <motion.div
            variants={heroVariants}
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            transition={{ delay: shouldReduceMotion ? 0 : 0.6, duration: 0.6 }}
            className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_32px_120px_rgba(2,6,23,0.55)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/10 px-6 pt-6 pb-6 sm:px-8">
              <h2 className="text-xl font-semibold text-slate-100">
                Be first in line
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Confirmed members receive a double opt-in email before
                activation.
              </p>
            </div>
            <div className="px-6 py-8 sm:px-8">
              <WaitlistForm />
            </div>
          </motion.div>

          <footer className="pb-6 text-xs text-slate-500">
            <p>
              Crafted for those who believe empathy can be governance. We honor
              privacy, accessibility, and your pace—animations adapt to
              reduced-motion preferences.
            </p>
          </footer>
        </section>
      </main>
    </DropletIntro>
  );
}
