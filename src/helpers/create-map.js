export function createMap([map] = []) {
  map = map.replace(/(?:\n(?:\s*))+/g, '')

  return Array.from(map)
}
