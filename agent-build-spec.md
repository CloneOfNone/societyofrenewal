# Join the Society of Renewal — Agent Build Spec

**Scope:** One‑page landing experience with email waitlist + deep links (Charter, Founding Document, Whitepaper). Dark UI, sleek, with bespoke animations:
- **On‑load “water droplet” intro** (large transparent droplet on black → ripple → fade to black → page fades in)
- **First‑hover “radiating” button effect** that *persists its final frame* after mouseout; normal hover/click still work

Delivery target: Production‑ready Next.js app route (`/`) with API route for waitlist, Kysely schema/migration, shadcn/ui components, Framer Motion animations, accessibility/SEO.

---

## 1) Goals & Non‑Goals
**Goals**
- Fast first paint on dark background; cinematic but light payload (≤200KB above‑the‑fold without Lottie JSON)
- Fully keyboard accessible; honors `prefers-reduced-motion`
- Email waitlist with optional lottery/need path; double opt‑in
- Links: **Read the Charter**, **Founding Document**, **Whitepaper v0.6.0**

**Non‑Goals**
- Full auth, dashboards, or payment. Keep it zero‑state post‑submit besides a friendly confirmation.

---

## 2) Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + **shadcn/ui** components (Button, Input, Textarea, Label, Separator, Switch, Alert)
- **Animation:** Framer Motion; optional **lottie-react** for droplet (with a lightweight fallback SVG/canvas)
- **Forms/Validation:** React Hook Form + Zod
- **DB:** Postgres + **Kysely** (SQL migrations)
- **Email:** Resend/Postmark (double opt‑in); fallback: transactional provider stub
- **Rate limit/anti‑bot:** CF Turnstile or hCaptcha + per‑IP rate limit (Upstash Redis or in‑memory dev)
- **Analytics:** Plausible/PostHog (page + events)

---

## 3) Information Architecture
- **`/`** — landing page + form (email, path selection, optional need statement)
- **API**: `POST /api/waitlist` — create entry, send confirmation email; `GET /api/health`
- **Static links** (open new tab):
  - Charter: `https://renewal.wiki`
  - Founding Doc: `https://societyofrenewal.org/founding-document` (placeholder)
  - Whitepaper: `https://github.com/CloneOfNone/essentia/blob/main/docs/whitepaper.md`

---

## 4) Content
**Title:**
> **Join the Society of Renewal**

**Paragraph 1:**
> The next world begins with those who choose compassion as infrastructure. Each month, new citizens are invited—some by chance, some by need—to receive a universal basic income and help build a society without laws, only learning. Entry is open to all. The selection is fair, transparent, and human.

**Paragraph 2 (vision):**
> The Society is an experiment in harmony—proving that education, empathy, and shared purpose can guide humanity better than enforcement ever did. Here, *Universal Basic Income* is not charity, but foundation: the space to grow, contribute, and become. Every citizen learns and teaches in turn, evolving the Charter of Renewal—a living document shaped by open collaboration and reason. Guidance replaces punishment. Understanding replaces control.

**Inline links (muted):** `[Read the Charter →] [Explore the Founding Document →] [Whitepaper v0.6.0 →]`

---

## 5) Visual & Motion Spec
- **Theme:** black background (#000 / #030711 gradients), high‑contrast typography (gray‑100/300), subtle glass panels (white/5% alpha).
- **Typeface:** Inter or Geist; 1.125–1.25 line height.
- **Layout:** Centered hero, max‑w (text) 720px; form card below hero; footer links muted.

**On‑load droplet animation**
- Fullscreen overlay (`position: fixed; inset: 0; z: 50`), black background
- Play **Lottie JSON** (`/droplet.json`) once; freeze on last frame; then simultaneous: content fade‑in (`opacity 0→1`, 600ms), overlay fade‑out (800ms). Respect `prefers-reduced-motion`: skip animation, show content.

**First‑hover button ripple (persistent)**
- First time the primary CTA is hovered, emit a **radial expansion** (white → transparent) emanating from button center, captured as a final state overlay that remains after mouseout.
- Implementation model: a button‑relative pseudo‑element or child layer whose `background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.0) 60%)` animates `scale`/`opacity` via Framer Motion. On first `mouseenter`, set `hasActivated=true` (persist). Keep standard hover (`translate-y-0.5`, subtle shadow) and active press (`scale-95`) interactions.

---

## 6) Components (shadcn + custom)
- `DropletIntro.tsx` — Lottie overlay w/ reduced‑motion fallback
- `RippleButton.tsx` — persistent‑ripple CTA
- `WaitlistForm.tsx` — email + path selector + optional textarea, Zod‑validated
- `LinkRow.tsx` — muted inline links
- `Toast` / `Alert` — submission result

> **Copy** for CTA: "Join the Waitlist". Subcopy: "Lottery or need‑based invitations. Always transparent."

---

## 7) Code Examples

### 7.1 RippleButton (persistent first‑hover)
```tsx
'use client';
import { motion, useAnimation } from 'framer-motion';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function RippleButton({ onClick }: { onClick?: () => void }) {
  const [activated, setActivated] = useState(false);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  const handleFirstHover = async () => {
    if (activated) return;
    setActivated(true);
    await controls.start({
      scale: [0.6, 1.3, 1.6],
      opacity: [0.0, 0.18, 0.12],
      transition: { duration: 0.9, ease: 'easeOut' }
    });
    // Freeze at final frame (scale 1.6, opacity 0.12)
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleFirstHover}>
      {/* persistent ripple layer */}
      <motion.div
        ref={ref}
        animate={controls}
        initial={{ scale: 0.6, opacity: 0 }}
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.0) 65%)'
        }}
      />
      <Button
        onClick={onClick}
        className="relative z-10 h-12 px-6 text-base font-medium tracking-tight transition will-change-transform
                   hover:translate-y-[1px] active:scale-[0.98] rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.05)]
                   bg-white/10 hover:bg-white/15 border border-white/10"
      >
        Join the Waitlist
      </Button>
    </div>
  );
}
```

### 7.2 DropletIntro (Lottie + reduced motion)
```tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// Optional: yarn add lottie-react
import Lottie from 'lottie-react';
import droplet from '@/public/droplet.json';

export default function DropletIntro({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (prefersReduced) setShowOverlay(false);
  }, [prefersReduced]);

  return (
    <div className="relative min-h-dvh bg-black text-zinc-100">
      {!showOverlay ? (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          {children}
        </motion.main>
      ) : (
        <>
          <div className="fixed inset-0 z-50 bg-black" aria-hidden />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <Lottie
              animationData={droplet}
              loop={false}
              onComplete={() => {
                // Delay a beat then fade overlay and show content
                setTimeout(() => setShowOverlay(false), 300);
              }}
              style={{ width: 480, height: 480 }}
            />
          </div>
          <motion.main
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: showOverlay ? 0 : 1 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.main>
        </>
      )}
    </div>
  );
}
```

### 7.3 WaitlistForm (Zod + RHF)
```tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import RippleButton from './RippleButton';

const schema = z.object({
  email: z.string().email(),
  path: z.enum(['lottery', 'need']).default('lottery'),
  reason: z.string().max(800).optional()
});

type FormData = z.infer<typeof schema>;

export default function WaitlistForm() {
  const [status, setStatus] = useState<'idle'|'ok'|'error'>('idle');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setStatus('idle');
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setStatus(res.ok ? 'ok' : 'error');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@domain.com" aria-invalid={!!errors.email} {...register('email')} />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm text-zinc-300">How should we consider your invite?</legend>
        <div className="flex gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="radio" value="lottery" defaultChecked {...register('path')} />
            <span>Lottery</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" value="need" {...register('path')} />
            <span>Need‑based</span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="reason">(Optional) Tell us why you should be next</Label>
        <Textarea id="reason" rows={4} placeholder="Share brief context…" {...register('reason')} />
      </div>

      <RippleButton onClick={() => { /* noop — submit below handled by form */ }} />
      <button type="submit" className="sr-only">Submit</button>

      {status === 'ok' && (
        <p role="status" className="text-emerald-400">Check your email to confirm. Welcome aboard. ✨</p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-red-400">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
```

> **Note:** The visually prominent `RippleButton` sits above a hidden submit button for accessibility; both clicks and Enter key submit the form.

---

## 8) Page Composition (`app/page.tsx`)
- Wrap with `<DropletIntro>`
- Hero → Paragraphs → Waitlist card → LinkRow (muted links)
- Footer: tiny © and contact link

---

## 9) API Contract & Kysely Schema

### 9.1 POST `/api/waitlist`
**Request**
```json
{ "email": "you@domain.com", "path": "lottery" | "need", "reason": "string?" }
```
**Response**
- `201 Created` `{ id }` (sends confirmation email)
- `409 Conflict` existing confirmed/pending
- `400` validation errors

**Server logic**
- Normalize email (lowercase + trim); hash for dedupe key (`sha256(email)`) to avoid accidental public leakage in logs
- Rate‑limit per IP (e.g., 10/min) + Turnstile verification
- Insert row (`status='pending'`); send double‑opt‑in with signed token link `/confirm?token=…`

### 9.2 Kysely — Table & Migration
**Table:** `waitlist`
- `id` UUID PK
- `email` text (unique) + `email_hash` text (unique index)
- `path` enum: `lottery|need`
- `reason` text null
- `status` enum: `pending|confirmed`
- `ip` inet null, `user_agent` text null
- `created_at` timestamptz default now()

**Migration (example)**
```ts
// migrations/20251029_create_waitlist.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('invite_path')
    .asEnum(['lottery', 'need'])
    .execute();

  await db.schema
    .createType('invite_status')
    .asEnum(['pending', 'confirmed'])
    .execute();

  await db.schema
    .createTable('waitlist')
    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'text', col => col.notNull())
    .addColumn('email_hash', 'text', col => col.notNull())
    .addColumn('path', sql`invite_path`, col => col.notNull())
    .addColumn('reason', 'text')
    .addColumn('status', sql`invite_status`, col => col.notNull().defaultTo('pending'))
    .addColumn('ip', 'inet')
    .addColumn('user_agent', 'text')
    .addColumn('created_at', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('waitlist_email_unique')
    .on('waitlist')
    .column('email')
    .unique()
    .execute();

  await db.schema
    .createIndex('waitlist_email_hash_unique')
    .on('waitlist')
    .column('email_hash')
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('waitlist').execute();
  await db.schema.dropType('invite_status').execute();
  await db.schema.dropType('invite_path').execute();
}
```

---

## 10) Route Handler (Next.js App Router)
```ts
// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/lib/db'; // Kysely instance

const schema = z.object({
  email: z.string().email(),
  path: z.enum(['lottery', 'need']),
  reason: z.string().max(800).optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  const emailHash = crypto.createHash('sha256').update(email).digest('hex');
  const ip = req.headers.get('x-forwarded-for') ?? '';
  const ua = req.headers.get('user-agent') ?? '';

  // TODO: verify Turnstile token (if provided)

  try {
    const existing = await db
      .selectFrom('waitlist')
      .selectAll()
      .where('email_hash', '=', emailHash)
      .executeTakeFirst();

    if (existing) return NextResponse.json({ status: 'exists' }, { status: 409 });

    const row = await db
      .insertInto('waitlist')
      .values({ email, email_hash: emailHash, path: parsed.data.path, reason: parsed.data.reason, ip, user_agent: ua })
      .returning(['id'])
      .executeTakeFirst();

    // TODO: send double opt‑in email with signed token URL
    return NextResponse.json({ id: row?.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
```

---

## 11) Environment & Secrets
Create `.env`:
```
DATABASE_URL=postgres://...
EMAIL_PROVIDER_API_KEY=...
TURNSTILE_SECRET=...
APP_URL=https://societyofrenewal.org
```

---

## 12) Accessibility & UX
- Respect `prefers-reduced-motion`: bypass droplet, disable ripple animation (keep static final glow if activated)
- Focus rings visible (Tailwind `focus-visible:outline`); logical tab order; form has associated labels
- ARIA: role=status/alert for result messages; `aria-invalid` on inputs with errors
- Color contrast ≥ 4.5:1 on all text

---

## 13) SEO & Social
- `<title>Join the Society of Renewal</title>`; descriptive meta
- OpenGraph image: minimal black card with title + subtle ripple graphic
- `robots.txt` + `sitemap.xml`

---

## 14) Analytics Events
- `page_view` (home)
- `ripple_activated` (first hover)
- `waitlist_submit_attempt` / `waitlist_submit_success` / `waitlist_submit_error`

---

## 15) Performance
- Lottie JSON lazy‑loaded; provide `DropletIntro` fallback SVG if asset >200KB
- Preload Inter/Geist; use `font-display: swap`
- Avoid layout shift (fixed hero heights on load)

---

## 16) QA Checklist
- [ ] Animations disabled in reduced‑motion
- [ ] Persistent ripple holds after mouseout; still has hover/active affordances
- [ ] Form validates; keyboard submits with Enter; screen reader announces status
- [ ] API rejects duplicates; rate limiting works; confirmation email sent
- [ ] Links open in new tab with `rel="noopener"`

---

## 17) Future Hooks (non‑blocking)
- Add “reason length” guidance
- Add locale switcher and i18n strings
- Add opt‑in to receive updates about Charter changes

---

## 18) Minimal Page Composition (example)
```tsx
// app/page.tsx
import DropletIntro from '@/components/DropletIntro';
import WaitlistForm from '@/components/WaitlistForm';
import Link from 'next/link';

export default function Page() {
  return (
    <DropletIntro>
      <section className="mx-auto max-w-3xl px-6 py-20 text-zinc-200">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Join the Society of Renewal</h1>
        <p className="mt-6 text-zinc-300">The next world begins with those who choose compassion as infrastructure. Each month, new citizens are invited—some by chance, some by need—to receive a universal basic income and help build a society without laws, only learning. Entry is open to all. The selection is fair, transparent, and human.</p>
        <p className="mt-4 text-zinc-300">The Society is an experiment in harmony—proving that education, empathy, and shared purpose can guide humanity better than enforcement ever did. Here, <em>Universal Basic Income</em> is not charity, but foundation: the space to grow, contribute, and become. Every citizen learns and teaches in turn, evolving the Charter of Renewal—a living document shaped by open collaboration and reason. Guidance replaces punishment. Understanding replaces control.</p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <WaitlistForm />
        </div>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-zinc-400">
          <Link href="https://renewal.wiki" target="_blank" rel="noopener" className="hover:text-zinc-200">Read the Charter →</Link>
          <Link href="https://societyofrenewal.org/founding-document" target="_blank" rel="noopener" className="hover:text-zinc-200">Explore the Founding Document →</Link>
          <Link href="https://github.com/CloneOfNone/essentia/blob/main/docs/whitepaper.md" target="_blank" rel="noopener" className="hover:text-zinc-200">Whitepaper v0.6.0 →</Link>
        </div>
      </section>
    </DropletIntro>
  );
}
```

---

## 19) Deploy
- Vercel project (Node 18+); Postgres (Neon/Supabase); run Kysely migrations on deploy
- Set ENV vars; enable CF Turnstile in `middleware.ts` if configured

**Done =** animations meet spec, form works with double opt‑in, links function, a11y/SEO pass, reduced‑motion respected.

