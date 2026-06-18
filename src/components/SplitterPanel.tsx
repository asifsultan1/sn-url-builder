import { useState, useMemo } from "react";
import { Copy, Check, ExternalLink, Scissors, AlertTriangle, X, Download, Bookmark, Trash2 } from "lucide-react";
import { parseUrl } from "../parser";
import { buildUrl } from "../encoder";
import { getSplittableFilters, splitModel, splitModelByLength } from "../splitter";
import { CATALOG } from "../data/catalog";
import { InfoTip } from "./InfoTip";
import type { Filter, FilterValue, SearchModel } from "../types";
import type { FilterDef } from "../data/catalog";

type SplitMode = "chunk" | "length" | "group";

interface SplitResult {
  model: SearchModel;
  label?: string; // group name
}

const CHUNK_PRESETS = [5, 10, 15, 20, 25];
const LENGTH_PRESETS = [2000, 3000, 4000, 5000, 6000];

const LS_KEY = "sn-splitter-saved-urls";

interface SavedUrl { id: string; name: string; url: string; savedAt: string }

const loadSaved = (): SavedUrl[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); } catch { return []; }
};

const GROUP_PALETTE = [
  { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-800 border border-blue-300"   },
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-100 text-violet-800 border border-violet-300" },
  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-800 border border-amber-300"  },
  { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700",   badge: "bg-teal-100 text-teal-800 border border-teal-300"   },
  { bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-700",   badge: "bg-rose-100 text-rose-800 border border-rose-300"   },
  { bg: "bg-lime-50",   border: "border-lime-200",   text: "text-lime-700",   badge: "bg-lime-100 text-lime-800 border border-lime-300"   },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800 border border-indigo-300" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800 border border-orange-300" },
];

// ─── Shared filter pills ──────────────────────────────────────────────────────

function FilterPills({ filter, defMap }: { filter: Filter; defMap: Map<string, FilterDef> }) {
  const label = defMap.get(filter.type)?.label ?? filter.type;
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 mb-1">
        {label}
        {filter.values && <span className="ml-1 font-normal text-gray-400">({filter.values.length})</span>}
      </p>
      {filter.range ? (
        <span className="text-[11px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
          {filter.range.min}–{filter.range.max}{filter.sub ? ` ${filter.sub}` : ""}
        </span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {(filter.values ?? []).map((v, i) => (
            <span key={i} className={`text-[11px] rounded px-1.5 py-0.5 ${v.mode === "EXCLUDED" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
              {v.mode === "EXCLUDED" ? "−" : "+"} {v.text || v.id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── URL filter preview ───────────────────────────────────────────────────────

function FilterPreview({ model, defMap, highlightType }: {
  model: SearchModel; defMap: Map<string, FilterDef>; highlightType?: string;
}) {
  if (!model.filters.length && !model.keywords)
    return <p className="text-sm text-gray-400 italic">No filters found.</p>;
  return (
    <div className="space-y-3">
      {model.keywords && (
        <div>
          <p className="text-[11px] font-semibold text-gray-500 mb-1">Keywords</p>
          <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded px-1.5 py-0.5">{model.keywords}</span>
        </div>
      )}
      {model.filters.map((f) => (
        <div key={f.type} className={f.type === highlightType ? "ring-2 ring-li-blue rounded-md p-2 -mx-2" : undefined}>
          <FilterPills filter={f} defMap={defMap} />
          {f.type === highlightType && <p className="text-[10px] text-li-blue mt-1">← will be split</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Group splitter ───────────────────────────────────────────────────────────

interface Group { id: string; name: string; indices: number[] }

function GroupSplitter({ model, filterType, defMap, onResults }: {
  model: SearchModel;
  filterType: string;
  defMap: Map<string, FilterDef>;
  onResults: (results: SplitResult[]) => void;
}) {
  const filter = model.filters.find((f) => f.type === filterType);
  const values: FilterValue[] = filter?.values ?? [];
  const def = defMap.get(filterType);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pendingName, setPendingName] = useState("");
  const [search, setSearch] = useState("");

  const assignedSet = useMemo(
    () => new Set(groups.flatMap((g) => g.indices)),
    [groups]
  );

  const unassigned = useMemo(
    () => values.map((v, i) => ({ v, i })).filter(({ i }) => !assignedSet.has(i)),
    [values, assignedSet]
  );

  const visible = useMemo(
    () => search.trim()
      ? unassigned.filter(({ v }) => (v.text || v.id || "").toLowerCase().includes(search.toLowerCase()))
      : unassigned,
    [unassigned, search]
  );

  const toggle = (idx: number) =>
    setSelected((prev) => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });

  const createGroup = () => {
    if (!selected.size || !pendingName.trim()) return;
    setGroups((prev) => [...prev, { id: crypto.randomUUID(), name: pendingName.trim(), indices: [...selected] }]);
    setSelected(new Set());
    setPendingName("");
  };

  const deleteGroup = (id: string) => setGroups((prev) => prev.filter((g) => g.id !== id));

  const removeFromGroup = (id: string, idx: number) =>
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, indices: g.indices.filter((i) => i !== idx) } : g));

  const renameGroup = (id: string, name: string) =>
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, name } : g));

  const addToGroup = (groupId: string) => {
    if (!selected.size) return;
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, indices: [...new Set([...g.indices, ...selected])] } : g));
    setSelected(new Set());
  };

  const groupUrls = useMemo(() => {
    const others = model.filters.filter((f) => f.type !== filterType);
    return groups.map((g) => {
      const m: SearchModel = { ...model, filters: [...others, { ...filter!, values: g.indices.map((i) => values[i]) }] };
      return { id: g.id, length: buildUrl(m).length };
    });
  }, [groups, model, filter, filterType, values]);

  const generate = () => {
    const others = model.filters.filter((f) => f.type !== filterType);
    const results: SplitResult[] = groups
      .filter((g) => g.indices.length > 0)
      .map((g) => ({
        label: g.name,
        model: { ...model, filters: [...others, { ...filter!, values: g.indices.map((i) => values[i]) }] },
      }));
    onResults(results);
  };

  return (
    <div className="space-y-4">
      {/* Value picker */}
      <div className="bg-white border border-li-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Unassigned {def?.label ?? filterType} values
          </h4>
          <span className="text-[11px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
            {unassigned.length} remaining
          </span>
          {selected.size > 0 && (
            <span className="text-[11px] bg-li-blue text-white rounded px-1.5 py-0.5">
              {selected.size} selected
            </span>
          )}
          <InfoTip
            align="left"
            text="Click values to select them, then create a named group. Repeat until all values are sorted. Each group becomes one output URL."
          />
        </div>

        <input
          type="text"
          placeholder="Search values…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm border border-li-border rounded-md px-2.5 py-1.5 focus:outline-none focus:border-li-blue"
        />

        <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
          {visible.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              {unassigned.length === 0 ? "All values have been grouped." : "No matches for your search."}
            </p>
          )}
          {visible.map(({ v, i }) => {
            const isSel = selected.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className={`text-[11px] rounded-md px-2 py-1 border transition-colors ${
                  isSel
                    ? "bg-li-blue text-white border-li-blue shadow-sm"
                    : v.mode === "EXCLUDED"
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-gray-50 text-gray-700 border-li-border hover:bg-gray-100"
                }`}
              >
                {v.text || v.id}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <button type="button" onClick={() => setSelected(new Set(visible.map(({ i }) => i)))} className="hover:text-li-blue">
            Select all visible
          </button>
          <span>·</span>
          <button type="button" onClick={() => setSelected(new Set())} className="hover:text-gray-600">
            Clear
          </button>
        </div>

        {/* Create / add-to-group controls */}
        {selected.size > 0 && (
          <div className="pt-2 border-t border-li-border space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New group name (e.g. Ecommerce)"
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createGroup()}
                className="flex-1 text-sm border border-li-border rounded-md px-2.5 py-1.5 focus:outline-none focus:border-li-blue"
              />
              <button
                type="button"
                onClick={createGroup}
                disabled={!pendingName.trim()}
                className="px-3 py-1.5 rounded-md bg-li-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                + Create Group
              </button>
            </div>
            {groups.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-gray-400 self-center">or add to:</span>
                {groups.map((g, gi) => {
                  const c = GROUP_PALETTE[gi % GROUP_PALETTE.length];
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => addToGroup(g.id)}
                      className={`text-[11px] rounded px-2 py-0.5 border ${c.badge} hover:opacity-80`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Groups */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Groups ({groups.length})
            </h4>
            {unassigned.length === 0 && (
              <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                All values assigned ✓
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.map((g, gi) => {
              const c = GROUP_PALETTE[gi % GROUP_PALETTE.length];
              const urlInfo = groupUrls.find((u) => u.id === g.id);
              const isTooLong = (urlInfo?.length ?? 0) > 8000;
              return (
                <div key={g.id} className={`border rounded-lg p-3 space-y-2 ${c.bg} ${c.border}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={g.name}
                      onChange={(e) => renameGroup(g.id, e.target.value)}
                      className={`font-semibold text-sm bg-transparent border-b border-transparent hover:border-current focus:outline-none focus:border-current ${c.text} flex-1 min-w-0`}
                      title="Click to rename"
                    />
                    <span className="text-[11px] text-gray-500 shrink-0">{g.indices.length} values</span>
                    {urlInfo && (
                      <span className={`text-[11px] rounded px-1.5 py-0.5 shrink-0 ${isTooLong ? "bg-amber-100 text-amber-700" : "bg-white/70 text-gray-500"}`}>
                        {urlInfo.length.toLocaleString()} ch
                      </span>
                    )}
                    <button type="button" onClick={() => deleteGroup(g.id)} className="text-gray-400 hover:text-red-500 shrink-0" title="Delete group">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {g.indices.map((idx) => {
                      const v = values[idx];
                      return (
                        <span key={idx} className={`inline-flex items-center gap-0.5 text-[11px] rounded px-1.5 py-0.5 ${c.badge}`}>
                          {v.text || v.id}
                          <button type="button" onClick={() => removeFromGroup(g.id, idx)} className="opacity-50 hover:opacity-100 ml-0.5" title="Remove">
                            <X size={9} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warnings + generate */}
      {groups.length > 0 && (
        <div className="space-y-2">
          {unassigned.length > 0 && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 flex items-start gap-1">
              <AlertTriangle size={11} className="mt-0.5 shrink-0" />
              {unassigned.length} values not assigned to any group — they will be excluded from all output URLs.
            </p>
          )}
          <button
            type="button"
            onClick={generate}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-li-blue text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Scissors size={14} /> Generate {groups.length} Group URL{groups.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Split result card ────────────────────────────────────────────────────────

function SplitResultCard({ index, total, result, defMap, splitFilterType, isCopied, onCopy }: {
  index: number;
  total: number;
  result: SplitResult;
  defMap: Map<string, FilterDef>;
  splitFilterType: string;
  isCopied: boolean;
  onCopy: () => void;
}) {
  const { model, label } = result;
  const url = buildUrl(model);
  const splitFilter = model.filters.find((f) => f.type === splitFilterType);
  const otherFilters = model.filters.filter((f) => f.type !== splitFilterType);
  const splitDef = defMap.get(splitFilterType);
  const isTooLong = url.length > 8000;

  return (
    <div className="bg-white border border-li-border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {label ? (
          <span className="font-semibold text-sm">{label}</span>
        ) : (
          <span className="font-semibold text-sm">URL {index + 1} of {total}</span>
        )}
        {splitFilter?.values && (
          <span className="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
            {splitFilter.values.length} {splitDef?.label ?? splitFilterType} values
          </span>
        )}
        <span className={`text-xs rounded px-1.5 py-0.5 ml-auto ${isTooLong ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
          {url.length.toLocaleString()} chars
        </span>
      </div>

      {splitFilter && (
        <div className="pb-3 border-b border-li-border">
          <FilterPills filter={splitFilter} defMap={defMap} />
        </div>
      )}

      {otherFilters.length > 0 && (
        <div className="space-y-3 pb-3 border-b border-li-border">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Other filters (unchanged in every URL)
          </p>
          {otherFilters.map((f: Filter) => (
            <FilterPills key={f.type} filter={f} defMap={defMap} />
          ))}
        </div>
      )}

      <textarea readOnly value={url} rows={3}
        className="w-full text-xs font-mono bg-gray-50 border border-li-border rounded-md p-2 break-all resize-none" />

      {isTooLong && (
        <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1 flex items-center gap-1">
          <AlertTriangle size={11} /> Still very long — reduce chunk size or split this group further.
        </p>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={onCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-li-border bg-white text-sm hover:bg-gray-50">
          {isCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          {isCopied ? "Copied!" : "Copy URL"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-li-blue bg-li-blue text-white text-sm font-medium hover:bg-blue-700">
          <ExternalLink size={13} /> Open in SN
        </a>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function SplitterPanel() {
  const [url, setUrl] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("chunk");
  const [chunkSize, setChunkSize] = useState(10);
  const [maxLength, setMaxLength] = useState(4000);
  const [splitFilterType, setSplitFilterType] = useState("");
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>(loadSaved);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const parsed = useMemo(() => {
    if (!url.trim()) return null;
    try { return parseUrl(url.trim()); } catch { return null; }
  }, [url]);

  const defMap = useMemo(
    () => parsed ? new Map(CATALOG[parsed.kind].map((d) => [d.type, d])) : new Map<string, FilterDef>(),
    [parsed]
  );

  const splittable = useMemo(() => parsed ? getSplittableFilters(parsed) : [], [parsed]);

  const activeSplitFilter = useMemo(() => {
    if (!splittable.length) return "";
    if (splitFilterType && splittable.find((s) => s.type === splitFilterType)) return splitFilterType;
    return splittable[0].type;
  }, [splittable, splitFilterType]);

  const previewCount = useMemo(() => {
    if (!parsed || !activeSplitFilter || splitMode === "group") return 0;
    if (splitMode === "chunk") {
      const t = parsed.filters.find((f) => f.type === activeSplitFilter);
      return t?.values ? Math.ceil(t.values.length / chunkSize) : 0;
    }
    return splitModelByLength(parsed, activeSplitFilter, maxLength).length;
  }, [parsed, activeSplitFilter, splitMode, chunkSize, maxLength]);

  const doSplit = () => {
    if (!parsed || !activeSplitFilter) return;
    const models = splitMode === "chunk"
      ? splitModel(parsed, activeSplitFilter, chunkSize)
      : splitModelByLength(parsed, activeSplitFilter, maxLength);
    setSplitResults(models.map((m) => ({ model: m })));
    setCopiedIdx(null);
  };

  const copyOne = async (idx: number) => {
    const r = splitResults[idx];
    if (!r) return;
    await navigator.clipboard.writeText(buildUrl(r.model));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(splitResults.map((r) => buildUrl(r.model)).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const exportJson = () => {
    if (!parsed) return;
    const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sn-${parsed.kind}-filters.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const saveUrl = () => {
    if (!url.trim() || !saveName.trim()) return;
    const entry: SavedUrl = { id: crypto.randomUUID(), name: saveName.trim(), url: url.trim(), savedAt: new Date().toISOString() };
    const updated = [entry, ...savedUrls];
    setSavedUrls(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setSaveName("");
    setShowSaveInput(false);
  };

  const deleteSaved = (id: string) => {
    const updated = savedUrls.filter((s) => s.id !== id);
    setSavedUrls(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  const loadSavedUrl = (savedUrl: string) => {
    setUrl(savedUrl);
    setSplitResults([]);
    setShowSaveInput(false);
  };

  return (
    <div className="space-y-4">
      {/* URL input */}
      <div className="bg-white border border-li-border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-500">
            Paste a Sales Navigator URL to split
          </label>
          {url.trim() && (
            <button
              type="button"
              onClick={() => { setUrl(""); setSplitResults([]); setShowSaveInput(false); }}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <textarea
          value={url}
          onChange={(e) => { setUrl(e.target.value); setSplitResults([]); }}
          rows={4}
          placeholder="https://www.linkedin.com/sales/search/people?query=..."
          className="w-full text-xs font-mono bg-gray-50 border border-li-border rounded-md p-2 break-all resize-none focus:outline-none focus:border-li-blue"
        />
        {url.trim() && !parsed && <p className="text-xs text-red-600">Could not parse this URL.</p>}
        {parsed && (
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
            <span className="capitalize font-medium text-li-blue">{parsed.kind} search</span>
            <span>{parsed.filters.length} filters</span>
            <span>{parsed.filters.reduce((a, f) => a + (f.range ? 1 : (f.values?.length ?? 0)), 0)} values total</span>
            <span>{url.trim().length.toLocaleString()} chars</span>
            {url.trim().length > 8000 && <span className="text-amber-700 font-medium">⚠ Very long — splitting recommended</span>}
          </div>
        )}
      </div>

      {/* Utility bar: JSON export + save URL */}
      {parsed && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-li-border bg-white text-sm hover:bg-gray-50"
          >
            <Download size={14} /> Export filter model as JSON
          </button>
          {!showSaveInput ? (
            <button
              type="button"
              onClick={() => setShowSaveInput(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-li-border bg-white text-sm hover:bg-gray-50"
            >
              <Bookmark size={14} /> Save URL
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="text"
                autoFocus
                placeholder="Name this search…"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveUrl(); if (e.key === "Escape") setShowSaveInput(false); }}
                className="flex-1 min-w-0 text-sm border border-li-border rounded-md px-2.5 py-1.5 focus:outline-none focus:border-li-blue"
              />
              <button type="button" onClick={saveUrl} disabled={!saveName.trim()}
                className="px-3 py-1.5 rounded-md bg-li-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 whitespace-nowrap">
                Save
              </button>
              <button type="button" onClick={() => setShowSaveInput(false)}
                className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved URLs */}
      {savedUrls.length > 0 && (
        <div className="bg-white border border-li-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saved URLs</h3>
            <span className="text-[11px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{savedUrls.length}</span>
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 flex items-start gap-1.5">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            Saved in this browser only — not synced across devices and will be lost if browser storage is cleared.
          </p>
          <div className="space-y-2">
            {savedUrls.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-md border border-li-border px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{s.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{s.url}</p>
                </div>
                <button type="button" onClick={() => loadSavedUrl(s.url)}
                  className="text-xs text-li-blue hover:underline shrink-0">
                  Load
                </button>
                <button type="button" onClick={() => deleteSaved(s.id)}
                  className="text-gray-400 hover:text-red-500 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed && (
        <>
          {/* Two-column: filter preview + split settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-li-border rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Preview</h3>
              <FilterPreview model={parsed} defMap={defMap} highlightType={activeSplitFilter} />
            </div>

            <div className="bg-white border border-li-border rounded-lg p-4 space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Split Settings</h3>

              {splittable.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No splittable filters found — need a list filter with more than one value.</p>
              ) : (
                <>
                  {/* Filter to split */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      Filter to split
                      <InfoTip align="left" text="The filter whose values will be divided across multiple URLs. All other filters stay the same in every output URL. Auto-selects the filter with the most values." />
                    </label>
                    <select
                      value={activeSplitFilter}
                      onChange={(e) => setSplitFilterType(e.target.value)}
                      className="w-full text-sm border border-li-border rounded-md px-2.5 py-1.5 focus:outline-none focus:border-li-blue bg-white"
                    >
                      {splittable.map((s) => (
                        <option key={s.type} value={s.type}>
                          {defMap.get(s.type)?.label ?? s.type} ({s.count} values)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mode toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      Split by
                      <InfoTip align="left" text="Values per chunk: even slices of N values each. Max URL length: greedy fill up to a character limit. By persona: you manually sort values into named groups — best when titles belong to distinct audiences." />
                    </label>
                    <div className="inline-flex rounded-md border border-li-border overflow-hidden text-xs">
                      {(["chunk", "length", "group"] as const).map((m) => (
                        <button key={m} type="button" onClick={() => { setSplitMode(m); setSplitResults([]); }}
                          className={`px-3 py-1.5 ${splitMode === m ? "bg-li-blue text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                          {m === "chunk" ? "Values per chunk" : m === "length" ? "Max URL length" : "By persona"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {splitMode === "chunk" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        Values per chunk
                        <InfoTip align="left" text="A 'value' is one entry in a filter — e.g. one job title, one country, one industry. This controls how many values from the split filter go into each output URL. Fewer values = shorter URLs = more URLs total." />
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {CHUNK_PRESETS.map((n) => (
                          <button key={n} type="button" onClick={() => setChunkSize(n)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${chunkSize === n ? "bg-li-blue text-white border-li-blue" : "bg-white text-gray-600 border-li-border hover:bg-gray-50"}`}>
                            {n}
                          </button>
                        ))}
                        <input type="number" min={1} max={200} value={chunkSize}
                          onChange={(e) => setChunkSize(Math.max(1, Number(e.target.value)))}
                          className="w-16 text-sm border border-li-border rounded-md px-2 py-1 focus:outline-none focus:border-li-blue text-center" />
                      </div>
                    </div>
                  )}

                  {splitMode === "length" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        Max URL length (chars)
                        <InfoTip align="left" text="The maximum number of characters allowed in each output URL. Values are added one by one until the next value would push the URL over this limit — then a new URL starts. Check your scraper's docs for its limit; common limits are 2,000–8,000 chars." />
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {LENGTH_PRESETS.map((n) => (
                          <button key={n} type="button" onClick={() => setMaxLength(n)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${maxLength === n ? "bg-li-blue text-white border-li-blue" : "bg-white text-gray-600 border-li-border hover:bg-gray-50"}`}>
                            {n.toLocaleString()}
                          </button>
                        ))}
                        <input type="number" min={100} max={100000} value={maxLength}
                          onChange={(e) => setMaxLength(Math.max(100, Number(e.target.value)))}
                          className="w-20 text-sm border border-li-border rounded-md px-2 py-1 focus:outline-none focus:border-li-blue text-center" />
                      </div>
                    </div>
                  )}

                  {splitMode === "group" && (
                    <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 leading-relaxed">
                      Sort your values into named groups below. Each group generates one URL with all other filters intact.
                    </div>
                  )}

                  {splitMode !== "group" && (
                    <>
                      {previewCount > 0 && (
                        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700 leading-relaxed">
                          {splitMode === "chunk" ? (
                            <>Will create <strong>{previewCount} URLs</strong>, each with up to {chunkSize} values.</>
                          ) : (
                            <>Will create <strong>{previewCount} URLs</strong>, each capped at {maxLength.toLocaleString()} chars.</>
                          )}
                          {" "}All other filters are copied unchanged.
                        </div>
                      )}
                      <button type="button" onClick={doSplit}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-li-blue text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                        <Scissors size={14} /> Split URL
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Group splitter — full width, only in group mode */}
          {splitMode === "group" && activeSplitFilter && (
            <GroupSplitter
              model={parsed}
              filterType={activeSplitFilter}
              defMap={defMap}
              onResults={(results) => { setSplitResults(results); setCopiedIdx(null); }}
            />
          )}
        </>
      )}

      {/* Results */}
      {splitResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm">{splitResults.length} Split URLs</h3>
            <button type="button" onClick={copyAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-li-border bg-white text-xs hover:bg-gray-50">
              {copiedAll ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              {copiedAll ? "Copied all!" : "Copy all URLs"}
            </button>
          </div>
          {splitResults.map((r, i) => (
            <SplitResultCard
              key={i} index={i} total={splitResults.length}
              result={r} defMap={defMap} splitFilterType={activeSplitFilter}
              isCopied={copiedIdx === i} onCopy={() => copyOne(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
