import { useState } from "react";
import type { FilterValue, SelectionMode } from "../types";
import { Pills } from "./Pills";

interface Props {
  values: FilterValue[];
  addMode: SelectionMode;
  placeholder: string;
  onChange: (values: FilterValue[]) => void;
}

/** Free-text values (no id). Comma/newline split, dedupe, Enter to add. */
export function TextEditor({ values, addMode, placeholder, onChange }: Props) {
  const [text, setText] = useState("");

  const commit = () => {
    const parts = text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const existing = new Set(values.map((v) => v.text.toLowerCase()));
    const added: FilterValue[] = [];
    for (const p of parts) {
      if (existing.has(p.toLowerCase())) continue;
      existing.add(p.toLowerCase());
      added.push({ text: p, mode: addMode });
    }
    if (added.length) onChange([...values, ...added]);
    setText("");
  };

  return (
    <div className="mt-1">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
        }}
        rows={2}
        placeholder={placeholder}
        className="w-full rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue resize-y"
      />
      <button
        type="button"
        onClick={commit}
        className="text-xs text-li-blue hover:underline mt-1"
      >
        Add (Enter, or Shift+Enter for a new line)
      </button>
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
