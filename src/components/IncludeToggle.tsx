import type { SelectionMode } from "../types";

interface Props {
  mode: SelectionMode;
  onChange: (m: SelectionMode) => void;
}

export function IncludeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-li-border overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => onChange("INCLUDED")}
        className={`px-2.5 py-1 ${
          mode === "INCLUDED" ? "bg-li-blue text-white" : "bg-white text-gray-600"
        }`}
      >
        Include
      </button>
      <button
        type="button"
        onClick={() => onChange("EXCLUDED")}
        className={`px-2.5 py-1 border-l border-li-border ${
          mode === "EXCLUDED" ? "bg-red-500 text-white" : "bg-white text-gray-600"
        }`}
      >
        Exclude
      </button>
    </div>
  );
}
