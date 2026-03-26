export interface CounterItem {
  productId: string;
  code: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

const STORAGE_KEY = 'hayani_counter';
const EVENT_NAME = 'counter-change';

export function getCounter(): CounterItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCounterCount(): number {
  return getCounter().reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCounter(item: CounterItem): void {
  const list = getCounter();
  const existing = list.find(b => b.productId === item.productId && b.size === item.size);
  if (existing) { existing.quantity += item.quantity; }
  else { list.push(item); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function removeFromCounter(productId: string, size: string): void {
  const list = getCounter().filter(b => !(b.productId === productId && b.size === size));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearCounter(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}
