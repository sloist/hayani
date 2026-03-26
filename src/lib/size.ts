// Convert size label to display number based on product's sizes array position
export function sizeToNumber(size: string, sizes?: string[]): string {
  if (sizes) {
    const idx = sizes.indexOf(size);
    if (idx >= 0) return String(idx + 1);
  }
  // If already a number, return as-is
  if (/^\d+$/.test(size)) return size;
  // No array provided — return as-is (fallback)
  return size;
}
