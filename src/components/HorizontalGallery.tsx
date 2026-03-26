import { useRef, useEffect, useCallback, type ReactNode } from 'react';

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

  const slideCount = children.length;
  // Each slide takes 75vw, with 12.5vw peek on each side
  const slideWidth = 75;
  const peekWidth = 12.5;

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            scrollSnapAlign: 'center',
          }}
        >
          {child}
        </div>
      ))}

      {/* Right padding for last slide centering */}
      <div style={{ flexShrink: 0, width: `${peekWidth}vw` }} />
    </div>
  );
}
