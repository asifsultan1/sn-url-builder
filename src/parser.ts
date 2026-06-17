import type { Filter, FilterValue, SearchKind, SearchModel } from "./types";

/** Split a string on `delim` at paren-depth 0 only. */
const splitTopLevel = (s: string, delim = ","): string[] => {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === delim && depth === 0) {
      out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  out.push(s.slice(start));
  return out;
};

/** Strip a single matching outer pair of parens, if present. */
const unwrap = (s: string): string => {
  s = s.trim();
  if (s.startsWith("(") && s.endsWith(")")) return s.slice(1, -1);
  return s;
};

/** Read the value following a `key:` prefix from a segment, else null. */
const after = (seg: string, key: string): string | null =>
  seg.startsWith(key + ":") ? seg.slice(key.length + 1) : null;

const parseValue = (seg: string): FilterValue => {
  const parts = splitTopLevel(unwrap(seg));
  const v: FilterValue = { text: "", mode: "INCLUDED" };
  for (const p of parts) {
    const id = after(p, "id");
    const text = after(p, "text");
    const sel = after(p, "selectionType");
    if (id !== null) v.id = decodeURIComponent(id);
    else if (text !== null) v.text = decodeURIComponent(text);
    else if (sel !== null) v.mode = sel === "EXCLUDED" ? "EXCLUDED" : "INCLUDED";
    // parent:(id:0) is intentionally dropped on import.
  }
  if (!v.text && v.id) v.text = v.id;
  return v;
};

const parseFilter = (seg: string): Filter | null => {
  const parts = splitTopLevel(unwrap(seg));
  const f: Filter = { type: "" };
  let sawParent = false;
  for (const p of parts) {
    const type = after(p, "type");
    const values = after(p, "values"); // "List(...)"
    const range = after(p, "rangeValue"); // "(min:..,max:..)"
    const sub = after(p, "selectedSubFilter");
    if (type !== null) f.type = type;
    else if (values !== null) {
      const inner = unwrap(values.replace(/^List/, ""));
      f.values = inner ? splitTopLevel(inner).map(parseValue) : [];
      if (values.includes("parent:")) sawParent = true;
    } else if (range !== null) {
      const rp = splitTopLevel(unwrap(range));
      let min = 0;
      let max = 0;
      for (const r of rp) {
        const mn = after(r, "min");
        const mx = after(r, "max");
        if (mn !== null) min = Number(mn);
        if (mx !== null) max = Number(mx);
      }
      f.range = { min, max };
    } else if (sub !== null) {
      f.sub = decodeURIComponent(sub);
    }
  }
  // Detect parent:(id:0) inside any raw value segment.
  if (!sawParent && /parent:\(id:0\)/.test(seg)) sawParent = true;
  if (sawParent) f.parent = true;
  if (!f.type) return null;
  return f;
};

export interface ParseResult extends SearchModel {
  /** session-only params that were stripped on import (informational). */
  dropped: string[];
}

/** Detect people vs company from the URL path. Defaults to people. */
const detectKind = (url: string): SearchKind =>
  /\/sales\/search\/company/.test(url) ? "company" : "people";

/**
 * Parse a pasted Sales Nav URL (or a bare encoded query) into a SearchModel.
 * Strips sessionId / viewAllFilters / recentSearchParam.
 */
export const parseUrl = (input: string): ParseResult => {
  const raw = input.trim();
  const kind = detectKind(raw);
  const prefix: "?" | "#" = raw.includes("#query=") ? "#" : "?";
  const dropped: string[] = [];

  const qi = raw.indexOf("query=");
  let encoded = qi >= 0 ? raw.slice(qi + "query=".length) : raw;
  // Cut session-only URL params (literal `&` only appears as a param separator).
  const ampParts = encoded.split("&");
  encoded = ampParts[0];
  for (const p of ampParts.slice(1)) {
    const name = p.split("=")[0];
    if (name) dropped.push(name);
  }

  let inner: string;
  try {
    inner = decodeURIComponent(encoded);
  } catch {
    inner = encoded;
  }

  const model: ParseResult = {
    kind,
    keywords: "",
    filters: [],
    prefix,
    dropped,
  };

  const segments = splitTopLevel(unwrap(inner));
  for (const seg of segments) {
    const kw = after(seg, "keywords");
    if (kw !== null) {
      model.keywords = decodeURIComponent(kw);
      continue;
    }
    if (seg.startsWith("recentSearchParam:")) {
      dropped.push("recentSearchParam");
      continue;
    }
    const fl = after(seg, "filters"); // "List(...)"
    if (fl !== null) {
      const listInner = unwrap(fl.replace(/^List/, ""));
      if (listInner) {
        for (const fseg of splitTopLevel(listInner)) {
          const f = parseFilter(fseg);
          if (f) model.filters.push(f);
        }
      }
    }
  }

  return model;
};
