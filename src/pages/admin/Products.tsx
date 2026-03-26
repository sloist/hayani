import { useEffect, useState, useRef, type FormEvent, type DragEvent, type ChangeEvent } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/admin/login'); return; }
      setAuthed(true);
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

  useEffect(() => { if (authed) fetchProducts(); }, [authed]);

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

  async function uploadImage(file: File, productId: string): Promise<string | null> {
    setUploading(true);
    const path = `products/${productId}/cover.webp`;

    const { error } = await supabase.storage
      .from('products')
      .upload(path, file, { upsert: true, contentType: file.type });

    setUploading(false);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return;

    // If editing, upload immediately and save to DB
    if (editingId) {
      const url = await uploadImage(file, editingId);
      if (url) {
        await supabase.from('products').update({ image_url: url }).eq('id', editingId);
        updateForm('image_url', url);
      }
    } else {
      // For new products, create a temporary preview via object URL
      // The actual upload will happen in handleSubmit after the product is created
      const previewUrl = URL.createObjectURL(file);
      updateForm('image_url', previewUrl);
      // Store the file for later upload
      pendingFileRef.current = file;
    }
  }

  const pendingFileRef = useRef<File | null>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be selected again
    e.target.value = '';
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
      image_url: form.image_url.startsWith('blob:') ? null : (form.image_url.trim() || null),
    };

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      const { data: newProduct } = await supabase.from('products').insert(payload).select().single();

      // Upload pending file for newly created product
      if (newProduct && pendingFileRef.current) {
        const url = await uploadImage(pendingFileRef.current, newProduct.id);
        if (url) {
          await supabase.from('products').update({ image_url: url }).eq('id', newProduct.id);
        }
        pendingFileRef.current = null;
      }
    }

    setModalOpen(false);
    setSaving(false);
    fetchProducts();
  }

  async function handleDelete(p: Product) {
    if (!confirm(`"${p.name}" 을(를) 삭제하시겠습니까?`)) return;
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

  if (!authed) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }} />;

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
          로그아웃
        </button>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <Link to="/admin" className="label" style={{ color: 'var(--text3)' }}>주문 관리</Link>
        <span className="label" style={{ color: 'var(--text)' }}>제품 관리</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{products.length}개 상품</span>
        <button
          onClick={openAdd}
          style={{
            fontSize: '11px',
            letterSpacing: '2px',
            padding: '8px 20px',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
          }}
        >
          제품 추가
        </button>
      </div>

      {/* Product list */}
      {loading ? (
        <p style={{ color: 'var(--text2)', fontSize: '13px' }}>로딩중...</p>
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
            letterSpacing: '3px',
            color: 'var(--text2)',
          }}>
            <span>코드</span>
            <span>이름</span>
            <span style={{ textAlign: 'right' }}>가격</span>
            <span style={{ textAlign: 'right' }}>재고</span>
            <span>상태</span>
            <span style={{ textAlign: 'right' }}></span>
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
                  color: p.is_active ? '#4a8' : 'var(--text3)',
                }}
              >
                {p.is_active ? '활성' : '비활성'}
              </button>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => openEdit(p)}
                  style={{ fontSize: '11px', color: 'var(--text2)', textDecoration: 'underline' }}
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  style={{ fontSize: '11px', color: '#c44', textDecoration: 'underline' }}
                >
                  삭제
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
              {editingId ? '제품 수정' : '제품 추가'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>코드</label>
                <input style={inputStyle} value={form.code} onChange={e => updateForm('code', e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>이름</label>
                <input style={inputStyle} value={form.name} onChange={e => updateForm('name', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>가격</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={e => updateForm('price', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>재고</label>
                  <input style={inputStyle} type="number" value={form.stock} onChange={e => updateForm('stock', e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>정렬순서</label>
                <input style={inputStyle} type="number" value={form.sort_order} onChange={e => updateForm('sort_order', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>스펙 (쉼표로 구분)</label>
                <input style={inputStyle} value={form.specs} onChange={e => updateForm('specs', e.target.value)} placeholder="예: Cotton, Regular fit" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>사이즈 (쉼표로 구분)</label>
                <input style={inputStyle} value={form.sizes} onChange={e => updateForm('sizes', e.target.value)} placeholder="예: S, M, L, XL" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px', display: 'block' }}>이미지</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--text)' : 'var(--border)'}`,
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: dragOver ? 'var(--bg2)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {uploading ? (
                    <p style={{ fontSize: '12px', color: 'var(--text2)' }}>업로드 중...</p>
                  ) : form.image_url ? (
                    <div>
                      <img
                        src={form.image_url}
                        alt="미리보기"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '160px',
                          objectFit: 'contain',
                          marginBottom: '8px',
                        }}
                      />
                      <p style={{ fontSize: '11px', color: 'var(--text2)' }}>클릭하거나 드래그하여 변경</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>클릭하거나 이미지를 드래그하세요</p>
                      <p style={{ fontSize: '11px', color: 'var(--text3)' }}>JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--text)',
                    color: 'var(--bg)',
                    fontSize: '12px',
                    letterSpacing: '2px',
                  }}
                >
                  {saving ? '...' : editingId ? '업데이트' : '저장'}
                </button>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); pendingFileRef.current = null; }}
                  style={{
                    padding: '12px 20px',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    letterSpacing: '2px',
                    color: 'var(--text2)',
                  }}
                >
                  닫기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
