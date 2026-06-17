import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { EnumOption } from "../data/enums";
import type { FilterValue, SelectionMode } from "../types";
import { Pills } from "./Pills";

interface Props {
  dataset: EnumOption[];
  values: FilterValue[];
  addMode: SelectionMode;
  placeholder: string;
  /** show a dedicated field for adding a value by its raw numeric id. */
  allowRawId?: boolean;
  /** word used in the dedicated id field, e.g. "geoId" or "industry id". */
  rawIdLabel?: string;
  /** placeholder for the optional label input next to the raw id. */
  rawNamePlaceholder?: string;
  /** small helper text shown under the field (e.g. how to find a geoId). */
  helpNote?: string;
  /** when set, show a "paste a URL to pull IDs" box that runs this extractor. */
  extractIdsFromUrl?: (url: string) => string[];
  /** label for the URL-import box, e.g. "location". */
  importLabel?: string;
  /** placeholder for the URL-import input. */
  urlImportPlaceholder?: string;
  onChange: (values: FilterValue[]) => void;
}

export function Typeahead({
  dataset,
  values,
  addMode,
  placeholder,
  allowRawId,
  rawIdLabel = "id",
  rawNamePlaceholder = "name (optional)",
  helpNote,
  extractIdsFromUrl,
  importLabel = "location",
  urlImportPlaceholder = "https://www.linkedin.com/search/results/people/?…",
  onChange,
}: Props) {
  const [q, setQ] = useState("");
  const [rawId, setRawId] = useState("");
  const [rawName, setRawName] = useState("");
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelById = useMemo(
    () => new Map(dataset.map((o) => [o.id, o.label])),
    [dataset]
  );
  const selectedIds = useMemo(
    () => new Set(values.map((v) => v.id)),
    [values]
  );

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return dataset
      .filter((o) => o.label.toLowerCase().includes(t) || o.id.includes(t))
      .slice(0, 10);
  }, [q, dataset]);

  /** add or remove without clearing the query, so several can be picked at once. */
  const toggle = (opt: EnumOption) => {
    if (selectedIds.has(opt.id)) {
      onChange(values.filter((v) => v.id !== opt.id));
    } else {
      onChange([...values, { id: opt.id, text: opt.label, mode: addMode }]);
    }
    inputRef.current?.focus();
  };

  const rawValid = /^\d+$/.test(rawId.trim());

  const addRaw = () => {
    const id = rawId.trim();
    if (!rawValid) return;
    if (!selectedIds.has(id)) {
      const name = rawName.trim();
      onChange([...values, { id, text: name || id, mode: addMode }]);
    }
    setRawId("");
    setRawName("");
  };

  const importFromUrl = () => {
    if (!extractIdsFromUrl) return;
    const ids = extractIdsFromUrl(importText);
    if (!ids.length) {
      setImportMsg("No IDs found in that URL.");
      return;
    }
    const added: FilterValue[] = [];
    const seen = new Set(selectedIds);
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      added.push({ id, text: labelById.get(id) ?? id, mode: addMode });
    }
    if (added.length) onChange([...values, ...added]);
    setImportText("");
    setImportMsg(
      added.length
        ? `Added ${added.length} ${importLabel}${added.length > 1 ? "s" : ""}.`
        : "Those IDs are already in the list."
    );
  };

  return (
    <div className="mt-1">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const first = matches.find((m) => !selectedIds.has(m.id));
            if (first) toggle(first);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
      />
      {matches.length > 0 && (
        <div className="border border-li-border rounded-md mt-1 bg-white shadow-sm divide-y divide-gray-100 max-h-56 overflow-auto">
          {matches.map((m) => {
            const on = selectedIds.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m)}
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-sm text-left hover:bg-blue-50 ${
                  on ? "text-li-blue" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                    on
                      ? "bg-li-blue border-li-blue text-white"
                      : "border-gray-300"
                  }`}
                >
                  {on ? <Check size={12} /> : null}
                </span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {allowRawId && (
        <div className="mt-2 rounded-md border border-dashed border-li-border bg-gray-50 p-2">
          <label className="text-[11px] font-semibold text-gray-500 block mb-1">
            Add by {rawIdLabel}
          </label>
          <div className="flex gap-2">
            <input
              value={rawId}
              onChange={(e) => setRawId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRaw())}
              inputMode="numeric"
              placeholder={`${rawIdLabel} (numbers only)`}
              className="w-40 rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
            />
            <input
              value={rawName}
              onChange={(e) => setRawName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRaw())}
              placeholder={rawNamePlaceholder}
              className="flex-1 rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
            />
            <button
              type="button"
              onClick={addRaw}
              disabled={!rawValid}
              className="px-3 rounded-md bg-li-blue text-white text-sm hover:bg-li-bluehover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {helpNote && (
            <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
              {helpNote}
            </p>
          )}
        </div>
      )}
      {extractIdsFromUrl && (
        <div className="mt-2 rounded-md border border-dashed border-li-border bg-gray-50 p-2">
          <label className="text-[11px] font-semibold text-gray-500 block mb-1">
            Or paste a LinkedIn search URL to pull {importLabel} IDs
          </label>
          <div className="flex gap-2">
            <input
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportMsg(null);
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), importFromUrl())
              }
              placeholder={urlImportPlaceholder}
              className="flex-1 rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
            />
            <button
              type="button"
              onClick={importFromUrl}
              disabled={!importText.trim()}
              className="px-3 rounded-md bg-li-blue text-white text-sm hover:bg-li-bluehover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Pull IDs
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">
            Apply the location filter in LinkedIn (or Sales Nav), paste the full
            URL here, and the {importLabel} IDs are pulled in automatically.
          </p>
          {importMsg && (
            <p className="text-[11px] text-gray-700 mt-1">{importMsg}</p>
          )}
        </div>
      )}
      <Pills
        values={values}
        onToggle={(i) =>
          onChange(
            values.map((v, idx) =>
              idx === i
                ? { ...v, mode: v.mode === "INCLUDED" ? "EXCLUDED" : "INCLUDED" }
                : v
            )
          )
        }
        onRemove={(i) => onChange(values.filter((_, idx) => idx !== i))}
      />
    </div>
  );
}
