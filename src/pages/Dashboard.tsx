import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import { Coins, Download, Loader2, LogOut, Search, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Lead, sampleLeads, leadsToCsv } from "@/lib/sampleLeads";

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("TX");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setCredits(data?.credits ?? 0));
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return toast.error("Enter a city to search");
    if (!credits || credits < 10) return toast.error("Not enough credits. Buy more to continue.");
    setSearching(true);
    // Simulate API call - this is where the real lead-gen API will plug in later
    await new Promise(r => setTimeout(r, 900));
    setLeads(sampleLeads);
    const newCredits = credits - 10;
    setCredits(newCredits);
    await supabase.from("user_credits").update({ credits: newCredits, updated_at: new Date().toISOString() }).eq("user_id", user!.id);
    setSearching(false);
    toast.success(`Found ${sampleLeads.length} leads in ${city}, ${state}`);
  };

  const handleExport = () => {
    if (!leads.length) return;
    const csv = leadsToCsv(leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roofleadpro-${city.toLowerCase()}-${state.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const initial = (user.email ?? "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-sm sm:flex">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{credits?.toLocaleString() ?? "…"}</span>
              <span className="text-muted-foreground">credits</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.info("Billing coming soon")}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Buy Credits
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-sm">{initial}</AvatarFallback></Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">Signed in as</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="sm:hidden">
                  <Coins className="mr-2 h-4 w-4" /> {credits?.toLocaleString() ?? 0} credits
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Find roofing leads</h1>
          <p className="text-sm text-muted-foreground">Each search costs 10 credits and returns up to 100 verified leads.</p>
        </div>

        <Card className="p-5 shadow-[var(--shadow-soft)]">
          <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="City (e.g. Austin)" value={city} onChange={e => setCity(e.target.value)} className="pl-9" />
            </div>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={searching}>
              {searching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching</> : "Generate Leads"}
            </Button>
          </form>
        </Card>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Results {leads.length > 0 && <span className="text-muted-foreground">({leads.length})</span>}
            </h2>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!leads.length}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>

          <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-4 font-medium">No leads yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Run a search above to generate roofing leads.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell>{l.phone}</TableCell>
                        <TableCell><a className="text-primary hover:underline" href={`https://${l.website}`} target="_blank" rel="noreferrer">{l.website}</a></TableCell>
                        <TableCell><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-amber-500" />{l.rating}</span></TableCell>
                        <TableCell>{l.reviews}</TableCell>
                        <TableCell className="text-muted-foreground">{l.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
