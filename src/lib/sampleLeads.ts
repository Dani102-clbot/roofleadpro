export type Lead = {
  name: string;
  phone: string;
  website: string;
  rating: number;
  reviews: number;
  address: string;
};

export const sampleLeads: Lead[] = [
  { name: "Summit Roofing Co.", phone: "(512) 555-0142", website: "summitroofingtx.com", rating: 4.9, reviews: 312, address: "2210 S Lamar Blvd, Austin, TX" },
  { name: "Lone Star Roof Pros", phone: "(512) 555-0188", website: "lonestarroofpros.com", rating: 4.8, reviews: 241, address: "1100 E 6th St, Austin, TX" },
  { name: "BlueSky Roofing", phone: "(512) 555-0167", website: "blueskyroofing.io", rating: 4.7, reviews: 198, address: "604 W 34th St, Austin, TX" },
  { name: "Capital City Roofers", phone: "(512) 555-0119", website: "capcityroofers.com", rating: 4.6, reviews: 174, address: "5500 N Lamar Blvd, Austin, TX" },
  { name: "Apex Roof Solutions", phone: "(512) 555-0173", website: "apexroofsolutions.com", rating: 4.8, reviews: 156, address: "9100 Burnet Rd, Austin, TX" },
  { name: "Hill Country Roofing", phone: "(512) 555-0124", website: "hillcountryroofs.com", rating: 4.5, reviews: 132, address: "3500 Jefferson St, Austin, TX" },
  { name: "Texas Premier Roofing", phone: "(512) 555-0191", website: "txpremierroofing.com", rating: 4.9, reviews: 287, address: "1801 S Congress Ave, Austin, TX" },
  { name: "Allstar Roof Repair", phone: "(512) 555-0136", website: "allstarroofrepair.com", rating: 4.4, reviews: 98, address: "401 E Cesar Chavez, Austin, TX" },
  { name: "Eagle Eye Roofing", phone: "(512) 555-0152", website: "eagleeyeroofing.com", rating: 4.7, reviews: 211, address: "2525 W Anderson Ln, Austin, TX" },
  { name: "Reliant Roof & Solar", phone: "(512) 555-0148", website: "reliantroofsolar.com", rating: 4.8, reviews: 263, address: "11410 Century Oaks Terr, Austin, TX" },
];

export function leadsToCsv(leads: Lead[]): string {
  const header = ["Business Name", "Phone", "Website", "Rating", "Reviews", "Address"];
  const rows = leads.map(l => [l.name, l.phone, l.website, l.rating, l.reviews, l.address]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [header.join(","), ...rows].join("\n");
}
