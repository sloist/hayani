import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';

const EMPTY_FORM = {
  code: '',
  name: '',
  price: 0,
  stock: 0,
  specs: '',
  sizes: '',
  image_url: '',
  sort_order: 0,
};

type ProductForm = typeof EMPTY_FORM;

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductForm>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/admin/login');
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });
    setProducts(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      code: p.code,
      name: p.name,
      price: p.price,
      stock: p.stock,
      specs: p.specs.join(', '),
      sizes: p.sizes.join(', '),
      image_url: p.image_url || '',
      sort_order: p.sort_order,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  async function handleSave() {
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      specs: form.specs.split(',').map(s => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      image_url: form.image_url.trim() || null,
      sort_order: Number(form.sort_order),
    };

    if (!payload.code || !payload.name) {
      alert('코드와 이름은 필수입니다.');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);
      if (error) { alert('수정 실패: ' + error.message); return; }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(payload);
      if (error) { alert('추가 실패: ' + error.message); return; }
    }

    closeForm();
    fetchProducts();
  }

  async function handleDelete(p: Product) {
    if (!confirm(`"${p.name}" 상품을 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    fetchProducts();
  }

  async function handleToggleActive(p: Product) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !p.is_active })
      .eq('id', p.id);
    if (error) { alert('변경 실패: ' + error.message); return; }
    fetchProducts();
  }

  function onField(key: keyof ProductForm, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const formatPrice = (p: number) => `${p.toLocaleString('ko-KR')}`;

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--text2)',
    marginBottom: '4px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 0',
    fontSize: '13px',
    fontWeight: 300,
    border: 'none',
    borderBottom: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const btnStyle: React.CSSProperties = {
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--text2)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  return (
    <div style={{ padding: '40px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '48px',
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
          <Link to="/" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '16px',
            fontWeight: 300,
            letterSpacing: '0.12em',
            color: 'var(--text2)',
          }}>
            HAYANI
          </Link>
          <span className="label">Products</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
          <Link to="/admin" style={btnStyle}>Orders</Link>
          <button onClick={handleLogout} style={btnStyle}>Logout</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
          {products.length}개 상품
        </span>
        <button onClick={openAdd} style={{
          ...btnStyle,
          borderBottom: '1px solid var(--text2)',
          paddingBottom: '4px',
        }}>
          + Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
          onClick={closeForm}
        >
          <div
            style={{
              background: 'var(--bg, #fff)',
              padding: '40px',
              maxWidth: '480px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ marginBottom: '32px' }}>
              <span className="label">{editingId ? 'Edit Product' : 'New Product'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={labelStyle}>Code</div>
                <input style={inputStyle} value={form.code}
                  onChange={e => onField('code', e.target.value)} placeholder="HY-001" />
              </div>
              <div>
                <div style={labelStyle}>Name</div>
                <input style={inputStyle} value={form.name}
                  onChange={e => onField('name', e.target.value)} placeholder="상품명" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Price</div>
                  <input style={inputStyle} type="number" value={form.price}
                    onChange={e => onField('price', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Stock</div>
                  <input style={inputStyle} type="number" value={form.stock}
                    onChange={e => onField('stock', Number(e.target.value))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Sort Order</div>
                  <input style={inputStyle} type="number" value={form.sort_order}
                    onChange={e => onField('sort_order', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <div style={labelStyle}>Specs (comma-separated)</div>
                <input style={inputStyle} value={form.specs}
                  onChange={e => onField('specs', e.target.value)}
                  placeholder="면 100%, 핸드메이드" />
              </div>
              <div>
                <div style={labelStyle}>Sizes (comma-separated)</div>
                <input style={inputStyle} value={form.sizes}
                  onChange={e => onField('sizes', e.target.value)}
                  placeholder="S, M, L, XL" />
              </div>
              <div>
                <div style={labelStyle}>Image URL</div>
                <input style={inputStyle} value={form.image_url}
                  onChange={e => onField('image_url', e.target.value)}
                  placeholder="https://..." />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              marginTop: '32px',
            }}>
              <button onClick={closeForm} style={btnStyle}>Cancel</button>
              <button onClick={handleSave} style={{
                ...btnStyle,
                color: 'var(--text)',
                borderBottom: '1px solid var(--text)',
                paddingBottom: '4px',
              }}>
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <span className="label">Loading</span>
      ) : products.length === 0 ? (
        <span style={{ fontSize: '13px', color: 'var(--text3)' }}>상품이 없습니다.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 100px 60px 60px 120px',
            gap: '12px',
            padding: '8px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Code', 'Name', 'Price', 'Stock', 'Active', ''].map(h => (
              <span key={h} style={labelStyle}>{h}</span>
            ))}
          </div>

          {products.map(p => (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 100px 60px 60px 120px',
                gap: '12px',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                opacity: p.is_active ? 1 : 0.4,
                transition: 'opacity 0.2s ease',
              }}
            >
              <span style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                {p.code}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 300 }}>
                {p.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                {formatPrice(p.price)}
              </span>
              <span style={{ fontSize: '11px', color: p.stock <= 0 ? '#c44' : 'var(--text2)', fontFamily: 'monospace' }}>
                {p.stock}
              </span>
              <button
                onClick={() => handleToggleActive(p)}
                style={{
                  fontSize: '10px',
                  letterSpacing: '1px',
                  color: p.is_active ? 'var(--text2)' : 'var(--text3)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {p.is_active ? 'ON' : 'OFF'}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => openEdit(p)} style={btnStyle}>Edit</button>
                <button onClick={() => handleDelete(p)} style={{ ...btnStyle, color: 'var(--text3)' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
