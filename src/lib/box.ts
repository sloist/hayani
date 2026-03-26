export interface BoxItem {
  productId: string;
  code: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

const STORAGE_KEY = 'hayani_box';

export function getBox(): BoxItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getBoxCount(): number {
  return getBox().reduce((sum, item) => sum + item.quantity, 0);
}

export function addToBox(item: BoxItem): void {
  const box = getBox();
  const existing = box.find(
    b => b.productId === item.productId && b.size === item.size,
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    box.push(item);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(box));
  window.dispatchEvent(new Event('box-change'));
}

export function removeFromBox(productId: string, size: string): void {
  const box = getBox().filter(
    b => !(b.productId === productId && b.size === size),
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(box));
  window.dispatchEvent(new Event('box-change'));
}

export function clearBox(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('box-change'));
}
