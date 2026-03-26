import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle, type ReactNode } from 'react';

interface Props {
  children: ReactNode[];
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
}

export interface GalleryHandle {
  scrollTo: (index: number) => void;
}

function getSlideVw() {
  return window.innerWidth > 768 ? 42 : 88;
}

const HorizontalGallery = forwardRef<GalleryHandle, Props>(function HorizontalGallery({ children, onIndexChange, initialIndex = 0 }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const currentIndex = useRef(initialIndex);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [showHint, setShowHint] = useState(true);
  const [slideWidth, setSlideWidth] = useState(getSlideVw);

  const slideCount = children.length;
  const peekWidth = (100 - slideWidth) / 2;

  // Update on resize
  useEffect(() => {
    function onResize() {
      const newWidth = getSlideVw();
      setSlideWidth(prev => {
        if (prev !== newWidth) {
          // Re-snap to current index after resize
          setTimeout(() => {
            const el = containerRef.current;
            if (el) {
              const target = currentIndex.current * (window.innerWidth * newWidth / 100);
              el.scrollTo({ left: target, behavior: 'instant' });
            }
          }, 50);
        }
        return newWidth;
      });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, slideCount - 1));
    currentIndex.current = clamped;
    onIndexChange?.(clamped);

    const targetScroll = clamped * (window.innerWidth * slideWidth / 100);
    el.scrollTo({
      left: targetScroll,
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, [slideCount, slideWidth, onIndexChange]);

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => scrollToIndex(index),
  }), [scrollToIndex]);

  // Initial scroll — immediate, no flash
  useEffect(() => {
    if (initialIndex > 0) {
      const el = containerRef.current;
      if (el) {
        const target = initialIndex * (window.innerWidth * slideWidth / 100);
        el.scrollLeft = target;
        currentIndex.current = initialIndex;
        onIndexChange?.(initialIndex);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide hint
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [showHint]);

  // Wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (isScrolling.current) return;

      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 8) return;

      isScrolling.current = true;
      setShowHint(false);
      const dir = delta > 0 ? 1 : -1;
      scrollToIndex(currentIndex.current + dir);
      setTimeout(() => { isScrolling.current = false; }, 600);
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scrollToIndex]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setShowHint(false);
        scrollToIndex(currentIndex.current + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(currentIndex.current - 1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scrollToIndex]);

  // Touch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (isScrolling.current) return;
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        isScrolling.current = true;
        setShowHint(false);
        scrollToIndex(currentIndex.current + (dx > 0 ? 1 : -1));
        setTimeout(() => { isScrolling.current = false; }, 500);
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollToIndex]);

  // Sync index on scroll end
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timeout = 0;
    function onScroll() {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        const sw = window.innerWidth * slideWidth / 100;
        const idx = Math.round(el!.scrollLeft / sw);
        currentIndex.current = idx;
        onIndexChange?.(idx);
      }, 150);
    }
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [slideWidth, onIndexChange]);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <div
        ref={containerRef}
        style={{
          height: '100%',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div style={{ flexShrink: 0, width: `${peekWidth}vw` }} />

        {children.map((child, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: `${slideWidth}vw`,
              height: '100%',
              padding: '80px 8px 48px',
              scrollSnapAlign: 'center',
            }}
          >
            {child}
          </div>
        ))}

        <div style={{ flexShrink: 0, width: `${peekWidth}vw` }} />
      </div>

      {showHint && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeHint 2s ease-in-out infinite',
          }}
        >
          <span style={{
            fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
            color: 'var(--text2)', fontWeight: 300,
          }}>
            Scroll
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text2)' }}>→</span>
        </div>
      )}

      <style>{`
        @keyframes fadeHint {
          0%, 100% { opacity: 0.2; transform: translateX(0); }
          50% { opacity: 0.5; transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
});

export default HorizontalGallery;
