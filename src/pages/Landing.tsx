import { Link } from "react-router-dom";
import { ArrowRight, Search, Mail, Phone, Globe, Star, MapPin, Download, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const demoItems = [
  { city: "Houston, TX", name: "Texas Shield Roofing", phone: "+1 (713) 482-9310", rating: "4.8" },
  { city: "Manchester, UK", name: "Northern Slate & Tile", phone: "+44 161 834 2200", rating: "4.9" },
  { city: "Lagos, Nigeria", name: "Prime Build Roofing", phone: "+234 901 332 8821", rating: "4.6" },
  { city: "Toronto, CA", name: "Maple Leaf Roofing Co.", phone: "+1 (416) 901-2200", rating: "4.7" },
  { city: "Sydney, AU", name: "Harbour City Roofers", phone: "+61 2 9012 3344", rating: "4.8" },
  { city: "Dubai, UAE", name: "Desert Sun Roofing", phone: "+971 4 312 8890", rating: "4.5" },
  { city: "Cape Town, ZA", name: "Cape Peak Roofing", phone: "+27 21 556 7890", rating: "4.6" },
  { city: "Berlin, DE", name: "Berliner Dach GmbH", phone: "+49 30 9012 3456", rating: "4.7" },
];

const features = [
  { Icon: Phone,  title: "Phone numbers",     desc: "Direct business lines pulled from Google Maps listings. Call-ready immediately." },
  { Icon: Mail,   title: "Email addresses",    desc: "Business emails enriched from websites and listings. No more guessing." },
  { Icon: Globe,  title: "Website links",      desc: "Know who has a web presence and who doesn't. Prioritise outreach accordingly." },
  { Icon: Star,   title: "Ratings & reviews",  desc: "Star ratings, review counts, and real customer review text in one click." },
  { Icon: MapPin, title: "Full address",       desc: "Physical location data for every business. Map it, route it, verify coverage." },
  { Icon: Download, title: "CSV export",       desc: "One click. All your leads in a clean spreadsheet, ready for your CRM or dialer." },
];

const sampleRows = [
  { name: "Texas Shield Roofing Co.", loc: "Houston, TX",     phone: "+1 (713) 482-9310", email: "info@texasshield.com",      rating: "4.8", reviews: 214 },
  { name: "Northern Slate & Tile Ltd.", loc: "Manchester, UK", phone: "+44 161 834 2200", email: "info@northernslate.co.uk", rating: "4.9", reviews: 312 },
  { name: "Prime Build Roofing Ltd.", loc: "Lagos, Nigeria",   phone: "+234 901 332 8821", email: "info@primebuild.ng",       rating: "4.6", reviews: 47 },
  { name: "Storm Proof Roofing LLC",  loc: "Houston, TX",     phone: "+1 (281) 340-7712", email: "contact@stormproof.com",   rating: "4.7", reviews: 156 },
];

const who = [
  { emoji: "📞", title: "SDRs & cold callers",  desc: "Build targeted call lists for any city in minutes." },
  { emoji: "📣", title: "Marketing agencies",   desc: "Find roofing clients to pitch SEO, ads, or social media." },
  { emoji: "🏗️", title: "B2B suppliers",         desc: "Sell materials or software? Here's your full TAM by city." },
  { emoji: "🤝", title: "Partnership teams",    desc: "Find subcontractors, referral partners, acquisition targets." },
];

const plans = [
  { name: "Starter", price: 19, desc: "For occasional prospecting", credits: "250 leads / mo",
    features: ["All 8 data fields", "CSV export", "12+ countries"], no: ["Review scraping", "API access"] },
  { name: "Pro", price: 49, desc: "For active sales teams", credits: "1,000 leads / mo", featured: true,
    features: ["All 8 data fields", "CSV export", "12+ countries", "Review scraping included"], no: ["API access"] },
  { name: "Agency", price: 99, desc: "For agencies & power users", credits: "5,000 leads / mo",
    features: ["All 8 data fields", "CSV export", "12+ countries", "Review scraping included", "API access"], no: [] },
];

const testimonials = [
  { text: "Pulled 100 roofing leads in Houston in under a minute. Called 20, booked 4 meetings. Pays for itself on day one.", author: "Marcus T.", role: "SDR · Roofing software" },
  { text: "I run an agency targeting roofers. Used to spend hours on lead lists — now I build them in 30 seconds.", author: "Priya N.", role: "Founder · Local agency" },
  { text: "The reviews feature is a game changer. I see which roofers are struggling and pitch reputation management.", author: "James O.", role: "Consultant · Home services" },
];

export default function Landing() {
  const marquee = [...demoItems, ...demoItems];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 -z-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-[720px] px-5 pt-20 pb-16 text-center md:pt-24">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Live data · 12+ countries</span>
          </div>
          <h1 className="text-[clamp(36px,7vw,68px)] font-extrabold leading-[1.0] tracking-[-0.04em]">
            The fastest way to find<br /><span className="text-primary">roofing leads</span> anywhere.
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[clamp(15px,2vw,18px)] leading-relaxed text-muted-foreground">
            Search any city, get verified roofing businesses with phone numbers, emails, websites, ratings, and real customer reviews — exported in seconds.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-[15px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98]"
              style={{ letterSpacing: "0.04em" }}
            >
              <Search className="h-4 w-4" /> Start finding leads
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-border bg-transparent px-7 py-[15px] text-[15px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary"
              style={{ letterSpacing: "0.04em" }}
            >
              See how it works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-5 font-mono text-xs text-muted-foreground">
            {["No credit card to try", "Export to CSV instantly", "12+ countries supported"].map(t => (
              <div key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" />{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO MARQUEE */}
      <div className="border-y border-border bg-card py-5 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {marquee.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 whitespace-nowrap border-r border-border px-7 font-mono text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <b className="text-foreground">{item.name}</b>
              <span>{item.city} · {item.phone} · ★{item.rating}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="py-14">
        <div className="mx-auto grid max-w-[800px] grid-cols-2 gap-[2px] px-5 md:grid-cols-4">
          {[
            { n: "50K+", l: "Roofing businesses indexed" },
            { n: "12+",  l: "Countries supported" },
            { n: "8",    l: "Data fields per lead" },
            { n: "<30s", l: "Average search time" },
          ].map(s => (
            <div key={s.l} className="rounded border border-border bg-card p-6 text-center">
              <div className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-[-0.04em] text-primary">{s.n}</div>
              <div className="mt-1.5 font-mono text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-[1000px] px-5 py-14">
        <span className="label-eyebrow">What you get</span>
        <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.1] tracking-[-0.03em]">Every detail.<br />Ready to close.</h2>
        <p className="mt-3 max-w-[480px] text-sm leading-relaxed text-muted-foreground">Stop manually hunting for roofing businesses. Get everything in one search.</p>
        <div className="mt-10 grid gap-[2px] sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="rounded border border-border bg-card p-6 transition-colors hover:border-primary/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                <f.Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="mt-3.5 text-[15px] font-bold tracking-[-0.01em]">{f.title}</div>
              <div className="mt-1.5 font-mono text-[13px] leading-relaxed text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DATA PREVIEW */}
      <section className="border-y border-border bg-card py-14">
        <div className="mx-auto max-w-[1000px] px-5">
          <span className="label-eyebrow">Sample data</span>
          <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em]">Exactly what you'll get.</h2>
          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[640px] overflow-hidden rounded-md border border-border font-mono text-xs">
              <thead className="surface-2">
                <tr className="text-left">
                  {["Business", "Phone", "Email", "Rating", "Status"].map(h => (
                    <th key={h} className="border-b border-border px-3.5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((r, i) => (
                  <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                    <td className="border-b border-border/60 px-3.5 py-3">
                      <div className="font-sans text-[13px] font-bold text-foreground">{r.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{r.loc}</div>
                    </td>
                    <td className="border-b border-border/60 px-3.5 py-3">{r.phone}</td>
                    <td className="border-b border-border/60 px-3.5 py-3">{r.email}</td>
                    <td className="border-b border-border/60 px-3.5 py-3">
                      <div className="flex items-center gap-1 text-[#f0c040]"><Star className="h-3 w-3 fill-current" />{r.rating}</div>
                      <div className="text-[10px] text-muted-foreground">{r.reviews} reviews</div>
                    </td>
                    <td className="border-b border-border/60 px-3.5 py-3">
                      <span className="rounded-sm border border-success/30 bg-success/[0.06] px-[7px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-success">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-[1000px] px-5 py-14">
        <span className="label-eyebrow">How it works</span>
        <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.1] tracking-[-0.03em]">Three steps.<br />Dozens of leads.</h2>
        <div className="mt-9 flex max-w-[600px] flex-col gap-[2px]">
          {[
            { n: "1", t: "Enter a city & country", d: "Type any city in the world. Select the country. We support 12+ countries and growing." },
            { n: "2", t: "Choose how many leads",  d: "Pick 10, 25, 50, 100 or enter a custom number. We pull exactly that many." },
            { n: "3", t: "Export & close",         d: "Download CSV. Drop into your CRM or cold email tool. Start calling." },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-5 rounded border border-border bg-card p-5">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary bg-primary/10 text-[13px] font-extrabold text-primary">{s.n}</div>
              <div>
                <div className="text-[15px] font-bold tracking-[-0.01em]">{s.t}</div>
                <div className="mt-1 font-mono text-[13px] leading-relaxed text-muted-foreground">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHO */}
      <section className="border-y border-border bg-card py-14">
        <div className="mx-auto max-w-[1000px] px-5">
          <span className="label-eyebrow">Who it's for</span>
          <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.1] tracking-[-0.03em]">Built for people<br />who sell to roofers.</h2>
          <div className="mt-8 grid gap-[2px] sm:grid-cols-2 lg:grid-cols-4">
            {who.map(w => (
              <div key={w.title} className="rounded border border-border bg-background p-5">
                <div className="text-2xl">{w.emoji}</div>
                <div className="mt-2.5 text-sm font-bold">{w.title}</div>
                <div className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-[1000px] px-5 py-14 text-center">
        <span className="label-eyebrow">Pricing</span>
        <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em]">Simple. Transparent. Fair.</h2>
        <p className="mx-auto mt-2 max-w-[440px] text-sm leading-relaxed text-muted-foreground">Pay for what you use. No hidden fees. Credits never expire.</p>
        <div className="mx-auto mt-10 grid max-w-[800px] gap-[2px] text-left md:grid-cols-3">
          {plans.map(p => (
            <div key={p.name} className={`relative rounded border bg-card p-7 ${p.featured ? "border-primary" : "border-border"}`} style={p.featured ? { background: "#161614" } : undefined}>
              {p.featured && (
                <span className="absolute -top-px left-6 rounded-b bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-foreground">Most popular</span>
              )}
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{p.name}</div>
              <div className="mt-2.5 text-[clamp(28px,5vw,38px)] font-extrabold tracking-[-0.04em]">
                ${p.price}<span className="text-[15px] font-normal text-muted-foreground">/mo</span>
              </div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">{p.desc}</div>
              <div className="my-4 h-px bg-border" />
              <ul className="flex flex-col gap-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 font-mono text-[13px] text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-success" />{f}
                  </li>
                ))}
                {p.no.map(f => (
                  <li key={f} className="flex items-start gap-2 font-mono text-[13px] text-muted-foreground/50 line-through">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 opacity-40" />{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-6 block rounded border-[1.5px] py-3 text-center text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  p.featured
                    ? "border-primary bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                    : "border-border surface-2 text-foreground hover:border-primary hover:text-primary"
                }`}
                style={{ letterSpacing: "0.04em" }}
              >
                Get {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border bg-card py-14">
        <div className="mx-auto max-w-[1000px] px-5">
          <span className="label-eyebrow">What users say</span>
          <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-0.03em]">Real results.</h2>
          <div className="mt-9 grid gap-[2px] md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded border border-border border-l-2 border-l-primary bg-background p-5">
                <div className="text-sm tracking-[2px] text-[#f0c040]">★★★★★</div>
                <div className="mt-3 font-mono text-[13px] leading-relaxed text-muted-foreground">{t.text}</div>
                <div className="mt-4 text-[13px] font-bold">{t.author}</div>
                <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-20 text-center">
        <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold leading-[1.1] tracking-[-0.03em]">
          Start finding roofing leads<br /><span className="text-primary">in any city, right now.</span>
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">No credit card required. Get your first leads in under 30 seconds.</p>
        <Link
          to="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-10 py-4 text-base font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-[hsl(var(--primary-hover))] active:scale-[0.98]"
          style={{ letterSpacing: "0.04em" }}
        >
          <Search className="h-4 w-4" /> Get started free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
