import type { Filter, FilterValue, SearchKind, SearchModel } from "./types";

export const BASE_PATH: Record<SearchKind, string> = {
  people: "https://www.linkedin.com/sales/search/people",
  company: "https://www.linkedin.com/sales/search/company",
};

/**
 * Step A — per-field encode. encodeURIComponent does NOT escape parens, so we
 * manually escape them inside field content; otherwise boolean parens in text
 * (e.g. "(VP OR Director)") would be mistaken for structural parens after the
 * single outer encode pass.
 */
export const encVal = (s: string | number): string =>
  encodeURIComponent(String(s))
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");

/** Build one value tuple with structural punctuation LITERAL. */
export const valueStr = (v: FilterValue, parent?: boolean): string => {
  const id = v.id ? `id:${encVal(v.id)},` : "";
  const par = parent ? ",parent:(id:0)" : "";
  const text = v.text || v.id || "";
  return `(${id}text:${encVal(text)},selectionType:${v.mode}${par})`;
};

/** Build one filter tuple (list or range) with structural punctuation LITERAL. */
export const filterStr = (f: Filter): string | null => {
  if (f.range) {
    const sub =
      f.sub != null && f.sub !== "" ? `,selectedSubFilter:${encVal(f.sub)}` : "";
    return `(type:${f.type},rangeValue:(min:${f.range.min},max:${f.range.max})${sub})`;
  }
  const vals = (f.values || []).filter((v) => (v.text || "").trim() || v.id);
  if (!vals.length) return null;
  return `(type:${f.type},values:List(${vals
    .map((v) => valueStr(v, f.parent))
    .join(",")}))`;
};

/**
 * Build the inner query (structure literal) then run the WHOLE thing through
 * encodeURIComponent once (step B). Returns null when there is nothing to emit.
 */
export const buildQuery = (
  keywords: string,
  filters: Filter[]
): string | null => {
  const parts = filters
    .filter((f) => f.type)
    .map(filterStr)
    .filter((s): s is string => Boolean(s));
  const kw = (keywords || "").trim();
  if (!parts.length && !kw) return null;
  const fstr = `filters:List(${parts.join(",")})`;
  const inner = kw ? `(keywords:${encVal(kw)},${fstr})` : `(${fstr})`;
  return encodeURIComponent(inner);
};

/** Assemble the full paste-ready URL. Bare base URL when there's nothing to encode. */
export const buildUrl = (model: SearchModel): string => {
  const base = BASE_PATH[model.kind];
  const q = buildQuery(model.keywords, model.filters);
  if (!q) return base;
  const sep = model.prefix === "#" ? "#" : "?";
  return `${base}${sep}query=${q}`;
};
