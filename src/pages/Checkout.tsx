import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, generateOrderNumber } from '../lib/supabase';
import { getCounter, clearCounter, type CounterItem } from '../lib/counter';
import type { OrderFormData } from '../types';
import BackButton from '../components/BackButton';
import StepIndicator from '../components/StepIndicator';

const SHIPPING_FEE = 4000;
const CUSTOMER_KEY = 'hayani_customer';

function loadCustomer(): OrderFormData {
  try { const raw = localStorage.getItem(CUSTOMER_KEY); if (raw) return JSON.parse(raw); } catch {}
  return { customer_email: '', customer_name: '', customer_phone: '', customer_address: '', customer_address_detail: '', delivery_memo: '', depositor_name: '' };
}
function saveCustomer(form: OrderFormData) { localStorage.setItem(CUSTOMER_KEY, JSON.stringify(form)); }

export default function Checkout() {
  const navigate = useNavigate();
  const [items] = useState<CounterItem[]>(getCounter);
  const [form, setForm] = useState<OrderFormData>(loadCustomer);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const stripName = (n: string) => n.replace(/^HAYANI\s*/i, '');

  useEffect(() => { if (items.length === 0) navigate('/counter'); }, [items, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current || submitting || items.length === 0) return;

    // Rate limit: 1 order per 30 seconds
    const lastOrder = Number(sessionStorage.getItem('hayani_last_order') || '0');
    if (Date.now() - lastOrder < 30000) { alert('잠시 후 다시 시도해주세요.'); return; }

    const required = ['customer_email', 'customer_name', 'customer_phone', 'customer_address', 'depositor_name'] as const;
    for (const f of required) if (!form[f].trim()) return;

    submittedRef.current = true;
    setSubmitting(true);
    sessionStorage.setItem('hayani_last_order', String(Date.now()));

    try {
      const orderNumber = await generateOrderNumber();

      let serverSubtotal = 0;
      for (const item of items) {
        const { data: prod, error: fetchErr } = await supabase.from('products').select('stock, stock_by_size, price, is_active').eq('id', item.productId).single();
        if (fetchErr || !prod) throw new Error(`${item.name} 상품 정보를 확인할 수 없습니다.`);
        if (!prod.is_active) throw new Error(`${item.name}은(는) 현재 판매 중이 아닙니다.`);
        if (prod.stock < item.quantity) throw new Error(`${item.name} 재고가 부족합니다.`);
        if (prod.stock_by_size && prod.stock_by_size[item.size] !== undefined) {
          if (prod.stock_by_size[item.size] < item.quantity) throw new Error(`${item.name} 재고가 부족합니다.`);
        }
        serverSubtotal += prod.price * item.quantity;
      }
      const serverTotal = serverSubtotal + SHIPPING_FEE;

      const orderItems = items.map(item => ({
        product_id: item.productId, code: item.code, name: item.name,
        size: item.size, size_display: item.sizeDisplay || item.size,
        price: item.price, quantity: item.quantity, image_url: item.imageUrl,
      }));

      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber, items: orderItems, subtotal: serverSubtotal, shipping_fee: SHIPPING_FEE, total_price: serverTotal,
        customer_email: form.customer_email.trim(), customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(), customer_address: form.customer_address.trim(),
        customer_address_detail: form.customer_address_detail.trim() || null,
        delivery_memo: null, depositor_name: form.depositor_name.trim(),
        status: 'pending',
      });
      if (error) throw error;

      for (const item of items) {
        const { data: cur, error: fe } = await supabase.from('products').select('stock, stock_by_size').eq('id', item.productId).single();
        if (fe || !cur) continue;
        const upd: Record<string, unknown> = { stock: Math.max(0, cur.stock - item.quantity) };
        if (cur.stock_by_size && cur.stock_by_size[item.size] !== undefined) {
          upd.stock_by_size = { ...cur.stock_by_size, [item.size]: Math.max(0, cur.stock_by_size[item.size] - item.quantity) };
        }
        await supabase.from('products').update(upd).eq('id', item.productId);
      }

      saveCustomer(form);
      clearCounter();
      sessionStorage.setItem('hayani_order_total', String(serverTotal));
      navigate(`/counter/complete?order_number=${orderNumber}`);
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      alert(err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다.');
    }
  }

  if (items.length === 0) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 0', border: 'none', borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent', fontSize: '14px', fontWeight: 400, color: 'var(--text)', outline: 'none',
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 24px 60px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <BackButton to="/counter" />
        <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <StepIndicator current={2} />
        </div>
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)' }}>2 / 3</span>
      </div>

      {/* Summary */}
      <div style={{ paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {items.map((item, i) => (
          <div key={`${item.productId}-${item.size}`} style={{ marginBottom: i < items.length - 1 ? '10px' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 400 }}>{stripName(item.name)}</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '1px', fontWeight: 300 }}>
              Size {item.sizeDisplay || item.size} · {item.quantity}EA
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300 }}>Shipping</span>
          <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300 }}>{formatPrice(SHIPPING_FEE)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatPrice(total)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <span className="label" style={{ marginBottom: '14px', display: 'block' }}>Details</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <input name="customer_email" type="email" placeholder="Email" value={form.customer_email} onChange={handleChange} required style={inputStyle} />
          <input name="customer_name" placeholder="이름" value={form.customer_name} onChange={handleChange} required style={inputStyle} />
          <input name="customer_phone" placeholder="연락처" value={form.customer_phone} onChange={handleChange} required style={inputStyle} />
          <input name="customer_address" placeholder="주소" value={form.customer_address} onChange={handleChange} required style={inputStyle} />
          <input name="customer_address_detail" placeholder="상세주소" value={form.customer_address_detail} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ padding: '16px', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <span className="label" style={{ marginBottom: '12px', display: 'block' }}>Payment</span>
          <div style={{ fontSize: '13px', fontWeight: 300, lineHeight: '1.8' }}>
            <div>카카오뱅크</div>
            <div style={{ color: 'var(--text2)' }}>계좌번호 안내 예정</div>
            <div style={{ fontSize: '11px', color: 'var(--text2)' }}>예금주: 하야니</div>
          </div>
        </div>

        <input name="depositor_name" placeholder="입금자명" value={form.depositor_name} onChange={handleChange} required style={{ ...inputStyle, marginBottom: '12px' }} />
        <p style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 300, marginBottom: '24px' }}>
          Unpaid orders are cancelled after 24 hours.
        </p>

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: '14px 0',
          backgroundColor: submitting ? 'var(--border)' : 'var(--text)',
          color: submitting ? 'var(--text3)' : 'var(--bg)',
          fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 500,
          border: 'none', cursor: submitting ? 'default' : 'pointer',
        }}>
          {submitting ? 'Processing...' : 'Complete'}
        </button>
      </form>
    </div>
  );
}
