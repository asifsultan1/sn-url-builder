import type { SearchModel } from "./types";
import { buildUrl } from "./encoder";

/** List filters with more than one value, sorted by count desc. */
export function getSplittableFilters(
  model: SearchModel
): Array<{ type: string; count: number }> {
  return model.filters
    .filter((f) => f.values && f.values.length > 1)
    .map((f) => ({ type: f.type, count: f.values!.length }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Split a model on one filter type: the target filter's values are chunked
 * into groups of `chunkSize`; every other filter is cloned unchanged into
 * each output model.
 */
export function splitModel(
  model: SearchModel,
  filterType: string,
  chunkSize: number
): SearchModel[] {
  const target = model.filters.find((f) => f.type === filterType);
  if (!target?.values || target.values.length <= chunkSize) return [model];

  const others = model.filters.filter((f) => f.type !== filterType);
  const results: SearchModel[] = [];

  for (let i = 0; i < target.values.length; i += chunkSize) {
    results.push({
      ...model,
      filters: [...others, { ...target, values: target.values.slice(i, i + chunkSize) }],
    });
  }
  return results;
}

/**
 * Split a model so each output URL stays at or under `maxLength` characters.
 * Values are added greedily one by one; a new chunk starts the moment adding
 * the next value would push the URL over the limit.
 */
export function splitModelByLength(
  model: SearchModel,
  filterType: string,
  maxLength: number
): SearchModel[] {
  const target = model.filters.find((f) => f.type === filterType);
  if (!target?.values || !target.values.length) return [model];

  const others = model.filters.filter((f) => f.type !== filterType);
  const results: SearchModel[] = [];
  let remaining = [...target.values];

  while (remaining.length > 0) {
    const chunk: typeof remaining = [];

    for (let i = 0; i < remaining.length; i++) {
      const testModel: SearchModel = {
        ...model,
        filters: [...others, { ...target, values: [...chunk, remaining[i]] }],
      };
      if (buildUrl(testModel).length > maxLength && chunk.length > 0) break;
      chunk.push(remaining[i]);
    }

    // Guard: if even a single value exceeds the limit, force-include it
    if (chunk.length === 0) chunk.push(remaining[0]);

    remaining = remaining.slice(chunk.length);
    results.push({
      ...model,
      filters: [...others, { ...target, values: chunk }],
    });
  }

  return results;
}
