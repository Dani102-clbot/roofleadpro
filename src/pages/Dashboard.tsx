import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import { Coins, Download, Loader2, LogOut, Search, ShoppingCart, Star, Trash2, History, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Lead, downloadCsv } from "@/lib/sampleLeads";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "ZA", name: "South Africa" },
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

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("US");
  const [leadCount, setLeadCount] = useState(25);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [reviewLead, setReviewLead] = useState<Lead | null>(null);
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setCredits(data?.credits ?? 0));
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from("lead_searches")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) setSaved(data.map(d => ({ ...d, leads: d.leads as unknown as Lead[] })));
  };

  const maxLeads = Math.max(1, credits ?? 0);
  const isUS = country === "US";

  // Keep leadCount within bounds
  useEffect(() => {
    if (credits === null) return;
    if (leadCount > maxLeads) setLeadCount(maxLeads);
    if (leadCount < 1) setLeadCount(1);
  }, [credits, maxLeads, leadCount]);

  const handleLeadCountInput = (v: string) => {
    const n = parseInt(v.replace(/\D/g, ""), 10);
    if (isNaN(n)) return setLeadCount(1);
    setLeadCount(Math.max(1, Math.min(maxLeads, n)));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return toast.error("Enter a city to search");
    if (!country) return toast.error("Select a country");
    if (!credits || credits < leadCount) return toast.error("Not enough credits");
    setSearching(true);
    await new Promise(r => setTimeout(r, 900));
    const stateValue = state.trim();
    const newLeads = generateLeads(leadCount, city.trim(), stateValue, COUNTRIES.find(c => c.code === country)?.name ?? country);
    setLeads(newLeads);
    const { data: newCredits, error: deductError } = await supabase.rpc("deduct_credits", { _amount: leadCount });
    if (deductError) {
      setSearching(false);
      return toast.error(deductError.message || "Could not deduct credits");
    }
    setCredits(newCredits ?? 0);
    const { data: inserted } = await supabase.from("lead_searches").insert({
      user_id: user!.id,
      city: city.trim(),
      state: isUS ? stateValue || null : stateValue || null,
      country: COUNTRIES.find(c => c.code === country)?.name ?? country,
      lead_count: leadCount,
      leads: newLeads as unknown as never,
    }).select().single();
    if (inserted) {
      setCurrentSavedId(inserted.id);
      loadSaved();
    }
    setSearching(false);
    toast.success(`Found ${newLeads.length} leads — saved to history`);
  };

  const exportLeads = (leadsToExport: Lead[], cityName: string) => {
    if (!leadsToExport.length) return;
    downloadCsv(leadsToExport, `roofleadpro-${cityName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`);
    toast.success("CSV downloaded");
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
    if (s.state) setState(s.state);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const initial = (user.email ?? "U")[0].toUpperCase();
  const canSearch = !!city.trim() && !!country && leadCount > 0 && leadCount <= (credits ?? 0) && !searching;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm sm:flex">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium tabular-nums">{credits?.toLocaleString() ?? "…"}</span>
              <span className="text-muted-foreground">credits</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.info("Billing coming soon")} className="hidden sm:inline-flex">
              <ShoppingCart className="mr-2 h-4 w-4" /> Buy Credits
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">{initial}</AvatarFallback></Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">Signed in</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="sm:hidden">
                  <Coins className="mr-2 h-4 w-4" /> {credits?.toLocaleString() ?? 0} credits
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden" onClick={() => toast.info("Billing coming soon")}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Buy Credits
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-semibold sm:text-3xl">Find roofing leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">1 credit = 1 lead. Pick a location and how many you want.</p>
        </div>

        {/* Search */}
        <Card className="p-4 sm:p-6 shadow-[var(--shadow-elevated)] border-border/70" style={{ background: "var(--gradient-card)" }}>
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="city" placeholder="e.g. Austin" value={city} onChange={e => setCity(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{isUS ? "State" : "State / Region"}</Label>
                {isUS ? (
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value=" ">Any</SelectItem>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="state" placeholder="Optional" value={state} onChange={e => setState(e.target.value)} />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="lead-count" className="text-sm">Number of leads</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lead-count"
                    type="number"
                    min={1}
                    max={maxLeads}
                    value={leadCount}
                    onChange={e => handleLeadCountInput(e.target.value)}
                    className="h-9 w-24 text-right tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground">/ {maxLeads.toLocaleString()}</span>
                </div>
              </div>
              <Slider
                value={[Math.min(leadCount, maxLeads)]}
                min={1}
                max={Math.max(1, maxLeads)}
                step={1}
                onValueChange={v => setLeadCount(v[0])}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Costs <span className="font-medium text-foreground">{leadCount}</span> credits</span>
                <span>You have <span className="font-medium text-foreground">{credits?.toLocaleString() ?? "…"}</span></span>
              </div>
            </div>

            <Button type="submit" disabled={!canSearch} className="w-full sm:w-auto shadow-[var(--shadow-glow)]" size="lg">
              {searching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Search className="mr-2 h-4 w-4" /> Generate Leads</>}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Results {leads.length > 0 && <span className="text-muted-foreground font-normal">({leads.length})</span>}
            </h2>
            <Button variant="outline" size="sm" onClick={() => exportLeads(leads, city || "leads")} disabled={!leads.length}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <Card className="overflow-hidden border-border/70" style={{ background: "var(--gradient-card)" }}>
            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-4 font-medium">No leads yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Run a search above to generate leads.</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/60">
                        <TableHead>Business</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Reviews</TableHead>
                        <TableHead>Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((l, i) => (
                        <TableRow key={i} className="border-border/40">
                          <TableCell className="font-medium">{l.name}</TableCell>
                          <TableCell>
                            <a className="text-muted-foreground hover:text-foreground" href={`tel:${l.phone}`}>{l.phone}</a>
                          </TableCell>
                          <TableCell>
                            <a className="text-primary hover:underline" href={`https://${l.website}`} target="_blank" rel="noreferrer">{l.website}</a>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />{l.rating}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => setReviewLead(l)}
                              className="text-primary hover:underline tabular-nums"
                            >
                              {l.reviews}
                            </button>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{l.address}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border/40">
                  {leads.map((l, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{l.name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground truncate">{l.address}</div>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs tabular-nums">
                          <Star className="h-3 w-3 fill-current text-amber-400" />{l.rating}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <a className="text-muted-foreground" href={`tel:${l.phone}`}>{l.phone}</a>
                        <a className="text-primary truncate" href={`https://${l.website}`} target="_blank" rel="noreferrer">{l.website}</a>
                        <button onClick={() => setReviewLead(l)} className="text-primary">
                          {l.reviews} reviews
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Saved searches */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Saved searches</h2>
            <span className="text-sm text-muted-foreground">({saved.length})</span>
          </div>
          {saved.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground border-border/70" style={{ background: "var(--gradient-card)" }}>
              Your generated lead lists will appear here so you can come back and download them anytime.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map(s => (
                <Card key={s.id} className="p-4 border-border/70 transition hover:border-primary/40" style={{ background: "var(--gradient-card)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.city}{s.state ? `, ${s.state}` : ""}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.country}</div>
                    </div>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs tabular-nums shrink-0">{s.lead_count} leads</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => loadSavedLeads(s)}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => exportLeads(s.leads, s.city)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteSaved(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Reviews dialog */}
      <Dialog open={!!reviewLead} onOpenChange={o => !o && setReviewLead(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reviewLead?.name}</DialogTitle>
            <DialogDescription>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                <span className="text-foreground font-medium">{reviewLead?.rating}</span>
                <span>· {reviewLead?.reviews} reviews</span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {reviewLead?.reviewList.map((r, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{r.author}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`h-3 w-3 ${idx < r.rating ? "fill-current text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <div className="mt-2 text-xs text-muted-foreground/70">{r.date}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
