# Apify integration — $0 launch plan

Goal: replace fake sample leads with real Google Maps results from Apify, cache them in the database for free reuse, and lower the free-trial credit grant to limit your upfront Apify spend.

## How it will work

```text
User clicks "Generate Leads"
        │
        ▼
Edge Function "generate-leads"
        │
        ├─ 1. Auth check (verify JWT)
        ├─ 2. Look in lead_searches for same city+state+country
        │     with results created < 60 days ago and lead_count >= requested
        │
        ├─ 3a. CACHE HIT  → slice N leads → deduct credits → return
        │
        └─ 3b. CACHE MISS → call Apify Google Maps Scraper actor
                            → wait for run → fetch dataset items
                            → normalize to Lead shape
                            → save to lead_searches (acts as cache for everyone)
                            → deduct credits → return
```

Cache rule: 60 days fresh, full-price credits on cache hits (you pocket 100% margin).

## Pricing structure (recommended, not built in v1)

- Free signup: **10 credits** (down from 100) — caps your acquisition cost at ~$0.05/signup
- Future paid packs (add when you turn on Stripe later):
  - Starter — 500 credits / $29
  - Growth — 2,000 credits / $79
  - Pro — 10,000 credits / $299
  - Top-up — 100 credits / $9
- 1 credit = 1 lead, no subscriptions in v1

## What gets built

### 1. Schema change (migration)
- Change `user_credits.credits` default from `100` → `10` (only affects new signups; existing users keep their balance)
- Add index `lead_searches(country, city, state, created_at desc)` for fast cache lookups

### 2. Secret
- Add `APIFY_API_TOKEN` via the secrets tool (you grab it free from apify.com/account/integrations — Apify gives $5/month free credit, enough to validate)

### 3. New edge function: `generate-leads`
- File: `supabase/functions/generate-leads/index.ts`
- Validates JWT, parses `{ city, state, country, count }` with zod
- Cache lookup against `lead_searches` (same city/state/country, <60 days, enough leads)
- On miss: calls Apify actor `compass/crawler-google-places` (or `apify/google-maps-scraper`) with `searchStringsArray: ["roofing ${city}, ${state} ${country}"]`, `maxCrawledPlacesPerSearch: count`, `language: "en"`. Uses sync-get-dataset-items endpoint so the function returns when the run completes.
- Normalizes Apify output → `{ name, phone, website, rating, reviews, address, reviewList }`
- Inserts the full result set into `lead_searches` (cache for future searches)
- Calls existing `deduct_credits(_amount)` RPC
- Returns `{ leads, credits_remaining, source: "cache" | "live" }`
- Standard CORS headers

### 4. Dashboard refactor (`src/pages/Dashboard.tsx`)
- Replace `generateLeads()` call with `supabase.functions.invoke("generate-leads", { body: {...} })`
- Show a small "fresh ⚡" or "cached" badge based on `source`
- Remove the second client-side `lead_searches` insert (now done server-side) and the client-side `deduct_credits` call (now done server-side)
- Keep CSV export, saved searches, reviews dialog as-is

### 5. Cleanup
- `src/lib/sampleLeads.ts`: keep `Lead` type + `downloadCsv` helper, remove `generateLeads` fake generator

## What stays the same
- All auth, RLS, credit RPC, saved searches UI, CSV export
- Landing page, login/signup
- Existing user credits balances

## What is explicitly NOT in this round
- Stripe / billing / credit packs (next round, when you have first signups)
- Pre-seeded country databases
- Email enrichment, social profiles, owner names

## Apify cost reality (so you can plan)
- Free tier: $5/month — covers ~700–1,200 real leads to start
- After that: ~$0.004–$0.007 per lead at cost; you'll be charging ~$0.04–$0.09 per lead → 10–20× markup
- Every cache hit after launch is pure margin

## Order of operations
1. You confirm this plan
2. I'll ask you to add `APIFY_API_TOKEN` (1-min setup at apify.com)
3. Migration → edge function → dashboard rewire → test one real search
4. When you have your first paying interest, we add Stripe in a separate round

Ready to build?