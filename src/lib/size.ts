// Convert size labels to display numbers
// Sizes are ordered in the product's sizes array
// This maps common size names to their position number
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

export function sizeToNumber(size: string, sizes?: string[]): string {
  // If we have the full sizes array, use index
  if (sizes) {
    const idx = sizes.indexOf(size);
    if (idx >= 0) return String(idx + 1);
  }
  // Fallback: use common size ordering
  const idx = SIZE_ORDER.indexOf(size.toUpperCase());
  if (idx >= 0) return String(idx + 1);
  // If it's already a number, return as-is
  if (/^\d+$/.test(size)) return size;
  // Unknown: return as-is
  return size;
}

export function formatSizeQty(size: string, quantity: number, sizes?: string[]): string {
  return `${sizeToNumber(size, sizes)} · ${quantity}EA`;
}
