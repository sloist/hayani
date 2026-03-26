import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import HorizontalGallery, { type GalleryHandle } from '../components/HorizontalGallery';
import ProductCard from '../components/ProductCard';
import FooterSlide from '../components/FooterSlide';
import BoxIndicator from '../components/BoxIndicator';
import ProductModal from '../components/ProductModal';

function HomeSlide({ onAdminAccess, onNext }: { onAdminAccess: () => void; onNext: () => void }) {
  const clickCount = useRef(0);
  const clickTimer = useRef(0);

  function handleClick() {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);

    if (clickCount.current >= 6) {
      clickCount.current = 0;
      onAdminAccess();
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      if (clickCount.current === 1) {
        onNext();
      }
      clickCount.current = 0;
    }, 300);
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={handleClick}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 400,
          letterSpacing: '0.16em',
          color: 'var(--text)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '20px',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
        }}
      >
        HAYANI
      </button>
    </div>
  );
}

export default function Main() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const galleryRef = useRef<GalleryHandle>(null);
  const navigate = useNavigate();

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
    sessionStorage.setItem('hayani_slide', String(index));
  }, []);
  const savedIndex = Number(sessionStorage.getItem('hayani_slide') || '0');

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleAdminAccess = useCallback(() => {
    navigate('/admin/login');
  }, [navigate]);

  const handleLogoNext = useCallback(() => {
    galleryRef.current?.scrollTo(1);
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', backgroundColor: 'var(--bg)' }} />;
  }

  const slides = [
    <HomeSlide key="home" onAdminAccess={handleAdminAccess} onNext={handleLogoNext} />,
    ...products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onClick={() => setSelectedProduct(product)}
      />
    )),
    <FooterSlide key="footer" />,
  ];

  const lastIndex = slides.length - 1;
  const isProductSlide = currentIndex >= 1 && currentIndex <= products.length;
  const showOverlay = currentIndex > 0 && currentIndex < lastIndex;

  return (
    <>
      {/* BOX + indicator with fade */}
      <div style={{
        opacity: showOverlay ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: showOverlay ? 'auto' : 'none',
      }}>
        <BoxIndicator />
      </div>

      <HorizontalGallery ref={galleryRef} initialIndex={savedIndex} onIndexChange={handleIndexChange}>
        {slides}
      </HorizontalGallery>

      {/* Page indicator — fade with products */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', zIndex: 50,
        opacity: isProductSlide ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        {products.map((_, i) => (
          <div key={i} style={{
            width: currentIndex === i + 1 ? '20px' : '8px', height: '1px',
            backgroundColor: currentIndex === i + 1 ? 'var(--text)' : 'var(--border)',
            transition: 'all 0.4s ease',
            marginRight: i < products.length - 1 ? '4px' : '0',
          }} />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}
