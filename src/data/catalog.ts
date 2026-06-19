import type { EnumOption } from "./enums";
import * as E from "./enums";
import { GEO } from "./geo";
import { INDUSTRY } from "./industry";
import type { SearchKind } from "../types";

export type InputKind =
  | "enum" // checkbox list over a fixed dataset
  | "geo" // typeahead over geo dataset
  | "industry" // typeahead over industry dataset
  | "text" // free-text values (no id)
  | "title" // free-text titles: suggestion list + comma-separated paste
  | "company" // free-text; numeric id auto-prefixed to urn:li:organization:
  | "range"; // min/max + optional sub-filter

export interface RangeConfig {
  /** options for selectedSubFilter, if any. */
  sub?: EnumOption[];
  subLabel?: string;
  /** default sub id. */
  defaultSub?: string;
  hint?: string;
}

export interface FilterDef {
  type: string;
  label: string;
  group: string;
  kind: InputKind;
  options?: EnumOption[];
  parent?: boolean;
  unverified?: boolean;
  range?: RangeConfig;
  hint?: string;
}

export const PEOPLE_CATALOG: FilterDef[] = [
  // Company
  { type: "CURRENT_COMPANY", label: "Current company", group: "Company", kind: "company", parent: true, hint: "The company the person works at NOW. Enter the company's LinkedIn organization id (numeric ids are auto-prefixed to urn:li:organization:)." },
  { type: "COMPANY_HEADCOUNT", label: "Company headcount", group: "Company", kind: "enum", options: E.HEADCOUNT_PEOPLE, hint: "Employee-count bracket of the person's current company." },
  { type: "PAST_COMPANY", label: "Past company", group: "Company", kind: "company", parent: true, hint: "A company the person worked at PREVIOUSLY. Enter the LinkedIn organization id." },
  { type: "COMPANY_TYPE", label: "Company type", group: "Company", kind: "enum", options: E.COMPANY_TYPE, hint: "Ownership type of the company (public, privately held, non-profit, government, etc.)." },
  { type: "COMPANY_HEADQUARTERS", label: "Company headquarters location", group: "Company", kind: "geo", hint: "Location of the company's headquarters. Pick from the list or add a location by its geoId." },
  // Role
  { type: "FUNCTION", label: "Function", group: "Role", kind: "enum", options: E.FUNCTION, hint: "The person's job function / department as classified by LinkedIn (e.g. Sales, Engineering, Finance)." },
  { type: "CURRENT_TITLE", label: "Current job title", group: "Role", kind: "title", hint: "Matches the person's CURRENT job title. Pick from the suggestion list or paste your own comma-separated list of titles. Each entry is matched on its own (multiple titles = OR)." },
  { type: "SENIORITY_LEVEL", label: "Seniority level", group: "Role", kind: "enum", options: E.SENIORITY, hint: "LinkedIn's seniority classification (e.g. CXO, VP, Director, Entry Level). Select any number of levels." },
  { type: "PAST_TITLE", label: "Past job title", group: "Role", kind: "title", hint: "Matches a job title the person held in a PREVIOUS role. Pick from suggestions or paste a comma-separated list." },
  { type: "YEARS_AT_CURRENT_COMPANY", label: "Years in current company", group: "Role", kind: "enum", options: E.YEARS, hint: "How long the person has been at their current company." },
  { type: "YEARS_IN_CURRENT_POSITION", label: "Years in current position", group: "Role", kind: "enum", options: E.YEARS, hint: "How long the person has held their current position." },
  // Personal
  { type: "REGION", label: "Geography", group: "Personal", kind: "geo", hint: "Where the person is located. Pick from the list or add any location by its LinkedIn geoId." },
  { type: "INDUSTRY", label: "Industry", group: "Personal", kind: "industry", hint: "Industry associated with the person (from their current company). Pick from the list or add an industry by its numeric id." },
  { type: "FIRST_NAME", label: "First name", group: "Personal", kind: "text", hint: "Exact first name(s). Useful for finding specific people." },
  { type: "LAST_NAME", label: "Last name", group: "Personal", kind: "text", hint: "Exact last name(s). Useful for finding specific people." },
  { type: "PROFILE_LANGUAGE", label: "Profile language", group: "Personal", kind: "enum", options: E.PROFILE_LANGUAGE, hint: "The language the person's LinkedIn profile is written in." },
  { type: "YEARS_OF_EXPERIENCE", label: "Years of experience", group: "Personal", kind: "enum", options: E.YEARS, hint: "Total years of professional experience across the person's whole career." },
  { type: "SCHOOL", label: "School", group: "Personal", kind: "company", hint: "School the person attended. Enter the school's LinkedIn organization id (no parent suffix is added)." },
  // Recent updates
  { type: "RECENTLY_CHANGED_JOBS", label: "Changed jobs", group: "Recent updates", kind: "enum", options: E.CHANGED_JOBS, hint: "Spotlight filter: people who started a new role in the past 90 days." },
  { type: "POSTED_ON_LINKEDIN", label: "Posted on LinkedIn", group: "Recent updates", kind: "enum", options: E.POSTED_ON_LINKEDIN, hint: "Spotlight filter: people who posted on LinkedIn in the past 30 days." },
];

export const COMPANY_CATALOG: FilterDef[] = [
  // Firmographics
  { type: "INDUSTRY", label: "Industry", group: "Firmographics", kind: "industry", hint: "The company's industry. Pick from the list or add an industry by its numeric id." },
  { type: "REGION", label: "HQ location", group: "Firmographics", kind: "geo", hint: "Location of the company's headquarters. Pick from the list or add a location by its LinkedIn geoId." },
  { type: "COMPANY_HEADCOUNT", label: "Company headcount", group: "Firmographics", kind: "enum", options: E.HEADCOUNT_COMPANY, hint: "Total employee-count bracket of the company." },
  { type: "FORTUNE", label: "Fortune ranking", group: "Firmographics", kind: "enum", options: E.FORTUNE, hint: "Whether the company appears in a Fortune ranking band." },
  // Size & growth
  {
    type: "ANNUAL_REVENUE",
    label: "Annual revenue",
    group: "Size & growth",
    kind: "range",
    range: { sub: E.REVENUE_CURRENCIES, subLabel: "Currency", defaultSub: "USD", hint: "Unit is millions of the selected currency (e.g. 5–500 = $5M–$500M)." },
  },
  {
    type: "COMPANY_HEADCOUNT_GROWTH",
    label: "Headcount growth",
    group: "Size & growth",
    kind: "range",
    range: { hint: "Enter percentage values — e.g. 10 to 50 means 10%–50% headcount growth." },
  },
  {
    type: "DEPARTMENT_HEADCOUNT",
    label: "Department headcount",
    group: "Size & growth",
    kind: "range",
    range: { sub: E.FUNCTION, subLabel: "Department", hint: "Select a department — codes are assumed to match LinkedIn's job function IDs (unconfirmed). Test by applying the filter in SN and checking the Splitter preview." },
  },
  {
    type: "DEPARTMENT_HEADCOUNT_GROWTH",
    label: "Department headcount growth",
    group: "Size & growth",
    kind: "range",
    range: { sub: E.FUNCTION, subLabel: "Department", hint: "Select a department — codes are assumed to match LinkedIn's job function IDs (unconfirmed). Test by applying the filter in SN and checking the Splitter preview." },
  },
  { type: "NUM_OF_FOLLOWERS", label: "Number of followers", group: "Size & growth", kind: "enum", options: E.NUM_OF_FOLLOWERS, hint: "Size bracket of the company's LinkedIn follower count." },
  // Signals
  { type: "JOB_OPPORTUNITIES", label: "Job opportunities", group: "Signals", kind: "enum", options: E.JOB_OPPORTUNITIES, hint: "Companies showing the selected hiring signal." },
  { type: "ACCOUNT_ACTIVITIES", label: "Account activities", group: "Signals", kind: "enum", options: E.ACCOUNT_ACTIVITIES, hint: "Recent company activity such as funding events or senior leadership changes." },
];

export const CATALOG: Record<SearchKind, FilterDef[]> = {
  people: PEOPLE_CATALOG,
  company: COMPANY_CATALOG,
};

export const GROUP_ORDER: Record<SearchKind, string[]> = {
  people: ["Company", "Role", "Personal", "Recent updates"],
  company: ["Firmographics", "Size & growth", "Signals"],
};

export { GEO, INDUSTRY };
