import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import HorizontalGallery from '../components/HorizontalGallery';
import ProductCard from '../components/ProductCard';
import FooterSlide from '../components/FooterSlide';

function HomeSlide({ onAdminAccess }: { onAdminAccess: () => void }) {
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
      clickCount.current = 0;
    }, 400);
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
          fontWeight: 300,
          letterSpacing: '0.16em',
          color: 'var(--text)',
          background: 'none',
          border: 'none',
          cursor: 'default',
          padding: '20px',
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
  const navigate = useNavigate();

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

  if (loading) {
    return <div style={{ height: '100vh', backgroundColor: 'var(--bg)' }} />;
  }

  // Repeat products 3 times for loop feel, then footer
  const repeatedProducts = [...products, ...products, ...products];

  const slides = [
    <HomeSlide key="home" onAdminAccess={handleAdminAccess} />,
    ...repeatedProducts.map((product, i) => (
      <ProductCard
        key={`${product.id}-${i}`}
        product={product}
        onClick={() => navigate(`/wear/${product.id}`)}
      />
    )),
    <FooterSlide key="footer" />,
  ];

  return (
    <HorizontalGallery initialIndex={0}>
      {slides}
    </HorizontalGallery>
  );
}
