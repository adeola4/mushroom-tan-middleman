import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CtaSectionProps {
  onB2bOpen: () => void;
}

export default function CtaSection({ onB2bOpen }: CtaSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      ref={ref}
      className="cta-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7 }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(179,57,57,0.06) 0%, transparent 60%)',
          animation: 'sporeFloat3 12s ease-in-out infinite'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="cta-content">
          <motion.h2
            className="cta-title"
            initial={{ opacity: 0, y: 25, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Ready to place an order?
          </motion.h2>
          <motion.p
            className="cta-desc"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Request a quote and receive pricing within one business day. Volume discounts available.
          </motion.p>
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={onB2bOpen}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(179,57,57,0.25)' }}
            whileTap={{ scale: 0.97 }}
          >
            Request a Quote <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>

      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="spore"
          style={{
            width: 2 + (i % 2) * 2,
            height: 2 + (i % 2) * 2,
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(250,250,248,0.08)',
            pointerEvents: 'none'
          }}
          initial={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 18}%`
          }}
          animate={{
            y: [0, -20, 10, -5, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.05, 0.12, 0.08, 0.12, 0.05]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5
          }}
        />
      ))}
    </motion.section>
  );
}
