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

  const handleLogoClick = useCallback(() => {
    setGalleryKey(k => k + 1);
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', backgroundColor: 'var(--bg)' }} />;
  }

  // Repeat products 3 times for loop feel, then footer
  const repeatedProducts = [...products, ...products, ...products];

  const slides = [
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
    <>
      <Header onLogoClick={handleLogoClick} />
      <HorizontalGallery key={galleryKey} initialIndex={0}>
        {slides}
      </HorizontalGallery>
    </>
  );
}
