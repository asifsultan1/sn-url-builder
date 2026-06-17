import { useState } from "react";
import type { FilterValue, SelectionMode } from "../types";
import { Pills } from "./Pills";

interface Props {
  values: FilterValue[];
  addMode: SelectionMode;
  onChange: (values: FilterValue[]) => void;
}

interface Parsed {
  id: string;    // full URN
  display: string;
}

/**
 * Extract org id + display name from whatever the user typed or pasted.
 * Returns null if it doesn't look like a URL (caller handles raw ids/urns).
 */
const parseInput = (raw: string): Parsed | { error: string } | null => {
  if (!raw.includes("linkedin.com/")) return null;

  // Any linkedin.com/…/company/{numericId} path (public or Sales Nav)
  const numMatch = raw.match(/\/company\/(\d+)/);
  if (numMatch) {
    return { id: `urn:li:organization:${numMatch[1]}`, display: numMatch[1] };
  }

  // Vanity slug: /company/{slug} — numeric id is NOT in the public URL
  const slugMatch = raw.match(/\/company\/([^/?#\s]+)/);
  if (slugMatch) {
    const slug = slugMatch[1];
    return {
      error: `"${slug}" is a vanity URL — the numeric id isn't in the address. To find it: open the company page, press Ctrl+U (View Source), and search for "organizationUrn". The number after the last colon is the id. Paste that number here.`,
    };
  }

  return { error: "Couldn't find a company id in that URL." };
};

export function CompanyEditor({ values, addMode, onChange }: Props) {
  const [input, setInput] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const add = () => {
    const raw = input.trim();
    if (!raw) return;

    // Try URL parsing first
    const parsed = parseInput(raw);
    if (parsed) {
      if ("error" in parsed) {
        setWarning(parsed.error);
        return;
      }
      const { id, display } = parsed;
      if (!values.some((v) => v.id === id)) {
        onChange([...values, { id, text: display, mode: addMode }]);
      }
      setInput("");
      setWarning(null);
      return;
    }

    // Plain numeric id or URN
    const id = /^\d+$/.test(raw)
      ? `urn:li:organization:${raw}`
      : raw.startsWith("urn:li:")
      ? raw
      : null;

    if (!id) {
      setWarning("Enter a numeric org id, a URN, or paste a Sales Nav / LinkedIn company URL.");
      return;
    }

    if (!values.some((v) => v.id === id)) {
      onChange([...values, { id, text: raw, mode: addMode }]);
    }
    setInput("");
    setWarning(null);
  };

  return (
    <div className="mt-1 space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setWarning(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Paste a linkedin.com/company/… URL, or enter numeric id"
          className="flex-1 rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 rounded-md bg-li-blue text-white text-sm hover:bg-li-bluehover"
        >
          Add
        </button>
      </div>
      <p className="text-[11px] text-gray-400 leading-snug">
        Paste a LinkedIn company URL to extract the id (works if the URL contains a number). You can also enter a numeric org id directly (e.g. <code>1035</code>).
      </p>
      {warning && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 leading-snug">
          {warning}
        </p>
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
