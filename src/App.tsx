import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { Filter, SearchKind, SearchModel } from "./types";
import { CATALOG, GROUP_ORDER } from "./data/catalog";
import { FilterRow } from "./components/FilterRow";
import { OutputPanel } from "./components/OutputPanel";
import { InfoTip } from "./components/InfoTip";

type TabState = {
  keywords: string;
  filters: Record<string, Filter>;
};

const emptyTab = (): TabState => ({ keywords: "", filters: {} });

export default function App() {
  const [kind, setKind] = useState<SearchKind>("people");
  const [tabs, setTabs] = useState<Record<SearchKind, TabState>>({
    people: emptyTab(),
    company: emptyTab(),
  });

  const tab = tabs[kind];

  const setFilter = (type: string, filter: Filter | null) => {
    setTabs((prev) => {
      const next = { ...prev[kind].filters };
      if (filter) next[type] = filter;
      else delete next[type];
      return { ...prev, [kind]: { ...prev[kind], filters: next } };
    });
  };

  const setKeywords = (kw: string) =>
    setTabs((prev) => ({ ...prev, [kind]: { ...prev[kind], keywords: kw } }));

  const model: SearchModel = useMemo(() => {
    const filters: Filter[] = CATALOG[kind]
      .map((d) => tab.filters[d.type])
      .filter((f): f is Filter => Boolean(f));
    return { kind, keywords: tab.keywords, filters };
  }, [kind, tab]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(model, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sn-${kind}-search.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reset = () =>
    setTabs((prev) => ({ ...prev, [kind]: emptyTab() }));

  const groups = GROUP_ORDER[kind];

  return (
    <div className="min-h-full">
      <header className="bg-white border-b border-li-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-li-blue text-white grid place-items-center font-bold text-sm">
            in
          </div>
          <h1 className="font-semibold text-lg">Sales Nav URL Builder</h1>
          <div className="ml-auto inline-flex rounded-md border border-li-border overflow-hidden text-sm">
            {(["people", "company"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`px-4 py-1.5 capitalize ${
                  kind === k ? "bg-li-blue text-white" : "bg-white text-gray-600"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="space-y-4">
          {/* Keywords */}
          <div className="bg-white border border-li-border rounded-lg p-3">
            <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              Keywords (boolean supported)
              <InfoTip
                align="left"
                text="Free-text search across the whole profile — name, headline, current and past roles, company and more. Supports boolean operators: AND, OR, NOT, quotes for an exact phrase, and parentheses for grouping."
              />
            </label>
            <input
              value={tab.keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder='e.g. "head of ecommerce" AND (retail OR fashion)'
              className="w-full rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
            />
          </div>

          {/* Filter catalog */}
          {groups.map((group) => (
            <div
              key={group}
              className="bg-white border border-li-border rounded-lg p-3"
            >
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {group}
              </h2>
              {CATALOG[kind]
                .filter((d) => d.group === group)
                .map((d) => (
                  <FilterRow
                    key={d.type}
                    def={d}
                    filter={tab.filters[d.type]}
                    onChange={(f) => setFilter(d.type, f)}
                  />
                ))}
            </div>
          ))}
        </div>

        <div className="space-y-3 lg:sticky lg:top-4 self-start">
          <OutputPanel
            model={model}
            onReset={reset}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportJson}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-li-border bg-white text-sm hover:bg-gray-50"
            >
              <Download size={14} /> Export filter model as JSON
            </button>
            <InfoTip
              align="right"
              text="Downloads the current filters as a JSON file. This is NOT the LinkedIn URL — it's a machine-readable copy of your filter setup, handy for saving a search to reuse later or feeding into another tool or script."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
