export type SelectionMode = "INCLUDED" | "EXCLUDED";

export type SearchKind = "people" | "company";

/** A single value inside a list filter. `id` omitted => free-text value. */
export interface FilterValue {
  id?: string;
  text: string;
  mode: SelectionMode;
}

export interface RangeValue {
  min: number;
  max: number;
}

/**
 * A filter is either a list filter (values:List(...)) or a range filter
 * (rangeValue:(min,max)[,selectedSubFilter:token]).
 */
export interface Filter {
  type: string;
  /** list-filter values; mutually exclusive with `range`. */
  values?: FilterValue[];
  /** range-filter bounds; mutually exclusive with `values`. */
  range?: RangeValue;
  /** optional bare token appended after a range (e.g. "USD", dept code "1"). */
  sub?: string;
  /** when true, append parent:(id:0) inside each value (CURRENT/PAST_COMPANY). */
  parent?: boolean;
}

export interface SearchModel {
  kind: SearchKind;
  keywords: string;
  filters: Filter[];
  /** "?" or "#" — both accepted by Sales Nav; default "?". */
  prefix?: "?" | "#";
}
