import { useState } from "react";
import { Copy, Check, Trash2, ExternalLink } from "lucide-react";
import type { Filter, SearchModel } from "../types";
import { buildUrl } from "../encoder";
import { CATALOG } from "../data/catalog";
import type { FilterDef } from "../data/catalog";

interface Props {
  model: SearchModel;
  onReset: () => void;
}

/** Build an approximate regular-LinkedIn people-search URL (geo + keywords only). */
function buildLinkedInPreviewUrl(model: SearchModel): string | null {
  if (model.kind !== "people") return null;
  const params = new URLSearchParams();
  if (model.keywords.trim()) params.set("keywords", model.keywords.trim());
  const region = model.filters.find((f) => f.type === "REGION");
  const geoIds = (region?.values ?? [])
    .filter((v) => v.mode === "INCLUDED" && v.id)
    .map((v) => v.id as string);
  if (geoIds.length) params.set("geoUrn", JSON.stringify(geoIds));
  if (!model.keywords.trim() && !geoIds.length) return null;
  params.set("origin", "FACETED_SEARCH");
  return `https://www.linkedin.com/search/results/people/?${params}`;
}

function FilterSummary({ filters, defMap }: { filters: Filter[]; defMap: Map<string, FilterDef> }) {
  if (!filters.length) return null;
  return (
    <div className="border-t border-li-border pt-3 space-y-3">
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        Applied filters
      </h3>
      {filters.map((f) => {
        const def = defMap.get(f.type);
        const label = def?.label ?? f.type;
        return (
          <div key={f.type}>
            <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
            {f.range ? (
              <span className="inline-block text-[11px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                {f.range.min}–{f.range.max}{f.sub ? ` ${f.sub}` : ""}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {(f.values ?? []).map((v, i) => {
                  const isExc = v.mode === "EXCLUDED";
                  return (
                    <span
                      key={i}
                      className={`inline-block text-[11px] rounded px-1.5 py-0.5 ${
                        isExc
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-800 border border-green-200"
                      }`}
                    >
                      {isExc ? "−" : "+"} {v.text || v.id}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OutputPanel({ model, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const url = buildUrl(model);
  const previewUrl = buildLinkedInPreviewUrl(model);
  const valueCount = model.filters.reduce(
    (a, f) => a + (f.range ? 1 : f.values?.length ?? 0),
    0
  );
  const isEmpty = !model.keywords.trim() && model.filters.length === 0;

  const defMap = new Map(CATALOG[model.kind].map((d) => [d.type, d]));

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    if (
      window.confirm(
        `Clear all keywords and filters for the ${model.kind} tab? This can't be undone.`
      )
    )
      onReset();
  };

  return (
    <div className="bg-white border border-li-border rounded-lg p-4 space-y-3">
      <h2 className="font-semibold text-sm">Search URL</h2>

      <textarea
        readOnly
        value={url}
        rows={6}
        className="w-full text-xs font-mono bg-gray-50 border border-li-border rounded-md p-2 break-all resize-none"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-li-border bg-white text-sm hover:bg-gray-50"
        >
          {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy URL"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isEmpty
              ? "border border-li-border bg-gray-50 text-gray-300 pointer-events-none"
              : "border border-li-blue bg-li-blue text-white hover:bg-blue-700"
          }`}
        >
          <ExternalLink size={13} /> Open in SN
        </a>
      </div>

      <div className="flex gap-4 text-[11px] text-gray-500">
        <span>{model.filters.length} filters</span>
        <span>{valueCount} values</span>
        <span>{url.length} chars</span>
      </div>

      {url.length > 8000 && (
        <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1">
          Very long URL — near the practical scraper ceiling. Consider splitting
          the search.
        </p>
      )}

      {previewUrl && (
        <div className="rounded-md border border-li-border bg-blue-50 px-3 py-2 space-y-1">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-li-blue hover:underline"
          >
            <ExternalLink size={13} /> Preview in LinkedIn (approximate)
          </a>
          <p className="text-[11px] text-gray-500 leading-snug">
            Opens a regular LinkedIn People search — only keywords and location
            are applied. SN-specific filters won't appear. Use{" "}
            <strong>Open in SN</strong> above for the real count.
          </p>
        </div>
      )}

      <FilterSummary filters={model.filters} defMap={defMap} />

      <button
        type="button"
        onClick={reset}
        disabled={isEmpty}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-red-300 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 size={14} /> Reset all filters
      </button>
    </div>
  );
}
