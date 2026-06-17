import { Check, Minus } from "lucide-react";
import type { EnumOption } from "../data/enums";
import type { FilterValue, SelectionMode } from "../types";

interface Props {
  options: EnumOption[];
  values: FilterValue[];
  addMode: SelectionMode;
  onChange: (values: FilterValue[]) => void;
}

export function EnumEditor({ options, values, addMode, onChange }: Props) {
  const byId = new Map(values.map((v) => [v.id, v]));
  const toggle = (opt: EnumOption) => {
    if (byId.has(opt.id)) {
      onChange(values.filter((v) => v.id !== opt.id));
    } else {
      onChange([...values, { id: opt.id, text: opt.label, mode: addMode }]);
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1">
      {options.map((opt) => {
        const cur = byId.get(opt.id);
        const inc = cur?.mode === "INCLUDED";
        const exc = cur?.mode === "EXCLUDED";
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt)}
            className="flex items-center gap-2 text-left py-0.5 group"
          >
            <span
              className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
                inc
                  ? "bg-li-blue border-li-blue text-white"
                  : exc
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-gray-300 group-hover:border-li-blue"
              }`}
            >
              {inc ? <Check size={12} /> : exc ? <Minus size={12} /> : null}
            </span>
            <span className="text-sm">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
