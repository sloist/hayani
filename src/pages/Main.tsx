import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import Header from '../components/Header';
import HorizontalGallery from '../components/HorizontalGallery';
import ProductCard from '../components/ProductCard';
import FooterSlide from '../components/FooterSlide';

export default function Main() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryKey, setGalleryKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('Fetching products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (error) console.error('Supabase error:', error);
        console.log('Products:', data?.length);
        setProducts(data || []);
      } catch (e) {
        console.error('Fetch crashed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleLogoClick = useCallback(() => {
    setGalleryKey(k => k + 1);
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', backgroundColor: 'var(--bg)' }} />;
  }

  const slides = [
    // Slide 0: Home
    <div key="home" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '48px',
    }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(48px, 8vw, 96px)',
        fontWeight: 300,
        letterSpacing: '0.14em',
      }}>
        HAYANI
      </h1>
      <span style={{
        fontSize: '9px',
        letterSpacing: '5px',
        textTransform: 'uppercase',
        color: 'var(--text3)',
        fontWeight: 300,
      }}>
        Pre-Order — Summer 2026
      </span>
    </div>,

    // Product slides
    ...products.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        onClick={() => navigate(`/wear/${product.id}`)}
      />
    )),

    // Last slide: About + Footer
    <FooterSlide key="footer" />,
  ];

  return (
    <>
      <Header onLogoClick={handleLogoClick} />
      <HorizontalGallery key={galleryKey} initialIndex={0}>
        {slides}
      </HorizontalGallery>
    </>
  );
}
