import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, generateOrderNumber } from '../lib/supabase';
import type { Product, OrderFormData } from '../types';
import PageTransition from '../components/PageTransition';

const SHIPPING_FEE = 4000;

export default function Order() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const productId = searchParams.get('product_id');
  const size = searchParams.get('size');

  const [form, setForm] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_address_detail: '',
    delivery_memo: '',
    depositor_name: '',
  });

  useEffect(() => {
    if (!productId || !size) {
      navigate('/wear');
      return;
    }

    async function fetch() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!data || data.stock <= 0) {
        navigate('/wear');
        return;
      }
      setProduct(data);
      setLoading(false);
    }
    fetch();
  }, [productId, size, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current || submitting || !product || !size) return;

    const required = ['customer_name', 'customer_phone', 'customer_address', 'depositor_name'] as const;
    for (const field of required) {
      if (!form[field].trim()) return;
    }

    submittedRef.current = true;
    setSubmitting(true);

    try {
      const orderNumber = await generateOrderNumber();
      const totalPrice = product.price + SHIPPING_FEE;

      // Deduct stock
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product.id)
        .single();

      if (!currentProduct || currentProduct.stock <= 0) {
        alert('품절된 상품입니다.');
        submittedRef.current = false;
        setSubmitting(false);
        navigate('/wear');
        return;
      }

      await supabase
        .from('products')
        .update({ stock: currentProduct.stock - 1 })
        .eq('id', product.id);

      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        product_id: product.id,
        size,
        quantity: 1,
        total_price: totalPrice,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_address: form.customer_address.trim(),
        customer_address_detail: form.customer_address_detail.trim() || null,
        delivery_memo: form.delivery_memo.trim() || null,
        depositor_name: form.depositor_name.trim(),
        status: 'pending',
      });

      if (error) {
        // Restore stock on failure
        await supabase
          .from('products')
          .update({ stock: currentProduct.stock })
          .eq('id', product.id);
        throw error;
      }

      navigate('/order/complete');
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  }

  const formatPrice = (price: number) =>
    `₩${price.toLocaleString('ko-KR')}`;

  if (loading) return <div style={{ minHeight: '100vh' }} />;
  if (!product) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: 300,
    color: 'var(--text)',
    outline: 'none',
  };

  return (
    <PageTransition>
      <div style={{
        paddingTop: '120px',
        maxWidth: '520px',
        margin: '0 auto',
        padding: '120px 40px 80px',
      }}>
        <span className="label" style={{ marginBottom: '48px', display: 'block' }}>
          Order
        </span>

        {/* Order summary */}
        <div style={{
          paddingBottom: '32px',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 300 }}>{product.name}</span>
            <span style={{ fontSize: '13px', fontWeight: 300 }}>{formatPrice(product.price)}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text2)', letterSpacing: '2px' }}>
            {product.code} / {size} / 1
          </span>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text2)' }}>배송비</span>
            <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{formatPrice(SHIPPING_FEE)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 400 }}>합계</span>
            <span style={{ fontSize: '13px', fontWeight: 400 }}>{formatPrice(product.price + SHIPPING_FEE)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Shipping info */}
          <span className="label" style={{ marginBottom: '24px', display: 'block' }}>
            배송 정보
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            <input
              name="customer_name"
              placeholder="이름"
              value={form.customer_name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="customer_phone"
              placeholder="연락처"
              value={form.customer_phone}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="customer_address"
              placeholder="주소"
              value={form.customer_address}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="customer_address_detail"
              placeholder="상세주소"
              value={form.customer_address_detail}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="delivery_memo"
              placeholder="배송메모"
              value={form.delivery_memo}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* Payment info */}
          <div style={{
            padding: '24px',
            border: '1px solid var(--border)',
            marginBottom: '24px',
          }}>
            <span className="label" style={{ marginBottom: '16px', display: 'block' }}>
              무통장입금
            </span>
            <div style={{ fontSize: '13px', fontWeight: 300, lineHeight: '2' }}>
              <div>카카오뱅크</div>
              <div style={{ color: 'var(--text2)' }}>계좌번호 안내 예정</div>
              <div>예금주: 하야니</div>
            </div>
          </div>

          <input
            name="depositor_name"
            placeholder="입금자명"
            value={form.depositor_name}
            onChange={handleChange}
            required
            style={{ ...inputStyle, marginBottom: '16px' }}
          />

          <p style={{
            fontSize: '11px',
            color: 'var(--text3)',
            fontWeight: 200,
            marginBottom: '40px',
            lineHeight: '1.8',
          }}>
            24시간 이내 미입금 시 자동 취소됩니다.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '16px 0',
              backgroundColor: submitting ? 'var(--border)' : 'var(--text)',
              color: submitting ? 'var(--text3)' : 'var(--bg)',
              fontSize: '10px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: 300,
              transition: 'opacity 0.3s ease',
            }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {submitting ? 'Processing' : '주문 완료'}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
