export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Lead = {
  name: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  address: string;
  reviewList: Review[];
};

const NAMES = [
  "Summit", "Lone Star", "BlueSky", "Capital City", "Apex", "Hill Country",
  "Premier", "Allstar", "Eagle Eye", "Reliant", "Ironclad", "Northstar",
  "Vanguard", "Cornerstone", "Heritage", "Liberty", "Pinnacle", "Patriot",
  "Skyline", "Horizon", "Anchor", "Crown", "Sterling", "Granite",
];
const SUFFIX = ["Roofing", "Roof Co.", "Roof Pros", "Roofers", "Roof Solutions", "Roof & Solar", "Roof Repair"];
const STREETS = ["Lamar Blvd", "Main St", "Oak Ave", "Elm St", "Highland Dr", "Maple Rd", "Cedar Ln", "Park Ave", "Sunset Blvd", "Industrial Pkwy"];
const REVIEW_AUTHORS = ["Mike R.", "Sarah K.", "James L.", "Maria G.", "David T.", "Linda P.", "Chris M.", "Amanda B.", "Robert F.", "Jennifer W.", "Tom H.", "Rachel D."];
const REVIEW_TEXTS = [
  "Fast, professional service. They replaced my roof in 2 days and cleaned up perfectly.",
  "Honest pricing and great workmanship. Highly recommend for any roofing needs.",
  "The crew was punctual, polite, and the new roof looks fantastic. Worth every penny.",
  "Had a leak emergency — they came out same day and patched it for a fair price.",
  "Quality materials and excellent communication throughout the entire project.",
  "Best roofing company we've worked with. They handled insurance paperwork too.",
  "A bit pricier than competitors but the quality is unmatched. No regrets.",
  "Great experience from quote to completion. Will definitely use them again.",
  "Professional team, finished ahead of schedule. The roof looks amazing.",
  "Solid workmanship and a 10-year warranty. What more could you ask for?",
  "Took a little longer than promised, but the result is top-notch.",
  "Friendly crew, respected our property, and the cleanup was spotless.",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function genReviews(rand: () => number, count: number, businessRating: number): Review[] {
  const n = Math.min(count, 8 + Math.floor(rand() * 6));
  const reviews: Review[] = [];
  for (let i = 0; i < n; i++) {
    const rating = Math.max(3, Math.min(5, Math.round(businessRating + (rand() - 0.5) * 1.5)));
    const daysAgo = Math.floor(rand() * 365);
    const date = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    reviews.push({
      author: REVIEW_AUTHORS[Math.floor(rand() * REVIEW_AUTHORS.length)],
      rating,
      text: REVIEW_TEXTS[Math.floor(rand() * REVIEW_TEXTS.length)],
      date,
    });
  }
  return reviews;
}

export function generateLeads(count: number, city: string, state: string, country: string, seed = Date.now()): Lead[] {
  const rand = seededRandom(seed);
  const leads: Lead[] = [];
  const locale = [city, state, country].filter(Boolean).join(", ");
  for (let i = 0; i < count; i++) {
    const name = `${NAMES[Math.floor(rand() * NAMES.length)]} ${SUFFIX[Math.floor(rand() * SUFFIX.length)]}`;
    const rating = Math.round((3.8 + rand() * 1.2) * 10) / 10;
    const reviews = 20 + Math.floor(rand() * 380);
    const phone = `(${200 + Math.floor(rand() * 700)}) ${100 + Math.floor(rand() * 899)}-${1000 + Math.floor(rand() * 8999)}`;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, "");
    const website = `${slug}.com`;
    const num = 100 + Math.floor(rand() * 9900);
    const street = STREETS[Math.floor(rand() * STREETS.length)];
    leads.push({
      name,
      phone,
      website,
      rating,
      reviews,
      address: `${num} ${street}, ${locale}`,
      reviewList: genReviews(rand, reviews, rating),
    });
  }
  return leads;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = ["Business Name", "Phone", "Website", "Rating", "Reviews", "Address"];
  const rows = leads.map(l => [l.name, l.phone, l.website, l.rating, l.reviews, l.address]
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
