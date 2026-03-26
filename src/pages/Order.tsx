import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, generateOrderNumber } from '../lib/supabase';
import type { Product, OrderFormData } from '../types';

const SHIPPING_FEE = 4000;

interface OrderItem {
  product: Product;
  size: string;
}

export default function Order() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const [form, setForm] = useState<OrderFormData>({
    customer_email: '', customer_name: '', customer_phone: '',
    customer_address: '', customer_address_detail: '', delivery_memo: '', depositor_name: '',
  });

  useEffect(() => {
    async function load() {
      // Single item order
      const productId = searchParams.get('product_id');
      const size = searchParams.get('size');
      if (!productId || !size) { navigate('/'); return; }

      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      if (!data || data.stock <= 0) { navigate('/'); return; }
      setOrderItems([{ product: data, size }]);
      setLoading(false);
    }
    load();
  }, [searchParams, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current || submitting || orderItems.length === 0) return;
    const required = ['customer_email', 'customer_name', 'customer_phone', 'customer_address', 'depositor_name'] as const;
    for (const f of required) if (!form[f].trim()) return;

    submittedRef.current = true;
    setSubmitting(true);

    try {
      const orderNumber = await generateOrderNumber();

      for (const item of orderItems) {
        const { data: cur } = await supabase.from('products').select('stock').eq('id', item.product.id).single();
        if (!cur || cur.stock <= 0) continue;

        await supabase.from('products').update({ stock: cur.stock - 1 }).eq('id', item.product.id);

        const itemOrderNumber = orderItems.length > 1
          ? `${orderNumber}-${orderItems.indexOf(item) + 1}`
          : orderNumber;

        const { error } = await supabase.from('orders').insert({
          order_number: itemOrderNumber, product_id: item.product.id, size: item.size, quantity: 1,
          total_price: item.product.price + (orderItems.indexOf(item) === 0 ? SHIPPING_FEE : 0),
          customer_email: form.customer_email.trim(), customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(), customer_address: form.customer_address.trim(),
          customer_address_detail: form.customer_address_detail.trim() || null,
          delivery_memo: form.delivery_memo.trim() || null, depositor_name: form.depositor_name.trim(),
          status: 'pending',
        });

        if (error) {
          await supabase.from('products').update({ stock: cur.stock }).eq('id', item.product.id);
          throw error;
        }
      }

      navigate(`/order/complete?order_number=${orderNumber}`);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  }

  if (loading) return <div style={{ minHeight: '100vh' }} />;
  if (orderItems.length === 0) return null;

  const formatPrice = (p: number) => `\u20A9${p.toLocaleString('ko-KR')}`;
  const subtotal = orderItems.reduce((sum, i) => sum + i.product.price, 0);
  const total = subtotal + SHIPPING_FEE;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent', fontSize: '13px', fontWeight: 300, color: 'var(--text)', outline: 'none',
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '100px 40px 80px' }}>
      <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <button
          onClick={handleBack}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            fontWeight: 300,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text2)',
            padding: '0',
          }}
        >
          &larr;
        </button>
        <span className="label">Order</span>
      </div>

      {/* Summary */}
      <div style={{ paddingBottom: '32px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        {orderItems.map((item, i) => (
          <div key={`${item.product.id}-${item.size}-${i}`} style={{ marginBottom: i < orderItems.length - 1 ? '16px' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 300 }}>{item.product.name}</span>
              <span style={{ fontSize: '13px', fontWeight: 300 }}>{formatPrice(item.product.price)}</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '2px' }}>
              {item.product.code} / {item.size} / 1
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>배송비</span>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{formatPrice(SHIPPING_FEE)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 400 }}>합계</span>
          <span style={{ fontSize: '13px', fontWeight: 400 }}>{formatPrice(total)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <span className="label" style={{ marginBottom: '24px', display: 'block' }}>주문 정보</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          <input name="customer_email" type="email" placeholder="이메일" value={form.customer_email} onChange={handleChange} required style={inputStyle} />
          <input name="customer_name" placeholder="이름" value={form.customer_name} onChange={handleChange} required style={inputStyle} />
          <input name="customer_phone" placeholder="연락처" value={form.customer_phone} onChange={handleChange} required style={inputStyle} />
          <input name="customer_address" placeholder="주소" value={form.customer_address} onChange={handleChange} required style={inputStyle} />
          <input name="customer_address_detail" placeholder="상세주소" value={form.customer_address_detail} onChange={handleChange} style={inputStyle} />
          <input name="delivery_memo" placeholder="배송메모" value={form.delivery_memo} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={{ padding: '24px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <span className="label" style={{ marginBottom: '16px', display: 'block' }}>무통장입금</span>
          <div style={{ fontSize: '13px', fontWeight: 300, lineHeight: '2' }}>
            <div>카카오뱅크</div>
            <div style={{ color: 'var(--text2)' }}>계좌번호 안내 예정</div>
            <div>예금주: 하야니</div>
          </div>
        </div>

        <input name="depositor_name" placeholder="입금자명" value={form.depositor_name} onChange={handleChange} required style={{ ...inputStyle, marginBottom: '16px' }} />
        <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 200, marginBottom: '40px', lineHeight: '1.8' }}>
          24시간 이내 미입금 시 자동 취소됩니다.
        </p>

        <button type="submit" disabled={submitting} style={{
          width: '100%', padding: '16px 0',
          backgroundColor: submitting ? 'var(--border)' : 'var(--text)',
          color: submitting ? 'var(--text3)' : 'var(--bg)',
          fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 300,
        }}>
          {submitting ? 'Processing' : '주문 완료'}
        </button>
      </form>
    </div>
  );
}
