export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
};

export type LeadTag = "verified" | "website" | "licensed" | "insured";

export type Lead = {
  name: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviews: number;
  address: string;
  tags: LeadTag[];
  reviewList: Review[];
};

const NAMES = [
  "Summit", "Lone Star", "BlueSky", "Capital City", "Apex", "Hill Country",
  "Premier", "Allstar", "Eagle Eye", "Reliant", "Ironclad", "Northstar",
  "Vanguard", "Cornerstone", "Heritage", "Liberty", "Pinnacle", "Patriot",
  "Skyline", "Horizon", "Anchor", "Crown", "Sterling", "Granite",
  "Storm Proof", "Texas Shield", "Gulf Coast", "Pennine", "Atlas", "SkyReach",
];
const SUFFIX = ["Roofing Co.", "Roof Pros", "Roofers", "Roof Solutions", "Roof & Gutters", "Roof Repair", "Roofing Ltd."];
const STREETS = ["Lamar Blvd", "Main St", "Oak Ave", "Westheimer Rd", "Highland Dr", "Maple Rd", "Cedar Ln", "Richmond Ave", "Katy Fwy", "Industrial Pkwy"];

const REVIEWS_POSITIVE = [
  { author: "James O.", text: "Incredible service. Fixed a major leak in under 4 hours. Clean work, fair price, professional crew." },
  { author: "Sarah M.", text: "Called Monday, full roof replacement done by Wednesday. Punctual, tidy, exactly as quoted." },
  { author: "David K.", text: "Best roofers I've used in 20 years. Spotted two issues my previous contractor missed." },
  { author: "Amaka T.", text: "Responsive, honest, and very skilled. Most transparent quote of three. Roof looks brand new." },
  { author: "Linda B.", text: "Replaced gutters and re-shingled the back section. Flawless. Site was cleaner when they left." },
  { author: "Michael R.", text: "Great work overall. Small weather delay on day two but they communicated well." },
];
const REVIEWS_NEUTRAL = [
  { author: "Chris A.", text: "Work was solid but scheduling was a hassle — took three calls to confirm the date." },
  { author: "Rachel N.", text: "Average experience. They did what was asked, nothing more. Price was competitive." },
  { author: "Tony F.", text: "Good job on the repair. Took a little longer than estimated but result is solid." },
];
const REVIEWS_NEGATIVE = [
  { author: "Sandra W.", text: "They left debris in the yard for three days. Had to call twice to get them to clean up." },
  { author: "Greg P.", text: "No-showed on first appointment with no notice. Work was average at best." },
];

function seededRandom(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function genReviews(rand: () => number, reviewCount: number, businessRating: number): Review[] {
  const total = Math.min(reviewCount > 100 ? 6 : reviewCount > 50 ? 5 : 4, 6);
  const posCount = businessRating >= 4.5 ? total - 1 : businessRating >= 4.0 ? total - 2 : total - 3;
  const neuCount = businessRating >= 4.0 ? 1 : 2;
  const negCount = total - posCount - neuCount;
  const pick = <T,>(arr: T[], n: number) => [...arr].sort(() => rand() - 0.5).slice(0, Math.max(0, n));
  const ages = ["1 week ago", "2 weeks ago", "1 month ago", "6 weeks ago", "2 months ago", "3 months ago"];
  const reviews: Review[] = [];
  pick(REVIEWS_POSITIVE, posCount).forEach(r => reviews.push({ ...r, rating: rand() > 0.5 ? 5 : 4, date: ages[Math.floor(rand() * ages.length)], sentiment: "positive" }));
  pick(REVIEWS_NEUTRAL, neuCount).forEach(r => reviews.push({ ...r, rating: 3, date: ages[Math.floor(rand() * ages.length)], sentiment: "neutral" }));
  pick(REVIEWS_NEGATIVE, negCount).forEach(r => reviews.push({ ...r, rating: rand() > 0.5 ? 2 : 1, date: ages[Math.floor(rand() * ages.length)], sentiment: "negative" }));
  return reviews.slice(0, total);
}

export function generateLeads(count: number, city: string, state: string, country: string, seed = Date.now()): Lead[] {
  const rand = seededRandom(seed);
  const leads: Lead[] = [];
  const locale = [city, state, country].filter(Boolean).join(", ");
  for (let i = 0; i < count; i++) {
    const name = `${NAMES[Math.floor(rand() * NAMES.length)]} ${SUFFIX[Math.floor(rand() * SUFFIX.length)]}`;
    const rating = Math.round((3.8 + rand() * 1.2) * 10) / 10;
    const reviews = 20 + Math.floor(rand() * 380);
    const phone = `+1 (${200 + Math.floor(rand() * 700)}) ${100 + Math.floor(rand() * 899)}-${1000 + Math.floor(rand() * 8999)}`;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, "");
    const hasWebsite = rand() > 0.25;
    const hasEmail = rand() > 0.3;
    const website = hasWebsite ? `${slug}.com` : "";
    const email = hasEmail ? `info@${slug}.com` : "";
    const num = 100 + Math.floor(rand() * 9900);
    const street = STREETS[Math.floor(rand() * STREETS.length)];
    const tags: LeadTag[] = [];
    if (rand() > 0.35) tags.push("verified");
    if (hasWebsite) tags.push("website");
    if (rand() > 0.5) tags.push("licensed");
    if (rand() > 0.6) tags.push("insured");
    leads.push({
      name, phone, email, website, rating, reviews,
      address: `${num} ${street}, ${locale}`,
      tags,
      reviewList: genReviews(rand, reviews, rating),
    });
  }
  return leads;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = ["Business Name", "Phone", "Email", "Website", "Rating", "Reviews", "Address", "Tags"];
  const rows = leads.map(l => [l.name, l.phone, l.email, l.website, l.rating, l.reviews, l.address, l.tags.join("|")]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [header.join(","), ...rows].join("\n");
}

export function downloadCsv(leads: Lead[], filename: string) {
  const csv = leadsToCsv(leads);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
