function escapeRegex(search: string) {
  return search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeString(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function standardizeString(str: string) {
  return escapeRegex(normalizeString(String(str)))
}
