import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const isHovering = useRef(false);
  const isVisible = useRef(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);

      if (!isVisible.current) {
        isVisible.current = true;
        document.body.style.cursor = 'none';
      }
    };

    const leave = () => {
      cursorX.set(-100);
      cursorY.set(-100);
      dotX.set(-100);
      dotY.set(-100);
      isVisible.current = false;
      document.body.style.cursor = 'auto';
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      isHovering.current =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.classList.contains('product-card') ||
        target.closest('.product-card') !== null;
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseover', handleHover);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: -12,
          left: -12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '1px solid rgba(24, 24, 24, 0.25)',
          pointerEvents: 'none',
          zIndex: 99999,
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      />
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: -3,
          left: -3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--text-dark)',
          pointerEvents: 'none',
          zIndex: 99999,
          x: dotX,
          y: dotY
        }}
      />
    </>
  );
}
