import { motion, useInView, useAnimate } from 'framer-motion';
import { useEffect, useRef } from 'react';

function AnimatedNumber({ value, label }: { value: string | number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!inView || typeof value !== 'number') return;
    const controls = animate(scope.current, { opacity: [0.3, 1] }, { duration: 0.5 });
    return () => controls?.stop();
  }, [inView, value, animate, scope]);

  return (
    <div className="trust-item" ref={scope}>
      <motion.span
        ref={ref}
        className="trust-number"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.span>
      <span className="trust-label">{label}</span>
    </div>
  );
}

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      className="trust-bar"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container">
        <div className="trust-grid">
          <AnimatedNumber value="5-day" label="Standard lead time" />
          <div className="trust-divider" />
          <AnimatedNumber value={48} label="States served" />
          <div className="trust-divider" />
          <AnimatedNumber value="FDA" label="Registered facilities" />
          <div className="trust-divider" />
          <AnimatedNumber value="USDA" label="Organic certification available" />
        </div>
      </div>
    </motion.section>
  );
}
