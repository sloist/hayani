export interface CollectItem {
  productId: string;
  size: string;
  addedAt: number;
}

const STORAGE_KEY = 'hayani_collect';

function getItems(): CollectItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveItems(items: CollectItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('collect-change'));
}

export function addToCollect(productId: string, size: string) {
  const items = getItems();
  const exists = items.some(i => i.productId === productId && i.size === size);
  if (!exists) {
    items.push({ productId, size, addedAt: Date.now() });
    saveItems(items);
  }
}

export function removeFromCollect(productId: string, size: string) {
  const items = getItems().filter(i => !(i.productId === productId && i.size === size));
  saveItems(items);
}

export function getCollect(): CollectItem[] {
  return getItems();
}

export function getCollectCount(): number {
  return getItems().length;
}

export function isCollected(productId: string, size: string): boolean {
  return getItems().some(i => i.productId === productId && i.size === size);
}
