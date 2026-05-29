// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const APIFY_TOKEN = Deno.env.get("APIFY_API_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CACHE_DAYS = 60;
// Compass Google Places actor — cheapest reliable option (~$4/1k places)
const APIFY_ACTOR = "compass~crawler-google-places";

const BodySchema = z.object({
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().min(1).max(120),
  count: z.number().int().min(1).max(500),
});

type Lead = {
  name: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  address: string;
  reviewList: { author: string; rating: number; text: string; date: string }[];
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalize(items: any[]): Lead[] {
  return items.map((it) => ({
    name: it.title ?? it.name ?? "Unknown",
    phone: it.phone ?? it.phoneUnformatted ?? "",
    website: (it.website ?? "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    rating: typeof it.totalScore === "number" ? it.totalScore : (it.rating ?? 0),
    reviews: typeof it.reviewsCount === "number" ? it.reviewsCount : (it.reviews ?? 0),
    address: it.address ?? it.street ?? "",
    reviewList: Array.isArray(it.reviews)
      ? it.reviews.slice(0, 5).map((r: any) => ({
          author: r.name ?? "Anonymous",
          rating: r.stars ?? r.rating ?? 5,
          text: r.text ?? "",
          date: r.publishedAtDate ?? r.publishAt ?? "",
        }))
      : [],
  })).filter((l) => l.name && l.name !== "Unknown");
}

async function runApify(query: string, count: number): Promise<Lead[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_API_TOKEN not configured");
  const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
  const input = {
    searchStringsArray: [query],
    maxCrawledPlacesPerSearch: count,
    language: "en",
    skipClosedPlaces: true,
    scrapePlaceDetailPage: false,
    maxReviews: 5,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Apify ${res.status}: ${txt.slice(0, 300)}`);
  }
  const items = await res.json();
  return normalize(Array.isArray(items) ? items : []);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { city, state, country, count } = parsed.data;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Credit pre-check (avoid spending Apify if user can't pay)
    const { data: creditsRow } = await admin
      .from("user_credits").select("credits").eq("user_id", userId).maybeSingle();
    if (!creditsRow || creditsRow.credits < count) {
      return json({ error: "Insufficient credits" }, 402);
    }

    // Cache lookup: same city/state/country, fresh enough, big enough
    const cutoff = new Date(Date.now() - CACHE_DAYS * 86_400_000).toISOString();
    let cacheQuery = admin
      .from("lead_searches")
      .select("leads, created_at")
      .ilike("city", city)
      .ilike("country", country)
      .gte("created_at", cutoff)
      .gte("lead_count", count)
      .order("created_at", { ascending: false })
      .limit(1);
    if (state && state.trim()) cacheQuery = cacheQuery.ilike("state", state);

    const { data: cacheHits } = await cacheQuery;
    let leads: Lead[];
    let source: "cache" | "live";

    if (cacheHits && cacheHits.length > 0) {
      leads = (cacheHits[0].leads as unknown as Lead[]).slice(0, count);
      source = "cache";
    } else {
      const queryStr = `roofing ${city}${state ? `, ${state}` : ""} ${country}`;
      leads = await runApify(queryStr, count);
      if (leads.length === 0) return json({ error: "No leads found for this location" }, 404);
      source = "live";
    }

    // Deduct credits via existing RPC (runs as the user)
    const { data: newBalance, error: deductErr } = await userClient.rpc("deduct_credits", { _amount: count });
    if (deductErr) return json({ error: deductErr.message }, 400);

    // Save to lead_searches (acts as cache + user history)
    const { data: inserted } = await admin.from("lead_searches").insert({
      user_id: userId,
      city,
      state: state || null,
      country,
      lead_count: leads.length,
      leads: leads as unknown as any,
    }).select("id").single();

    return json({
      leads,
      credits_remaining: newBalance,
      source,
      search_id: inserted?.id ?? null,
    });
  } catch (e) {
    console.error("generate-leads error:", e);
    return json({ error: (e as Error).message || "Server error" }, 500);
  }
});
