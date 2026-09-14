import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'var(--bg-main)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-dark)',
              letterSpacing: '-0.02em',
              marginBottom: '2.5rem'
            }}
          >
            MUSHROOM<span style={{ color: 'var(--primary)' }}>.</span>TAN
          </motion.span>

          <div
            style={{
              width: 120,
              height: 1,
              background: 'var(--border-color)',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--text-dark)',
                transformOrigin: 'left center'
              }}
            />
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              className="spore"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.06, 0] }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut'
              }}
              style={{
                width: 2 + (i % 3) * 1.5,
                height: 2 + (i % 3) * 1.5,
                position: 'absolute',
                top: `${30 + (i * 11) % 60}%`,
                left: `${20 + (i * 17) % 60}%`,
                background: 'var(--text-muted)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
