import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';

interface ProductForm {
  code: string;
  name: string;
  price: string;
  stock: string;
  sort_order: string;
  specs: string;
  sizes: string;
  image_url: string;
}

const emptyForm: ProductForm = {
  code: '', name: '', price: '', stock: '', sort_order: '0', specs: '', sizes: '', image_url: '',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
    });
  }, [navigate]);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order');
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      code: p.code,
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      sort_order: String(p.sort_order),
      specs: p.specs.join(', '),
      sizes: p.sizes.join(', '),
      image_url: p.image_url || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      sort_order: Number(form.sort_order),
      specs: form.specs.split(',').map(s => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      image_url: form.image_url.trim() || null,
    };

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert(payload);
    }

    setModalOpen(false);
    setSaving(false);
    fetchProducts();
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await supabase.from('products').delete().eq('id', p.id);
    fetchProducts();
  }

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProducts();
  }

  function updateForm(field: keyof ProductForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 0',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '22px',
          fontWeight: 300,
          letterSpacing: '0.14em',
        }}>
          HAYANI
        </Link>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/admin/login'))} className="label" style={{ color: 'var(--text2)' }}>
          Logout
        </button>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Link to="/admin" className="label" style={{ color: 'var(--text3)' }}>Orders</Link>
        <span className="label" style={{ color: 'var(--text)' }}>Products</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{products.length}개 상품</span>
        <button
          onClick={openAdd}
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '8px 20px',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
          }}
        >
          Add Product
        </button>
      </div>

      {/* Product list */}
      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border)' }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 100px 60px 70px 120px',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: 'var(--bg2)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: 'var(--text2)',
          }}>
            <span>Code</span>
            <span>Name</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Stock</span>
            <span>Active</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {products.map(p => (
            <div key={p.id} style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 100px 60px 70px 120px',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'var(--bg)',
              fontSize: '13px',
              alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.code}</span>
              <span>{p.name}</span>
              <span style={{ textAlign: 'right' }}>{p.price.toLocaleString()}원</span>
              <span style={{ textAlign: 'right' }}>{p.stock}</span>
              <button
                onClick={() => toggleActive(p)}
                style={{
                  fontSize: '10px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: p.is_active ? '#4a8' : 'var(--text3)',
                }}
              >
                {p.is_active ? 'Active' : 'Off'}
              </button>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => openEdit(p)}
                  style={{ fontSize: '11px', color: 'var(--text2)', textDecoration: 'underline' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  style={{ fontSize: '11px', color: '#c44', textDecoration: 'underline' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            padding: '32px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <p className="label" style={{ marginBottom: '24px' }}>
              {editingId ? 'Edit Product' : 'Add Product'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Code</label>
                <input style={inputStyle} value={form.code} onChange={e => updateForm('code', e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Name</label>
                <input style={inputStyle} value={form.name} onChange={e => updateForm('name', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Price</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={e => updateForm('price', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Stock</label>
                  <input style={inputStyle} type="number" value={form.stock} onChange={e => updateForm('stock', e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Sort Order</label>
                <input style={inputStyle} type="number" value={form.sort_order} onChange={e => updateForm('sort_order', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Specs (comma-separated)</label>
                <input style={inputStyle} value={form.specs} onChange={e => updateForm('specs', e.target.value)} placeholder="e.g. Cotton, Regular fit" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Sizes (comma-separated)</label>
                <input style={inputStyle} value={form.sizes} onChange={e => updateForm('sizes', e.target.value)} placeholder="e.g. S, M, L, XL" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>Image URL</label>
                <input style={inputStyle} value={form.image_url} onChange={e => updateForm('image_url', e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--text)',
                    color: 'var(--bg)',
                    fontSize: '12px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  {saving ? '...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '12px 20px',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--text2)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
