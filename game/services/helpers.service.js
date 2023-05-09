export function groupBy(array, key) {
  const groupedMap = new Map();
  for (const el of array) {
    if (!groupedMap.has(el[key])) {
      groupedMap.set(el[key], []);
    }
    groupedMap.get(el[key]).push(el);
  }

  return Array.from(groupedMap)
}