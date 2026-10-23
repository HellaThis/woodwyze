# WoodWyze: full initial build

You're building WoodWyze, a production web platform for small custom woodworking shops, home woodworkers and local suppliers. It will run on this server at woodwyze.com. This is the real v1, not a prototype. Build it to be deployed, used by paying customers and maintained.

Start by reading everything under "Inputs". Then come back to me with your build plan and the open questions listed at the end, before writing application code.

## Inputs

1. **The working prototype**, in `./prototype/` (I'll copy it from my Mac's `~/woodwyze/app`). It's Vite + React + Tailwind with all logic client-side. Its `src/engine/` is the parametric engine and is the source of truth for the product's math:
   - templates: base cabinet run, vanity, bookcase, built-in shelving wall, and the floating double vanity
   - part generation, strip nesting on sheets with kerf, board-foot lumber, pricing, design checks, DXF export
   - 15 passing tests
   
   Port the engine as-is into its own package, keep every test passing, and extend it. Don't rewrite its math. The prototype's pages show the intended product, flows, copy and visual design.
2. **The business plan**: https://docs.google.com/document/d/1fZ6ERCogl6ozC7WqaN07NhlFN7LnQdYaik0TudNCCYM/edit. It defines pricing tiers, the discovery survey, the GTM motion, the metrics to instrument and the phase gates. Build v1 to that plan. Anything the plan calls phase 2 or later stays out.
3. **Outreach engine reference** (optional), in `./reference/outreach/`, if I copy it over. These are files from an earlier system I built: OpenStreetMap and license-list discovery, fit scoring, email sequences, one-click response tokens, unsubscribe and suppression, and a Cloudflare Worker for inbound replies.
   - **Clean-room rule:** port the generic mechanics only. That system was built for a Rockler store. Nothing Rockler-specific may enter this codebase: no SOP text, segments, offers, approval gates, store or employee concepts, data, contacts, names or branding.
   - If a file mixes the two, rewrite the generic part fresh instead of copying it.
   - If the folder isn't there, build these mechanics from scratch.

## Stack

Use this stack unless you find a concrete reason not to. Tell me before deviating.

- **Monorepo**, pnpm workspaces:
  - `apps/web`: Next.js, App Router, TypeScript strict, Tailwind
  - `packages/engine`: the ported engine, pure TypeScript, no React, Vitest
  - `workers/inbound`: Cloudflare Worker that receives reply email
  - `supabase/`: migrations and seed
- **Supabase**: Postgres, auth (email magic link plus Google), storage for logos and PDFs, and row-level security on every table. Use migrations only. No dashboard-clicked schema.
- **Stripe** subscriptions, test mode until I say otherwise.
- **Resend** for sending email.
- **Server-rendered quote PDFs**, for example with `@react-pdf/renderer` or Playwright. Pick one and tell me why.
- **Deployment**: Docker Compose on this server. The Next.js standalone build sits behind Caddy with automatic TLS.

## What v1 includes

### Public site
- Marketing home with the live vanity demo hero, pricing, and the audience sections (shops, home woodworkers, suppliers), carried over from the prototype.
- Signup for early access.
- SEO basics: meta tags, sitemap, OG images.

### Quote calculator (shops)
- **Templates:** all five, with presets.
- **Inputs and outputs:**
  - Material choices.
  - Shop rates and markup.
  - Live price, cut list, sheet layouts, board feet, hardware and design checks.
  - DXF download and a branded PDF quote.
- **Free tier limits:** anonymous users can price a job but must sign up to save or send it. Free accounts get 5 saved quotes per calendar month.
- **Deep links:** `/quote?t=<template>` preloads a template, and email links use it.

### Shop accounts
- **Setup:** shop profile, logo, rates, and per-material prices.
- **Quotes:** create, edit and duplicate them. Status moves draft → sent → won/lost, with history.
- **Sending:** send a quote to the customer by email with a tokenized approval page. When the customer approves, the quote moves to won.
- **Job board and dashboard:** the board shows every quote by status. The dashboard shows win rate and pipeline.
- **Team members on Pro:** up to 3 users per shop.
- **Invoices on Pro:** generated from a won quote, as PDF plus email, marked paid by hand. No payment processing in v1.

### Home edition
- Saved projects, a shopping list, and nearby suppliers.
- Hobby tier unlocks unlimited projects and print-ready plans.

### Supplier portal
- **Profile:** location, service radius, and kind (hardwood dealer, sheet goods yard, tool store).
- **Listings:** manual entry plus CSV import, with price, pro price and stock status.
- **Requests from shops:** a shop sends its material list from a quote to suppliers in its region. Suppliers answer with price and pickup or delivery date, and the shop sees the answers on the quote.
- **Pro pricing:** visible only to signed-in shop accounts.
- **Directory:** public, filtered by distance.

### Billing
- **Plans:**

  | Plan | Price |
  | --- | --- |
  | Shop | $79/mo |
  | Pro | $199/mo |
  | Hobby | $6/mo or $49/yr |
  | Supplier Partner | $99/mo |
  | Supplier Hosted | $249/mo |

- **Founding-shop coupon:** 50% off the first year, granted to anyone who completed the survey.
- **Stripe integration:** Checkout, the customer portal, and webhooks as the only source of truth for entitlements.
- Enforce plan limits server-side.

### Outreach and discovery (internal admin only)
- **Discovery:** import CSLB C-6 license CSVs, plus an OpenStreetMap Overpass sweep by radius.
- **Shop records:** fit score, dedupe, a published-email crawler that respects robots.txt, and stages.
- **The survey sequence from the plan:**
  - The 4 answer links in the email record question 1 in one click.
  - The follow-up page asks the remaining questions and the opt-ins.
  - Two touches maximum.
- **Compliance:** every email carries a physical address and a working one-click unsubscribe (List-Unsubscribe headers too). The suppression list is checked before every send.
- **Sending safety:**
  - A global kill switch, **off by default**.
  - A per-inbox daily cap, default 100.
  - A warm-up ramp.
  - A dedicated sending subdomain, never the root domain.
  - Nothing sends until I turn it on.
- **Inbound:** replies arrive through the Cloudflare Worker with a shared secret, and threads show in an admin inbox.

### Admin and metrics
- **Roles:** platform admin (me and my partner Sacha Lien, sacha.lien@gmail.com), shop owner and member, supplier, home user.
- **Events:** an append-only `events` table for every step in the plan's metrics: survey click, survey complete, signup, quote created, quote sent, quote won, upgrade, cancel, request sent, request answered.
  - Track email clicks.
  - Don't track opens as a success metric.
- **Dashboard:** the weekly funnel by cohort, MRR, logo churn, activation (quote sent within 7 days of signup) and free-to-paid.

## Non-negotiables

- **Secrets:**
  - No secret ever goes in git. Keep secrets in a `.env` file on the server and commit only a `.env.example`.
  - Add a pre-commit secret scan (gitleaks or similar).
  - The old public `HellaThis/woodwyze` repo has Clerk keys in its history. Do not reuse that repo or those keys. Use a new private repo, and I'll tell you which.
- **Tests:**
  - The engine tests from the prototype plus new ones.
  - Tests on RLS policies.
  - Integration tests for billing webhooks and the send path, including suppression, the kill switch and the caps.
  - Playwright end-to-end for: quote → save → send → approve; supplier request → answer; survey click → complete.
- **Accessibility:** WCAG 2.1 AA, keyboard-usable, works at 390px wide.
- **Design:** keep the prototype's visual identity:
  - Archivo with its width axis
  - forest-green palette and birch-toned drawings
  - plain, specific copy
  - no em dashes in UI text
- **Approval gates:** ask before anything irreversible or outward-facing:
  - DNS changes (I'll make them in Cloudflare; give me the records)
  - production deploys
  - enabling sending
  - switching Stripe to live
  - deleting data
- **Engine math:** where you change or extend it, say what changed and why. My own floating vanity preset must keep reproducing its cut list exactly; its tests pin it.

## How to work

1. **Inspect the server first**, and report what you find: OS, Docker, existing reverse proxy, open ports, other services already running, and disk space. Don't disturb anything already on the server.
2. **Send me your build plan**: milestones, schema outline, routes, and anything in this brief you'd push back on. Then wait for my answers to the open questions.
3. **Build in milestones**, committing as you go with clear messages:
   1. Monorepo and engine package with tests green.
   2. Supabase schema, RLS and auth.
   3. Public site and calculator.
   4. Shop accounts, quotes, PDF and approval.
   5. Billing.
   6. Supplier portal and requests.
   7. Home edition.
   8. Outreach, survey and inbound.
   9. Admin metrics.
   10. Deploy to staging at staging.woodwyze.com.
4. **After each milestone**, give me a short status: what works, how to see it, what's next, and any decision you need from me.
5. **Keep a `docs/` folder current** with architecture, data model, runbook (deploy, backup, restore, rotate secrets), and the outreach sending checklist.

## Open questions to answer before you build

Ask me these if they aren't already answered:
- **Supabase:** create a new project, or use an existing one? Which region?
- **Sending subdomain:** which one (for example mail.woodwyze.com)? woodwyze.com's existing email setup must stay as it is.
- **Business details:** the physical mailing address for email footers, and the legal entity name for invoices and the terms.
- **GitHub:** the private repo to push to.
- **Server ports:** whether ports 80 and 443 are free on this server, or whether another proxy already owns them.
- **Plan scope:** anything in the plan you think v1 should drop to ship faster.
