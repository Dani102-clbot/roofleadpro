import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Coins, Download, Loader2, LogOut, Search, ShoppingCart, Star, Phone, Mail, Globe, MapPin,
  ChevronDown, Copy, Trash2, History, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Lead, generateLeads, downloadCsv } from "@/lib/sampleLeads";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
];
const PRESETS = [10, 25, 50, 100];
const LOADING_MSGS = [
  "Searching Google Maps for roofing businesses…",
  "Pulling business listings…",
  "Enriching with contact details…",
  "Scraping reviews…",
  "Finalising results…",
];

type SavedSearch = {
  id: string;
  city: string;
  state: string | null;
  country: string;
  lead_count: number;
  leads: Lead[];
  created_at: string;
};

function starsBreakdown(rating: number) {
  if (rating >= 4.7) return [68, 18, 8, 4, 2];
  if (rating >= 4.3) return [52, 24, 14, 6, 4];
  if (rating >= 4.0) return [42, 28, 16, 9, 5];
  return [30, 28, 22, 12, 8];
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("US");
  const [leadCount, setLeadCount] = useState(25);
  const [customCount, setCustomCount] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [openReviews, setOpenReviews] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setCredits(data?.credits ?? 0));
    loadSaved();
  }, [user]);

  useEffect(() => {
    if (!searching) return;
    setLoadingMsgIdx(0);
    const t = setInterval(() => setLoadingMsgIdx(i => Math.min(i + 1, LOADING_MSGS.length - 1)), 700);
    return () => clearInterval(t);
  }, [searching]);

  const loadSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from("lead_searches")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) setSaved(data.map(d => ({ ...d, leads: d.leads as unknown as Lead[] })));
  };

  const maxLeads = Math.max(1, credits ?? 0);

  // Clamp leadCount when credits load
  useEffect(() => {
    if (credits === null) return;
    if (leadCount > maxLeads) setLeadCount(maxLeads);
  }, [credits, maxLeads, leadCount]);

  const setPreset = (n: number) => {
    setLeadCount(Math.min(n, maxLeads));
    setCustomCount("");
  };
  const onCustomChange = (v: string) => {
    setCustomCount(v.replace(/\D/g, ""));
    const n = parseInt(v.replace(/\D/g, ""), 10);
    if (!isNaN(n) && n > 0) setLeadCount(Math.min(n, maxLeads));
  };

  const handleSearch = async () => {
    if (!city.trim()) return toast.error("Enter a city to search");
    if (!country) return toast.error("Select a country");
    if (!credits || credits < leadCount) return toast.error("Not enough credits");
    setSearching(true);
    setOpenReviews({});
    setSelected(new Set());
    await new Promise(r => setTimeout(r, 1800));
    const countryName = COUNTRIES.find(c => c.code === country)?.name ?? country;
    const newLeads = generateLeads(leadCount, city.trim(), "", countryName);
    const { data: newCredits, error: deductError } = await supabase.rpc("deduct_credits", { _amount: leadCount });
    if (deductError) {
      setSearching(false);
      return toast.error(deductError.message || "Could not deduct credits");
    }
    setCredits(newCredits ?? 0);
    setLeads(newLeads);
    const { data: inserted } = await supabase.from("lead_searches").insert({
      user_id: user!.id,
      city: city.trim(),
      state: null,
      country: countryName,
      lead_count: leadCount,
      leads: newLeads as unknown as never,
    }).select().single();
    if (inserted) {
      setCurrentSavedId(inserted.id);
      loadSaved();
    }
    setSearching(false);
    toast.success(`Found ${newLeads.length} leads — saved to history`);
    setTimeout(() => document.getElementById("results-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const exportLeads = (rows: Lead[], cityName: string) => {
    if (!rows.length) return;
    downloadCsv(rows, `roofleads-${cityName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`);
    toast.success("CSV downloaded");
  };
  const exportSelected = () => {
    const rows = selected.size > 0 ? leads.filter((_, i) => selected.has(i)) : leads;
    exportLeads(rows, city || "leads");
  };
  const toggleSelect = (i: number) => {
    setSelected(s => {
      const next = new Set(s);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
  const selectAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map((_, i) => i)));
  };

  const copyLead = (i: number) => {
    const l = leads[i];
    navigator.clipboard.writeText([l.name, l.phone, l.email, l.website, l.address, l.rating].join("\t"));
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(c => (c === i ? null : c)), 1400);
  };

  const deleteSaved = async (id: string) => {
    await supabase.from("lead_searches").delete().eq("id", id);
    setSaved(s => s.filter(x => x.id !== id));
    if (currentSavedId === id) { setLeads([]); setCurrentSavedId(null); }
    toast.success("Search removed");
  };
  const loadSavedLeads = (s: SavedSearch) => {
    setLeads(s.leads);
    setCurrentSavedId(s.id);
    setCity(s.city);
    setOpenReviews({});
    setSelected(new Set());
    setTimeout(() => document.getElementById("results-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const initial = (user.email ?? "U")[0].toUpperCase();
  const canSearch = !!city.trim() && !!country && leadCount > 0 && leadCount <= (credits ?? 0) && !searching;
  const selectedCount = selected.size;
  const hasResults = leads.length > 0;

  return (
    <div className="min-h-screen pb-32">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border glass">
        <div className="mx-auto flex h-[58px] max-w-[660px] items-center justify-between px-4">
          <Logo to="/dashboard" compact />
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border surface-2 px-3 py-1.5 sm:flex">
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-xs tabular-nums">{credits?.toLocaleString() ?? "…"}</span>
              <span className="font-mono text-[11px] uppercase text-muted-foreground tracking-wider">credits</span>
            </div>
            <button
              onClick={() => toast.info("Billing coming soon")}
              className="hidden items-center gap-1.5 rounded border border-border surface-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Buy
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initial}</AvatarFallback></Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-bold">Signed in</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="sm:hidden">
                  <Coins className="mr-2 h-4 w-4" /> {credits?.toLocaleString() ?? 0} credits
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden" onClick={() => toast.info("Billing coming soon")}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Buy credits
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* APP */}
      <main className="mx-auto max-w-[660px] px-4 pt-9">
        <h1 className="text-[clamp(28px,7vw,48px)] font-extrabold leading-[1.0] tracking-[-0.03em]">
          Find roofing<br />leads <span className="text-primary">anywhere.</span>
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Names, phones, emails, websites, ratings & real customer reviews — ready to close.
        </p>

        {/* Pills */}
        <div className="mt-7 flex flex-wrap gap-1.5">
          {[
            { label: "Live data", dot: "success" },
            { label: "Phones · Emails", dot: "primary" },
            { label: "Reviews included", dot: "success" },
            { label: "CSV export", dot: "success" },
          ].map(p => (
            <span key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-border surface-2 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className={`h-1 w-1 rounded-full ${p.dot === "success" ? "bg-success" : "bg-primary"}`} />
              {p.label}
            </span>
          ))}
        </div>

        {/* SEARCH CARD */}
        <div className="mt-7 rounded-lg border border-border bg-card p-5">
          <label htmlFor="city" className="field-label mb-2 block">City</label>
          <div className="relative mb-4">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && canSearch && handleSearch()}
              placeholder="e.g. Houston, Lagos, Manchester…"
              autoComplete="off"
              className="h-12 w-full rounded-md border-[1.5px] border-border surface-2 pl-10 pr-3 text-base font-semibold text-foreground outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <label htmlFor="country" className="field-label mb-2 block">Country</label>
          <div className="relative mb-5">
            <select
              id="country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="h-12 w-full appearance-none rounded-md border-[1.5px] border-border surface-2 px-3 pr-10 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-card">{c.flag} {c.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <label className="field-label mb-2 block">Number of leads</label>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESETS.map(n => {
              const active = leadCount === n && !customCount;
              const disabled = n > maxLeads;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={disabled}
                  onClick={() => setPreset(n)}
                  className={`rounded-md border-[1.5px] py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border surface-2 text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">Custom:</span>
            <input
              type="text"
              inputMode="numeric"
              value={customCount}
              onChange={e => onCustomChange(e.target.value)}
              placeholder={`max ${maxLeads}`}
              className="w-24 rounded-md border-[1.5px] border-border surface-2 px-3 py-2 text-center font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
            <span className="font-mono text-[11px] text-muted-foreground">/ {maxLeads.toLocaleString()} available</span>
          </div>
          <div className="mt-2 font-mono text-[11px] text-muted-foreground">
            Fetching <span className="text-foreground">{leadCount}</span> leads · costs <span className="text-primary">{leadCount} credits</span>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-[hsl(var(--primary-hover))] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-muted-foreground/40"
            style={{ letterSpacing: "0.06em" }}
          >
            {searching ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</> : <><Search className="h-[15px] w-[15px]" /> Search leads</>}
          </button>
        </div>

        {/* LOADING */}
        {searching && (
          <div className="py-11 text-center">
            <div className="mb-4 h-[2px] w-full overflow-hidden rounded bg-border">
              <div className="h-full animate-shimmer rounded" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)))" }} />
            </div>
            <div className="font-mono text-xs text-muted-foreground">{LOADING_MSGS[loadingMsgIdx]}</div>
          </div>
        )}

        <div id="results-anchor" />

        {/* RESULTS */}
        {!searching && hasResults && (
          <div className="mt-8">
            <div className="mb-3.5 flex items-center justify-between border-b border-border pb-3">
              <div className="font-mono text-xs text-muted-foreground">
                <b className="block text-xl text-primary">{leads.length}</b>
                leads found
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={selectAll}
                  className="rounded border border-border surface-2 px-2.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {selected.size === leads.length ? "Clear" : "Select all"}
                </button>
                <button
                  onClick={() => exportLeads(leads, city || "leads")}
                  className="rounded border border-primary bg-primary/[0.08] px-2.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-primary"
                >
                  Export CSV
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {leads.map((l, i) => {
                const isOpen = !!openReviews[i];
                const isSel = selected.has(i);
                const bars = starsBreakdown(l.rating);
                return (
                  <div
                    key={i}
                    className={`animate-fade-up overflow-hidden rounded-md border bg-card transition-colors ${isSel ? "border-primary" : "border-border"}`}
                    style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                  >
                    {/* main */}
                    <div className="cursor-pointer p-4 transition-colors hover:bg-white/[0.02]" onClick={() => toggleSelect(i)}>
                      <div className="mb-2.5 flex items-start justify-between gap-2.5">
                        <div className="text-[15px] font-bold leading-tight tracking-[-0.02em]">{l.name}</div>
                        <div className="flex flex-shrink-0 items-center gap-1 font-mono text-xs">
                          <Star className="h-3 w-3 fill-current text-[#f0c040]" />
                          <span>{l.rating}</span>
                          <span className="ml-0.5 text-[10px] text-muted-foreground">({l.reviews})</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <InfoRow Icon={Phone} value={l.phone} has />
                        <InfoRow Icon={Mail}  value={l.email || "No email found"} has={!!l.email} />
                        <InfoRow Icon={Globe} value={l.website || "No website"} has={!!l.website} />
                        <InfoRow Icon={MapPin} value={l.address} has />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {l.tags.map(t => (
                            <span
                              key={t}
                              className={`rounded-sm border px-1.5 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] ${
                                t === "verified" ? "border-success/30 bg-success/[0.06] text-success"
                                : t === "website" ? "border-primary/30 bg-primary/[0.06] text-primary"
                                : "border-border surface-3 text-muted-foreground"
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); copyLead(i); }}
                            className="rounded border border-border bg-transparent px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            {copiedIdx === i ? <span className="flex items-center gap-1"><Check className="h-3 w-3" />Copied</span> : <span className="flex items-center gap-1"><Copy className="h-3 w-3" />Copy</span>}
                          </button>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setOpenReviews(r => ({ ...r, [i]: !r[i] })); }}
                            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${
                              isOpen ? "border-primary-glow bg-primary-glow/[0.06] text-primary-glow" : "border-border text-muted-foreground hover:border-primary-glow hover:text-primary-glow"
                            }`}
                            style={{ color: isOpen ? "hsl(var(--primary-glow))" : undefined, borderColor: isOpen ? "hsl(var(--primary-glow))" : undefined }}
                          >
                            Reviews
                            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* reviews panel */}
                    {isOpen && (
                      <div className="border-t border-border surface-2 px-4 py-3.5 animate-fade-up">
                        <div className="mb-3 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          <span>Customer reviews</span>
                          <span>{l.reviews} total on Google</span>
                        </div>
                        <div className="mb-3.5 grid grid-cols-[auto_1fr] gap-3 border-b border-border pb-3.5">
                          <div>
                            <div className="text-4xl font-extrabold leading-none tracking-[-0.04em]">{l.rating}</div>
                            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">out of 5</div>
                          </div>
                          <div className="flex-1 space-y-1">
                            {bars.map((pct, bi) => (
                              <div key={bi} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                                <span>{5 - bi}★</span>
                                <div className="h-1 flex-1 overflow-hidden rounded bg-border">
                                  <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: "hsl(var(--primary-glow))" }} />
                                </div>
                                <span className="min-w-[24px] text-right">{pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {l.reviewList.map((r, ri) => (
                            <div
                              key={ri}
                              className="rounded surface-3 border-l-2 p-3"
                              style={{ borderLeftColor: r.sentiment === "positive" ? "hsl(var(--success))" : r.sentiment === "neutral" ? "hsl(var(--primary-glow))" : "#a33" }}
                            >
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <div className="text-xs font-bold">{r.author}</div>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, si) => (
                                      <Star key={si} className={`h-3 w-3 ${si < r.rating ? "fill-current text-[#f0c040]" : "text-border"}`} />
                                    ))}
                                  </div>
                                  <span className="font-mono text-[10px] text-muted-foreground">{r.date}</span>
                                </div>
                              </div>
                              <div className="font-mono text-xs leading-relaxed text-muted-foreground">{r.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!searching && !hasResults && (
          <div className="py-16 text-center">
            <div className="mb-3 text-4xl opacity-25">🏠</div>
            <div className="text-base font-bold text-muted-foreground">No search yet</div>
            <div className="mt-1 font-mono text-xs text-border">Configure your search above and hit Search</div>
          </div>
        )}

        {/* SAVED */}
        <section className="mt-12">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="label-eyebrow">Saved searches</span>
            <span className="font-mono text-xs text-muted-foreground">({saved.length})</span>
          </div>
          {saved.length === 0 ? (
            <div className="rounded border border-border bg-card p-5 font-mono text-xs text-muted-foreground">
              Your generated lead lists will appear here so you can come back and download them anytime.
            </div>
          ) : (
            <div className="grid gap-1 sm:grid-cols-2">
              {saved.map(s => (
                <div key={s.id} className="rounded border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{s.city}</div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">{s.country}</div>
                    </div>
                    <span className="flex-shrink-0 rounded border border-border surface-2 px-2 py-0.5 font-mono text-[10px] tabular-nums">{s.lead_count} leads</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <button onClick={() => loadSavedLeads(s)} className="flex-1 rounded border border-border surface-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary">View</button>
                    <button onClick={() => exportLeads(s.leads, s.city)} className="rounded border border-border surface-2 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Download className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteSaved(s.id)} className="rounded border border-border surface-2 px-2.5 py-1.5 text-destructive transition-colors hover:border-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* STICKY EXPORT BAR */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary surface-2 animate-fade-up">
          <div className="mx-auto flex max-w-[660px] items-center justify-between gap-3 px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground">
              <b className="text-primary">{selectedCount}</b> selected
            </span>
            <div className="flex gap-2">
              <button onClick={() => setSelected(new Set())} className="rounded border border-border bg-transparent px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary">Clear</button>
              <button onClick={exportSelected} className="rounded bg-primary px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))]">Export CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ Icon, value, has }: { Icon: typeof Phone; value: string; has: boolean }) {
  return (
    <div className={`flex items-start gap-2 font-mono text-xs leading-snug ${has ? "text-foreground" : "text-muted-foreground"}`}>
      <Icon className={`mt-0.5 h-3 w-3 flex-shrink-0 ${has ? "text-[hsl(var(--primary-glow))]" : "opacity-45"}`} />
      <span className="break-all">{value}</span>
    </div>
  );
}
