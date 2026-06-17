import { X } from "lucide-react";
import type { FilterValue } from "../types";

interface Props {
  values: FilterValue[];
  onToggle: (index: number) => void;
  onRemove: (index: number) => void;
}

export function Pills({ values, onToggle, onRemove }: Props) {
  if (!values.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {values.map((v, i) => {
        const inc = v.mode === "INCLUDED";
        return (
          <span
            key={(v.id ?? "") + v.text + i}
            className={`inline-flex items-center gap-1 rounded-full pl-2 pr-1 py-0.5 text-xs border ${
              inc
                ? "bg-blue-50 border-li-blue text-li-blue"
                : "bg-red-50 border-red-400 text-red-600"
            }`}
          >
            <button
              type="button"
              title="Click to flip include/exclude"
              onClick={() => onToggle(i)}
              className="font-medium hover:underline"
            >
              {inc ? "✓" : "−"} {v.text}
            </button>
            <button
              type="button"
              title="Remove"
              onClick={() => onRemove(i)}
              className="rounded-full hover:bg-black/10 p-0.5"
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
    </div>
  );
}
