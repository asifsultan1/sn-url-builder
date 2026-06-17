import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { FilterValue, SelectionMode } from "../types";
import { TITLES } from "../data/titles";
import { Pills } from "./Pills";

interface Props {
  values: FilterValue[];
  addMode: SelectionMode;
  onChange: (values: FilterValue[]) => void;
}

/**
 * Title filter: pick from a list of common titles AND/OR paste a custom
 * comma-separated list. Titles are free text (no id).
 */
export function TitleEditor({ values, addMode, onChange }: Props) {
  const [q, setQ] = useState("");
  const [paste, setPaste] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => new Set(values.map((v) => v.text.toLowerCase())),
    [values]
  );

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return TITLES.filter((title) => title.toLowerCase().includes(t)).slice(0, 10);
  }, [q]);

  const addMany = (raw: string) => {
    const parts = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const seen = new Set(selected);
    const added: FilterValue[] = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      added.push({ text: p, mode: addMode });
    }
    if (added.length) onChange([...values, ...added]);
  };

  /** toggle a suggestion in/out, keeping the dropdown open for more picks. */
  const toggle = (title: string) => {
    if (selected.has(title.toLowerCase())) {
      onChange(values.filter((v) => v.text.toLowerCase() !== title.toLowerCase()));
    } else {
      onChange([...values, { text: title, mode: addMode }]);
    }
    searchRef.current?.focus();
  };

  return (
    <div className="mt-1 space-y-3">
      {/* Pick from the list */}
      <div>
        <label className="text-[11px] font-semibold text-gray-500 block mb-1">
          Choose from common titles
        </label>
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const first = matches.find((m) => !selected.has(m.toLowerCase()));
              if (first) toggle(first);
              else if (q.trim()) {
                addMany(q);
                setQ("");
              }
            }
          }}
          placeholder="Search titles… (or type a custom one and press Enter)"
          className="w-full rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
        />
        {matches.length > 0 && (
          <div className="border border-li-border rounded-md mt-1 bg-white shadow-sm divide-y divide-gray-100 max-h-56 overflow-auto">
            {matches.map((m) => {
              const on = selected.has(m.toLowerCase());
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggle(m)}
                  className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-sm text-left hover:bg-blue-50 ${
                    on ? "text-li-blue" : ""
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                      on ? "bg-li-blue border-li-blue text-white" : "border-gray-300"
                    }`}
                  >
                    {on ? <Check size={12} /> : null}
                  </span>
                  <span>{m}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Paste a list */}
      <div>
        <label className="text-[11px] font-semibold text-gray-500 block mb-1">
          Or paste a list of titles
        </label>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addMany(paste);
              setPaste("");
            }
          }}
          rows={2}
          placeholder="e.g. CEO, Chief Executive Officer, Founder, Managing Director"
          className="w-full rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue resize-y"
        />
        <p className="text-[11px] text-gray-500 mt-1">
          Comma-separated (preferred) — e.g. <code>CEO, Founder, Owner</code>. Press
          Enter to add, Shift+Enter for a new line.
        </p>
      </div>

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
