import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Truck, FileText, ShieldCheck, Building2 } from 'lucide-react';
import { easeInOut } from '../utils/easing';

interface HeroProps {
  onB2bOpen: () => void;
}

export default function Hero({ onB2bOpen }: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.loop = true;
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }, []);
  const compress = useTransform(scrollY, [0, 400], [1, 0.85]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
  };

  const lineVariants = {
    hidden: { y: 40, opacity: 0, filter: 'blur(6px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: easeInOut }
    }
  };

  const fadeUpVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: easeInOut }
    }
  };

  const headline = "Wholesale mushroom supply for commercial partners.";
  const words = headline.split(' ');

  return (
    <motion.section
      ref={ref}
      className="hero-section"
      style={{ scale: compress, opacity: heroOpacity, y: heroY, transformOrigin: 'top center' }}
    >
      <div className="hero-bg-wrap">
        <video
          ref={videoRef}
          className="hero-bg-video"
          src="/background.mp4"
          poster="/background.png"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className="container">
        <div className="hero-layout">
          <motion.div
            className="hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="hero-title" style={{ overflow: 'hidden' }}>
              <motion.span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.15em' }}>
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={lineVariants}
                    style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                  >
                    {word}{' '}
                  </motion.span>
                ))}
              </motion.span>
            </h1>
            <motion.p
              className="hero-description"
              variants={fadeUpVariants}
            >
              Bulk grow kits, white-label tinctures, and fresh restaurant-grade mushrooms for restaurants, retailers, and distributors across the United States. Volume pricing and contract terms available.
            </motion.p>
            <motion.div
              className="hero-actions"
              variants={fadeUpVariants}
            >
              <motion.button
                onClick={onB2bOpen}
                className="btn btn-primary btn-lg"
                whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
                whileTap={{ scale: 0.97 }}
              >
                Request a Quote <ArrowRight size={18} />
              </motion.button>
              <motion.a
                href="#shop"
                className="btn btn-secondary btn-lg"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Browse Catalog
              </motion.a>
              <motion.a
                href="#how-it-works"
                className="btn btn-secondary btn-lg"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}
              >
                <Building2 size={16} /> Partnership Process
              </motion.a>
            </motion.div>
            <motion.div
              className="hero-trust"
              variants={fadeUpVariants}
            >
              <span><Truck size={14} /> 5-day standard lead time</span>
              <span><FileText size={14} /> Volume pricing & contracts</span>
              <span><ShieldCheck size={14} /> FDA & GMP certified</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: easeInOut }}
          >
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
