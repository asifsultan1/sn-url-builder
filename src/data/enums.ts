export interface EnumOption {
  id: string;
  label: string;
}

/** COMPANY_HEADCOUNT — ids identical across people/company; labels differ. */
export const HEADCOUNT_PEOPLE: EnumOption[] = [
  { id: "A", label: "Self-employed" },
  { id: "B", label: "1-10" },
  { id: "C", label: "11-50" },
  { id: "D", label: "51-200" },
  { id: "E", label: "201-500" },
  { id: "F", label: "501-1000" },
  { id: "G", label: "1001-5000" },
  { id: "H", label: "5001-10,000" },
  { id: "I", label: "10,000+" },
];

export const HEADCOUNT_COMPANY: EnumOption[] = [
  { id: "A", label: "Self-employed" },
  { id: "B", label: "1-10" },
  { id: "C", label: "11-50" },
  { id: "D", label: "51-200" },
  { id: "E", label: "201-500" },
  { id: "F", label: "501-1,000" },
  { id: "G", label: "1,001-5,000" },
  { id: "H", label: "5,001-10,000" },
  { id: "I", label: "10,001+" },
];

export const FUNCTION: EnumOption[] = [
  { id: "1", label: "Accounting" },
  { id: "2", label: "Administrative" },
  { id: "3", label: "Arts and Design" },
  { id: "4", label: "Business Development" },
  { id: "5", label: "Community and Social Services" },
  { id: "6", label: "Consulting" },
  { id: "7", label: "Education" },
  { id: "8", label: "Engineering" },
  { id: "9", label: "Entrepreneurship" },
  { id: "10", label: "Finance" },
  { id: "11", label: "Healthcare Services" },
  { id: "12", label: "Human Resources" },
  { id: "13", label: "Information Technology" },
  { id: "14", label: "Legal" },
  { id: "15", label: "Marketing" },
  { id: "16", label: "Media and Communication" },
  { id: "17", label: "Military and Protective Services" },
  { id: "18", label: "Operations" },
  { id: "19", label: "Product Management" },
  { id: "20", label: "Program and Project Management" },
  { id: "21", label: "Purchasing" },
  { id: "22", label: "Quality Assurance" },
  { id: "23", label: "Real Estate" },
  { id: "24", label: "Research" },
  { id: "25", label: "Sales" },
  { id: "26", label: "Customer Success and Support" },
];

export const SENIORITY: EnumOption[] = [
  { id: "100", label: "In Training" },
  { id: "110", label: "Entry Level" },
  { id: "120", label: "Senior" },
  { id: "130", label: "Strategic" },
  { id: "200", label: "Entry Level Manager" },
  { id: "210", label: "Experienced Manager" },
  { id: "220", label: "Director" },
  { id: "300", label: "Vice President" },
  { id: "310", label: "CXO" },
  { id: "320", label: "Owner / Partner" },
];

export const COMPANY_TYPE: EnumOption[] = [
  { id: "C", label: "Public Company" },
  { id: "P", label: "Privately Held" },
  { id: "D", label: "Educational Institution" },
  { id: "S", label: "Partnership" },
  { id: "N", label: "Non Profit" },
  { id: "E", label: "Self Employed" },
  { id: "O", label: "Self Owned" },
  { id: "G", label: "Government Agency" },
];

/** Shared by YEARS_OF_EXPERIENCE, YEARS_AT_CURRENT_COMPANY, YEARS_IN_CURRENT_POSITION. */
export const YEARS: EnumOption[] = [
  { id: "1", label: "Less than 1 year" },
  { id: "2", label: "1 to 2 years" },
  { id: "3", label: "3 to 5 years" },
  { id: "4", label: "6 to 10 years" },
  { id: "5", label: "More than 10 years" },
];

export const PROFILE_LANGUAGE: EnumOption[] = [
  { id: "en", label: "English" },
  { id: "fr", label: "French" },
  { id: "ar", label: "Arabic" },
  { id: "es", label: "Spanish" },
  { id: "pt", label: "Portuguese" },
  { id: "it", label: "Italian" },
  { id: "zh", label: "Chinese" },
  { id: "ru", label: "Russian" },
  { id: "nl", label: "Dutch" },
  { id: "de", label: "German" },
  { id: "tr", label: "Turkish" },
  { id: "pl", label: "Polish" },
  { id: "ko", label: "Korean" },
  { id: "ja", label: "Japanese" },
  { id: "ms", label: "Malay" },
  { id: "tl", label: "Tagalog" },
  { id: "no", label: "Norwegian" },
  { id: "ro", label: "Romanian" },
  { id: "sv", label: "Swedish" },
  { id: "da", label: "Danish" },
  { id: "cs", label: "Czech" },
  { id: "in", label: "Bahasa Indonesia" },
];

export const CHANGED_JOBS: EnumOption[] = [
  { id: "RPC", label: "Changed jobs in last 90 days" },
];

export const POSTED_ON_LINKEDIN: EnumOption[] = [
  { id: "RPOL", label: "Posted on LinkedIn in past 30 days" },
];

/** UNVERIFIED — never appeared in a real URL. Type may be RELATIONSHIP. */
export const CONNECTION: EnumOption[] = [
  { id: "F", label: "1st degree" },
  { id: "S", label: "2nd degree" },
  { id: "O", label: "3rd+ degree" },
];

// ---- Company-mode enums (confirmed from §9.1) ----

export const NUM_OF_FOLLOWERS: EnumOption[] = [
  { id: "NFR1", label: "1-50" },
  { id: "NFR2", label: "51-100" },
  { id: "NFR3", label: "101-1000" },
  { id: "NFR4", label: "1001-5000" },
  { id: "NFR5", label: "5001+" },
];

export const JOB_OPPORTUNITIES: EnumOption[] = [
  { id: "JO1", label: "Hiring on Linkedin" },
];

export const ACCOUNT_ACTIVITIES: EnumOption[] = [
  { id: "RFE", label: "Funding events in past 12 months" },
  { id: "SLC", label: "Senior leadership changes in last 3 months" },
];

export const FORTUNE: EnumOption[] = [
  { id: "1", label: "Fortune 50" },
  { id: "2", label: "Fortune 51-100" },
  { id: "3", label: "Fortune 101-250" },
  { id: "4", label: "Fortune 251-500" },
];

/** Currencies for ANNUAL_REVENUE selectedSubFilter. Verified from SN UI. */
export const REVENUE_CURRENCIES: EnumOption[] = [
  { id: "USD", label: "USD – $" },
  { id: "AED", label: "AED – د.إ" },
  { id: "AUD", label: "AUD – $" },
  { id: "BRL", label: "BRL – $" },
  { id: "CAD", label: "CAD – $" },
  { id: "CNY", label: "CNY – ¥" },
  { id: "DKK", label: "DKK – kr" },
  { id: "EUR", label: "EUR – €" },
  { id: "GBP", label: "GBP – £" },
  { id: "HKD", label: "HKD – $" },
  { id: "IDR", label: "IDR – Rp" },
  { id: "ILS", label: "ILS – ₪" },
  { id: "INR", label: "INR – ₹" },
  { id: "JPY", label: "JPY – ¥" },
  { id: "NOK", label: "NOK – kr" },
  { id: "NZD", label: "NZD – $" },
  { id: "RUB", label: "RUB – руб" },
  { id: "SEK", label: "SEK – kr" },
  { id: "SGD", label: "SGD – $" },
  { id: "THB", label: "THB – ฿" },
  { id: "TRY", label: "TRY – TL" },
  { id: "TWD", label: "TWD – $" },
];
