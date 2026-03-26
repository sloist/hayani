import { useRef, useEffect, useCallback, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode[];
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
}

export default function HorizontalGallery({ children, onIndexChange, initialIndex = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const currentIndex = useRef(initialIndex);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [showHint, setShowHint] = useState(true);

  const slideCount = children.length;
  const slideWidth = 72;
  const peekWidth = 14;

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

  // Initial scroll
  useEffect(() => {
    if (initialIndex > 0) {
      setTimeout(() => scrollToIndex(initialIndex, false), 50);
    }
  }, [initialIndex, scrollToIndex]);

  // Hide hint after first interaction
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [showHint]);

  // Wheel handler
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
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        setShowHint(false);
        scrollToIndex(currentIndex.current + (dx > 0 ? 1 : -1));
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollToIndex]);

  // Sync index on manual scroll end
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
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          height: '100vh',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Left padding for first slide centering */}
        <div style={{ flexShrink: 0, width: `${peekWidth}vw` }} />

        {children.map((child, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: `${slideWidth}vw`,
              height: '100vh',
              padding: '80px 8px 60px',
              scrollSnapAlign: 'center',
            }}
          >
            {child}
          </div>
        ))}

        {/* Right padding for last slide centering */}
        <div style={{ flexShrink: 0, width: `${peekWidth}vw` }} />
      </div>

      {/* Scroll hint */}
      {showHint && (
        <div
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.4,
            animation: 'fadeHint 2s ease-in-out infinite',
          }}
        >
          <span style={{
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--text2)',
            fontWeight: 300,
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
}
