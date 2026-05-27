import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Search, FileSpreadsheet, Zap, Infinity as InfinityIcon, Workflow, Building2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const features = [
  { icon: Building2, title: "Roofing-focused", desc: "Purpose-built for roofing lead generation — no irrelevant noise." },
  { icon: FileSpreadsheet, title: "CSV exports", desc: "One click to export clean, importable CSV files for your CRM." },
  { icon: Zap, title: "Fast search results", desc: "Get hundreds of verified business leads in under a minute." },
  { icon: InfinityIcon, title: "Permanent credits", desc: "Buy once, use forever. Your credits never expire." },
  { icon: Workflow, title: "Simple workflow", desc: "Search, generate, export. Three steps from city to closed deal." },
];

const plans = [
  { name: "Starter", price: 29, credits: "2,000" },
  { name: "Growth", price: 49, credits: "5,000", featured: true },
  { name: "Agency", price: 99, credits: "15,000" },
];

const faqs = [
  { q: "Do credits really never expire?", a: "Yes. Once you purchase credits, they're yours forever — no rolling resets, no monthly burn." },
  { q: "How accurate are the leads?", a: "All data is pulled from live Google Maps business listings, so accuracy matches what's publicly visible." },
  { q: "Can I export to my CRM?", a: "Yes. Every export is a clean CSV that imports into HubSpot, Pipedrive, Close, GoHighLevel and more." },
  { q: "Is there a free trial?", a: "Yes — sign up and get free credits to test the platform before purchasing." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> New: 50 free leads on signup
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Find Roofing Leads in <span className="text-primary">60 Seconds</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Search roofing businesses anywhere in the U.S. and export verified local business leads instantly. Credits never expire.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="shadow-[var(--shadow-glow)]">
                <Link to="/signup">Start Free <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Everything you need. Nothing you don't.</h2>
            <p className="mt-4 text-muted-foreground">A focused tool built for one job — finding roofing leads that close.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <Card key={f.title} className="p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60 bg-secondary/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">From zero to a list of leads in three steps.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              { n: "01", icon: Search, t: "Search by city or state", d: "Type any U.S. city or state — Austin, Florida, ZIP codes all work." },
              { n: "02", icon: Workflow, t: "Generate roofing leads", d: "We scan Google Maps and pull verified roofing businesses in seconds." },
              { n: "03", icon: FileSpreadsheet, t: "Export CSV instantly", d: "Download a clean CSV ready for your CRM, cold email, or dialer." },
            ].map(s => (
              <Card key={s.n} className="p-6">
                <div className="text-xs font-semibold text-primary">{s.n}</div>
                <s.icon className="mt-3 h-6 w-6 text-foreground" />
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/60 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Simple, one-time pricing</h2>
            <p className="mt-4 text-muted-foreground">Buy credits once. Use them forever.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {plans.map(p => (
              <Card key={p.name} className={`relative p-8 ${p.featured ? "border-primary shadow-[var(--shadow-elevated)]" : ""}`}>
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold">${p.price}</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.credits} credits</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["Roofing-focused leads", "CSV exports", "Credits never expire"].map(b => (
                    <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{b}</li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant={p.featured ? "default" : "outline"} asChild>
                  <Link to="/signup">Get {p.name}</Link>
                </Button>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <InfinityIcon className="mr-1 inline h-4 w-4 align-text-bottom text-primary" /> Credits never expire
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-secondary/30 py-20">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
