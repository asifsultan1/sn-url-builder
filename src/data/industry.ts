import type { EnumOption } from "./enums";

/**
 * LinkedIn Industry Codes V2 (post-2022 taxonomy). The full set is ~434 entries;
 * this covers the most commonly targeted categories. Any industry not listed here
 * can still be added by pasting a LinkedIn search URL (which pulls the id
 * automatically) or by entering the numeric id directly.
 */
export const INDUSTRIES: EnumOption[] = [
  // Technology
  { id: "4",    label: "Software Development" },
  { id: "6",    label: "Technology, Information and Internet" },
  { id: "96",   label: "IT Services and IT Consulting" },
  { id: "3",    label: "Computer Hardware Manufacturing" },
  { id: "84",   label: "Information Services" },
  { id: "5",    label: "Computer and Network Security" },
  { id: "7",    label: "Computer Networking Products" },
  { id: "8",    label: "Semiconductor Manufacturing" },
  { id: "2",    label: "Defense and Space Manufacturing" },
  { id: "1",    label: "IT System Testing and Evaluation" },

  // Financial Services
  { id: "43",   label: "Financial Services" },
  { id: "44",   label: "Banking" },
  { id: "42",   label: "Insurance" },
  { id: "45",   label: "Investment Management" },
  { id: "46",   label: "Venture Capital and Private Equity" },
  { id: "66",   label: "Capital Markets" },
  { id: "64",   label: "Accounting" },
  { id: "11",   label: "Accounting" },

  // Healthcare & Life Sciences
  { id: "14",   label: "Hospitals and Health Care" },
  { id: "100",  label: "Pharmaceutical Manufacturing" },
  { id: "101",  label: "Biotechnology Research" },
  { id: "13",   label: "Medical Practices" },
  { id: "16",   label: "Medical Equipment Manufacturing" },
  { id: "15",   label: "Mental Health Care" },
  { id: "139",  label: "Wellness and Fitness Services" },

  // Retail & Consumer
  { id: "27",   label: "Retail" },
  { id: "19",   label: "Retail Apparel and Fashion" },
  { id: "22",   label: "Retail Groceries" },
  { id: "143",  label: "Retail Luxury Goods and Jewelry" },
  { id: "3250", label: "Retail Pharmacies" },
  { id: "1309", label: "Retail Furniture and Home Furnishings" },
  { id: "1292", label: "Retail Motor Vehicles" },
  { id: "138",  label: "Retail Office Equipment" },
  { id: "111",  label: "Retail Art Supplies" },
  { id: "3186", label: "Retail Art Dealers" },
  { id: "32",   label: "Wholesale" },
  { id: "26",   label: "Consumer Goods" },

  // Marketing, Media & Advertising
  { id: "80",   label: "Advertising Services" },
  { id: "17",   label: "Marketing Services" },
  { id: "25",   label: "Public Relations and Communications Services" },
  { id: "18",   label: "Media Production" },
  { id: "21",   label: "Broadcast Media Production and Distribution" },
  { id: "20",   label: "Book and Periodical Publishing" },
  { id: "55",   label: "Online Audio and Video Media" },
  { id: "28",   label: "Entertainment Providers" },
  { id: "54",   label: "Movies, Videos and Sound" },

  // Professional Services
  { id: "1862", label: "Business Consulting and Services" },
  { id: "56",   label: "Legal Services" },
  { id: "1810", label: "Government Administration" },
  { id: "75",   label: "Think Tanks" },
  { id: "76",   label: "Non-profit Organizations" },
  { id: "94",   label: "Staffing and Recruiting" },
  { id: "90",   label: "Human Resources Services" },
  { id: "148",  label: "Research Services" },

  // Real Estate & Construction
  { id: "59",   label: "Real Estate" },
  { id: "53",   label: "Construction" },
  { id: "60",   label: "Architecture and Planning" },
  { id: "50",   label: "Civil Engineering" },
  { id: "52",   label: "Building Materials" },
  { id: "58",   label: "Facilities Services" },

  // Manufacturing & Industrial
  { id: "47",   label: "Manufacturing" },
  { id: "48",   label: "Motor Vehicle Manufacturing" },
  { id: "49",   label: "Automation Machinery Manufacturing" },
  { id: "112",  label: "Chemical Manufacturing" },
  { id: "113",  label: "Plastics Manufacturing" },
  { id: "114",  label: "Rubber Products Manufacturing" },
  { id: "115",  label: "Glass, Ceramics and Concrete Manufacturing" },
  { id: "116",  label: "Textile Manufacturing" },
  { id: "117",  label: "Apparel Manufacturing" },
  { id: "118",  label: "Leather Product Manufacturing" },

  // Energy & Resources
  { id: "57",   label: "Oil and Gas" },
  { id: "61",   label: "Mining" },
  { id: "62",   label: "Coal Mining" },
  { id: "63",   label: "Utilities" },
  { id: "98",   label: "Renewable Energy Semiconductor Manufacturing" },
  { id: "197",  label: "Electric Power Generation" },

  // Logistics & Transportation
  { id: "144",  label: "Logistics and Supply Chain" },
  { id: "1757", label: "Transportation, Logistics, Supply Chain and Storage" },
  { id: "85",   label: "Truck Transportation" },
  { id: "86",   label: "Rail Transportation" },
  { id: "87",   label: "Maritime Transportation" },
  { id: "88",   label: "Airlines and Aviation" },
  { id: "89",   label: "Warehousing and Storage" },

  // Food, Hospitality & Travel
  { id: "34",   label: "Food and Beverage Services" },
  { id: "35",   label: "Food and Beverage Manufacturing" },
  { id: "31",   label: "Restaurants" },
  { id: "30",   label: "Hospitality" },
  { id: "29",   label: "Travel Arrangements" },
  { id: "33",   label: "Sporting Goods Manufacturing" },

  // Education
  { id: "68",   label: "Higher Education" },
  { id: "67",   label: "Education Administration Programs" },
  { id: "69",   label: "Primary and Secondary Education" },
  { id: "70",   label: "E-Learning Providers" },
  { id: "71",   label: "Professional Training and Coaching" },

  // Telecommunications
  { id: "23",   label: "Telecommunications" },
  { id: "24",   label: "Wireless Services" },
];

// Dedupe by id — keep first occurrence.
const seen = new Set<string>();
export const INDUSTRY: EnumOption[] = INDUSTRIES.filter((i) => {
  if (seen.has(i.id)) return false;
  seen.add(i.id);
  return true;
});
