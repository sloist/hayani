import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, generateOrderNumber } from '../lib/supabase';
import { getBox, clearBox, type BoxItem } from '../lib/box';
import { sizeToNumber } from '../lib/size';
import type { OrderFormData } from '../types';
import BackButton from '../components/BackButton';
import StepIndicator from '../components/StepIndicator';

const SHIPPING_FEE = 4000;
const CUSTOMER_KEY = 'hayani_customer';

function loadCustomer(): OrderFormData {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    customer_email: '', customer_name: '', customer_phone: '',
    customer_address: '', customer_address_detail: '', delivery_memo: '', depositor_name: '',
  };
}

function saveCustomer(form: OrderFormData) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(form));
}

export default function BoxOrder() {
  const navigate = useNavigate();
  const [box] = useState<BoxItem[]>(getBox);
  const [form, setForm] = useState<OrderFormData>(loadCustomer);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const stripName = (n: string) => n.replace(/^HAYANI\s*/i, '');

  useEffect(() => {
    if (box.length === 0) navigate('/box');
  }, [box, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const formatPrice = (p: number) => `₩${p.toLocaleString('ko-KR')}`;
  const subtotal = box.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current || submitting || box.length === 0) return;
    const required = ['customer_email', 'customer_name', 'customer_phone', 'customer_address', 'depositor_name'] as const;
    for (const f of required) if (!form[f].trim()) return;

    submittedRef.current = true;
    setSubmitting(true);

    try {
      const orderNumber = await generateOrderNumber();

      for (const item of box) {
        const { data: cur } = await supabase.from('products').select('stock').eq('id', item.productId).single();
        if (!cur || cur.stock < item.quantity) throw new Error(`${item.name} (${item.size}) 재고가 부족합니다.`);
      }
      for (const item of box) {
        const { data: cur } = await supabase.from('products').select('stock').eq('id', item.productId).single();
        if (cur) await supabase.from('products').update({ stock: cur.stock - item.quantity }).eq('id', item.productId);
      }

      const items = box.map(item => ({
        product_id: item.productId, code: item.code, name: item.name,
        size: item.size, price: item.price, quantity: item.quantity, image_url: item.imageUrl,
      }));

      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber, items, subtotal, shipping_fee: SHIPPING_FEE, total_price: total,
        customer_email: form.customer_email.trim(), customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(), customer_address: form.customer_address.trim(),
        customer_address_detail: form.customer_address_detail.trim() || null,
        delivery_memo: form.delivery_memo.trim() || null, depositor_name: form.depositor_name.trim(),
        status: 'pending',
      });
      if (error) throw error;

      saveCustomer(form);
      clearBox();
      navigate(`/box/complete?order_number=${orderNumber}&total=${total}`);
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      alert(err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다.');
    }
  }

  if (box.length === 0) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent', fontSize: '14px', fontWeight: 400, color: 'var(--text)', outline: 'none',
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackButton to="/box" />
        <StepIndicator current={2} />
        <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text2)', fontWeight: 400 }}>2 / 3</span>
      </div>

      {/* Summary */}
      <div style={{ paddingBottom: '28px', marginBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        {box.map((item, i) => (
          <div key={`${item.productId}-${item.size}`} style={{ marginBottom: i < box.length - 1 ? '14px' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '14px', fontWeight: 400 }}>{stripName(item.name)}</span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text3)', letterSpacing: '1px', fontWeight: 300 }}>
              Size {sizeToNumber(item.size)} · {item.quantity}EA
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 300 }}>Shipping</span>
          <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 300 }}>{formatPrice(SHIPPING_FEE)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{formatPrice(total)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <span className="label" style={{ marginBottom: '20px', display: 'block' }}>Details</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
          <input name="customer_email" type="email" placeholder="Email" value={form.customer_email} onChange={handleChange} required style={inputStyle} />
          <input name="customer_name" placeholder="이름" value={form.customer_name} onChange={handleChange} required style={inputStyle} />
          <input name="customer_phone" placeholder="연락처" value={form.customer_phone} onChange={handleChange} required style={inputStyle} />
          <input name="customer_address" placeholder="주소" value={form.customer_address} onChange={handleChange} required style={inputStyle} />
          <input name="customer_address_detail" placeholder="상세주소" value={form.customer_address_detail} onChange={handleChange} style={inputStyle} />
          <input name="delivery_memo" placeholder="Note" value={form.delivery_memo} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ padding: '24px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <span className="label" style={{ marginBottom: '16px', display: 'block' }}>Payment</span>
          <div style={{ fontSize: '14px', fontWeight: 300, lineHeight: '2' }}>
            <div>카카오뱅크</div>
            <div style={{ color: 'var(--text2)' }}>계좌번호 안내 예정</div>
            <div style={{ fontSize: '12px', color: 'var(--text2)' }}>예금주: 하야니</div>
          </div>
        </div>

        <input name="depositor_name" placeholder="입금자명" value={form.depositor_name} onChange={handleChange} required style={{ ...inputStyle, marginBottom: '16px' }} />
        <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 300, marginBottom: '40px', lineHeight: '1.8' }}>
          Unpaid orders are cancelled after 24 hours.
        </p>

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: '16px 0',
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
