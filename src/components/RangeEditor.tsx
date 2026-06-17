import type { RangeConfig } from "../data/catalog";
import type { Filter } from "../types";

interface Props {
  config?: RangeConfig;
  filter?: Filter;
  onChange: (filter: Filter | null) => void;
  type: string;
}

export function RangeEditor({ config, filter, onChange, type }: Props) {
  const range = filter?.range;
  const sub = filter?.sub ?? config?.defaultSub ?? "";

  const update = (patch: Partial<{ min: number; max: number; sub: string }>) => {
    const min = patch.min ?? range?.min ?? 0;
    const max = patch.max ?? range?.max ?? 0;
    const nextSub = patch.sub ?? sub;
    onChange({ type, range: { min, max }, sub: nextSub || undefined });
  };

  return (
    <div className="mt-1 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={range?.min ?? ""}
          onChange={(e) => update({ min: Number(e.target.value) })}
          placeholder="min"
          className="w-24 rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
        />
        <span className="text-gray-400">—</span>
        <input
          type="number"
          value={range?.max ?? ""}
          onChange={(e) => update({ max: Number(e.target.value) })}
          placeholder="max"
          className="w-24 rounded-md border border-li-border px-2.5 py-1.5 text-sm focus:outline-none focus:border-li-blue"
        />
        {range && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-gray-500 hover:text-red-600 hover:underline"
          >
            clear
          </button>
        )}
      </div>

      {config?.subLabel && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">{config.subLabel}:</label>
          {config.sub ? (
            <select
              value={sub}
              onChange={(e) => update({ sub: e.target.value })}
              className="rounded-md border border-li-border px-2 py-1 text-sm focus:outline-none focus:border-li-blue"
            >
              {config.sub.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={sub}
              onChange={(e) => update({ sub: e.target.value })}
              placeholder="code"
              className="w-24 rounded-md border border-li-border px-2 py-1 text-sm focus:outline-none focus:border-li-blue"
            />
          )}
        </div>
      )}

      {config?.hint && (
        <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-1">
          {config.hint}
        </p>
      )}
    </div>
  );
}
