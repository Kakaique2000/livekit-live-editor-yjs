/**
 * Simple deterministic hash function (djb2 algorithm)
 * Produces consistent 32-bit hash for the same input
 */
function hash32(data: Uint8Array): number {
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) ^ data[i]; // hash * 33 ^ c
  }
  return hash >>> 0; // Convert to unsigned 32-bit
}

export function pickFromArrayBySeed<T>(seed: string, arr: T[]): T {
  const data = new TextEncoder().encode(seed);
  const hashValue = hash32(data);
  const idx = hashValue % arr.length;
  return arr[idx];
}
