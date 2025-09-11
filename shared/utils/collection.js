// Small collection helpers for common list operations

// Upsert by id or name selector; if idx provided, replace by index
export function upsertByIdOrName(list, item, { idKey = 'id', nameSelector, index = null } = {}) {
  if (!Array.isArray(list)) list = [];
  let updated = list;

  if (index != null) {
    updated = list.map((el, i) => (i === index ? item : el));
    return updated;
  }

  const hasId = item != null && Object.prototype.hasOwnProperty.call(item, idKey) && item[idKey] != null;
  const byIdIdx = hasId ? list.findIndex((el) => el?.[idKey] === item[idKey]) : -1;
  const targetName = typeof nameSelector === 'function' ? nameSelector(item) : undefined;
  const byNameIdx = byIdIdx === -1 && targetName
    ? list.findIndex((el) => (typeof nameSelector === 'function' ? nameSelector(el) : undefined) === targetName)
    : -1;

  if (byIdIdx !== -1) {
    updated = list.map((el, i) => (i === byIdIdx ? item : el));
  } else if (byNameIdx !== -1) {
    updated = list.map((el, i) => (i === byNameIdx ? item : el));
  } else {
    updated = [...list, item];
  }

  return updated;
}

// Remove elements by an ids array and key
export function removeByIds(list, ids, idKey = 'id') {
  if (!Array.isArray(list)) return [];
  if (!Array.isArray(ids) || ids.length === 0) return list;
  const set = new Set(ids);
  return list.filter((el) => !set.has(el?.[idKey]));
}

// Dedupe by arbitrary key selector
export function dedupeBy(list, keySelector) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const el of list) {
    const key = keySelector(el);
    if (key == null) continue;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(el);
    }
  }
  return out;
}

