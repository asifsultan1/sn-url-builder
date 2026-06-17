import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import type { FilterDef } from "../data/catalog";
import { GEO, INDUSTRY } from "../data/catalog";
import type { Filter, FilterValue, SelectionMode } from "../types";
import { IncludeToggle } from "./IncludeToggle";
import { EnumEditor } from "./EnumEditor";
import { Typeahead } from "./Typeahead";
import { TextEditor } from "./TextEditor";
import { TitleEditor } from "./TitleEditor";
import { CompanyEditor } from "./CompanyEditor";
import { RangeEditor } from "./RangeEditor";
import { InfoTip } from "./InfoTip";

const GEO_HELP =
  "To find a geoId: on linkedin.com run a People search, filter by the location, and copy the number in the URL after geoUrn (e.g. urn:li:fs_geo:103644278 → 103644278).";

const INDUSTRY_HELP =
  "Enter the numeric LinkedIn industry id. Or paste a LinkedIn search URL (with industry filters applied) to pull IDs automatically.";

/** Pull numeric industry ids out of a regular-LinkedIn or Sales Nav search URL. */
export function extractIndustryIds(raw: string): string[] {
  if (!raw) return [];
  let s = raw;
  for (let i = 0; i < 2; i++) {
    try {
      const d = decodeURIComponent(s);
      if (d === s) break;
      s = d;
    } catch {
      break;
    }
  }
  const ids = new Set<string>();
  // Regular LinkedIn: industry=["id1","id2"]
  const param = s.match(/\bindustry=([^&\s]*)/i);
  if (param) for (const n of param[1].match(/\d+/g) ?? []) ids.add(n);
  // Sales Nav: (type:INDUSTRY,values:List((id:NNN,...)))
  const iIdx = s.indexOf("type:INDUSTRY");
  if (iIdx >= 0) {
    const after = s.slice(iIdx);
    const end = after.indexOf("),(type:");
    const seg = end >= 0 ? after.slice(0, end) : after;
    for (const m of seg.matchAll(/id:(\d+)/g)) ids.add(m[1]);
  }
  return [...ids];
}

/** Pull numeric geoIds out of a regular-LinkedIn or Sales Nav search URL. */
export function extractGeoIds(raw: string): string[] {
  if (!raw) return [];
  let s = raw;
  for (let i = 0; i < 2; i++) {
    try {
      const d = decodeURIComponent(s);
      if (d === s) break;
      s = d;
    } catch {
      break;
    }
  }
  const ids = new Set<string>();
  // Regular LinkedIn: geoUrn=["101022442","106383538"]
  const geoParam = s.match(/geoUrn=([^&\s]*)/i);
  if (geoParam) for (const n of geoParam[1].match(/\d{4,}/g) ?? []) ids.add(n);
  // URN form: urn:li:fs_geo:123 / fsd_geo:123
  for (const m of s.matchAll(/fsd?_geo:(\d+)/gi)) ids.add(m[1]);
  // Sales Nav: (type:REGION,values:List((id:123,…),(id:456,…)))
  const rIdx = s.indexOf("type:REGION");
  if (rIdx >= 0) {
    const after = s.slice(rIdx);
    const end = after.indexOf("),(type:");
    const seg = end >= 0 ? after.slice(0, end) : after;
    for (const m of seg.matchAll(/id:(\d+)/g)) ids.add(m[1]);
  }
  return [...ids];
}

interface Props {
  def: FilterDef;
  filter?: Filter;
  onChange: (filter: Filter | null) => void;
}

const count = (f?: Filter): number =>
  f?.range ? 1 : f?.values?.length ?? 0;

export function FilterRow({ def, filter, onChange }: Props) {
  const [open, setOpen] = useState(count(filter) > 0);
  const [addMode, setAddMode] = useState<SelectionMode>("INCLUDED");

  const n = count(filter);
  const values = filter?.values ?? [];

  const setValues = (vs: FilterValue[]) => {
    if (!vs.length) onChange(null);
    else onChange({ type: def.type, values: vs, parent: def.parent });
  };

  const isRange = def.kind === "range";

  return (
    <div className="border-b border-li-border last:border-0">
      <div className="flex items-center gap-1.5 pr-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 py-2.5 px-1 text-left hover:bg-black/[0.02]"
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="text-sm font-medium">{def.label}</span>
          {def.unverified && (
            <span title="Unverified filter" className="text-amber-600">
              <AlertTriangle size={14} />
            </span>
          )}
        </button>
        {def.hint && !def.unverified && <InfoTip text={def.hint} align="right" />}
        {n > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-li-blue text-white text-[11px] font-semibold">
            {n}
          </span>
        )}
      </div>

      {open && (
        <div className="pb-3 pl-7 pr-2">
          {def.unverified && (
            <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2 flex gap-1">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              {def.hint ?? "Unverified — confirm by importing a real URL."}
            </p>
          )}

          {!isRange && (
            <div className="mb-1">
              <IncludeToggle mode={addMode} onChange={setAddMode} />
              <span className="text-[11px] text-gray-400 ml-2">
                sets mode for newly-added values
              </span>
            </div>
          )}

          {def.kind === "enum" && def.options && (
            <EnumEditor
              options={def.options}
              values={values}
              addMode={addMode}
              onChange={setValues}
            />
          )}
          {def.kind === "geo" && (
            <Typeahead
              dataset={GEO}
              values={values}
              addMode={addMode}
              placeholder="Search country / region…"
              allowRawId
              rawIdLabel="geoId"
              rawNamePlaceholder="location name (optional)"
              helpNote={GEO_HELP}
              extractIdsFromUrl={extractGeoIds}
              importLabel="location"
              urlImportPlaceholder="https://www.linkedin.com/search/results/people/?…geoUrn=…"
              onChange={setValues}
            />
          )}
          {def.kind === "industry" && (
            <Typeahead
              dataset={INDUSTRY}
              values={values}
              addMode={addMode}
              placeholder="Search industry…"
              allowRawId
              rawIdLabel="industry id"
              rawNamePlaceholder="industry name (optional)"
              helpNote={INDUSTRY_HELP}
              extractIdsFromUrl={extractIndustryIds}
              importLabel="industry"
              urlImportPlaceholder="https://www.linkedin.com/search/results/people/?…industry=…"
              onChange={setValues}
            />
          )}
          {def.kind === "title" && (
            <TitleEditor
              values={values}
              addMode={addMode}
              onChange={setValues}
            />
          )}
          {def.kind === "text" && (
            <TextEditor
              values={values}
              addMode={addMode}
              placeholder={`Type ${def.label.toLowerCase()} values, comma or newline separated…`}
              onChange={setValues}
            />
          )}
          {def.kind === "company" && (
            <CompanyEditor
              values={values}
              addMode={addMode}
              onChange={setValues}
            />
          )}
          {isRange && (
            <RangeEditor
              type={def.type}
              config={def.range}
              filter={filter}
              onChange={onChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
