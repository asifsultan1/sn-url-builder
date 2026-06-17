import type { EnumOption } from "./enums";

/** geoIds shared by REGION, COMPANY_HEADQUARTERS, and company-mode REGION. */
export const COUNTRIES: EnumOption[] = [
  // North America
  { id: "103644278", label: "United States" },
  { id: "101174742", label: "Canada" },
  { id: "103323778", label: "Mexico" },
  // South America
  { id: "106057199", label: "Brazil" },
  { id: "100446943", label: "Argentina" },
  { id: "104621616", label: "Chile" },
  { id: "100876405", label: "Colombia" },
  { id: "102927786", label: "Peru" },
  // United Kingdom & Ireland
  { id: "101165590", label: "United Kingdom" },
  { id: "104738515", label: "Ireland" },
  // Western Europe
  { id: "105015875", label: "France" },
  { id: "101282230", label: "Germany" },
  { id: "103350119", label: "Italy" },
  { id: "105646813", label: "Spain" },
  { id: "100364837", label: "Portugal" },
  { id: "102890719", label: "Netherlands" },
  { id: "100565514", label: "Belgium" },
  { id: "106693272", label: "Switzerland" },
  { id: "103883259", label: "Austria" },
  // Nordics
  { id: "105117694", label: "Sweden" },
  { id: "103819153", label: "Norway" },
  { id: "104514075", label: "Denmark" },
  { id: "100456013", label: "Finland" },
  // Central & Eastern Europe
  { id: "105072130", label: "Poland" },
  { id: "106670623", label: "Romania" },
  { id: "100288700", label: "Hungary" },
  { id: "104677530", label: "Greece" },
  { id: "102105699", label: "Türkiye" },
  { id: "101728296", label: "Russia" },
  { id: "102264497", label: "Ukraine" },
  // Middle East
  { id: "100459316", label: "Saudi Arabia" },
  { id: "104305776", label: "United Arab Emirates" },
  { id: "104170880", label: "Qatar" },
  { id: "103239229", label: "Kuwait" },
  { id: "103619019", label: "Oman" },
  { id: "100425729", label: "Bahrain" },
  { id: "101620260", label: "Israel" },
  { id: "101934083", label: "Iran" },
  // Africa
  { id: "106155005", label: "Egypt" },
  { id: "104035573", label: "South Africa" },
  { id: "105365761", label: "Nigeria" },
  { id: "100710459", label: "Kenya" },
  { id: "104688944", label: "Morocco" },
  { id: "100212432", label: "Ethiopia" },
  // South Asia
  { id: "102713980", label: "India" },
  { id: "101022442", label: "Pakistan" },
  { id: "106215326", label: "Bangladesh" },
  { id: "100446352", label: "Sri Lanka" },
  // East & Southeast Asia
  { id: "102890883", label: "China" },
  { id: "103291313", label: "Hong Kong SAR" },
  { id: "104187078", label: "Taiwan" },
  { id: "101355337", label: "Japan" },
  { id: "105149562", label: "South Korea" },
  { id: "102454443", label: "Singapore" },
  { id: "102478259", label: "Indonesia" },
  { id: "106808692", label: "Malaysia" },
  { id: "103121230", label: "Philippines" },
  { id: "105146118", label: "Thailand" },
  { id: "104195383", label: "Vietnam" },
  // Oceania
  { id: "101452733", label: "Australia" },
  { id: "105490917", label: "New Zealand" },
];

export const MACRO_REGIONS: EnumOption[] = [
  { id: "91000008", label: "MENA" },
  { id: "91000007", label: "EMEA" },
  { id: "102221843", label: "North America" },
  { id: "104514572", label: "South America" },
  { id: "100506914", label: "Europe" },
  { id: "103537801", label: "Africa" },
  { id: "102393603", label: "Asia" },
  { id: "91000003", label: "APAC" },
  { id: "91000004", label: "APJ" },
  { id: "91000009", label: "Nordics" },
  { id: "91000006", label: "DACH" },
  { id: "91000005", label: "Benelux" },
  { id: "91000010", label: "Oceania" },
];

export const METROS: EnumOption[] = [
  { id: "90009524", label: "Greater Sydney Area" },
  { id: "90009521", label: "Greater Melbourne Area" },
  { id: "101240143", label: "Paris" },
];

export const GEO: EnumOption[] = [...MACRO_REGIONS, ...COUNTRIES, ...METROS];
