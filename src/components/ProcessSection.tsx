import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { easeInOut } from '../utils/easing';

const steps = [
  {
    num: '01',
    title: 'Share your specs',
    desc: 'Tell us what you need — product type, volume, frequency, and any custom specifications for white-label or bulk orders.',
    color: '#5A8F9E'
  },
  {
    num: '02',
    title: 'Review pricing & samples',
    desc: 'We provide a quote within one business day. Request samples to verify quality before committing to a full order.',
    color: '#B8957A'
  },
  {
    num: '03',
    title: 'Order, produce & deliver',
    desc: 'Once approved, we schedule production and ship via refrigerated freight. Typical lead time is 5–10 business days.',
    color: '#3A7A5C'
  }
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [activeStep, setActiveStep] = useState(0);

  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center']
  });

  const stepProgress = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);

  useEffect(() => {
    const unsub = stepProgress.on('change', (v) => {
      setActiveStep(Math.min(Math.floor(v), 2));
    });
    return () => unsub();
  }, [stepProgress]);

  return (
    <motion.section
      id="how-it-works"
      className="hiw-section"
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeInOut }}
        >
          <span className="section-pretitle">Process</span>
          <h2 className="section-title">How wholesale works</h2>
          <p className="section-subtitle">From inquiry to delivery in three straightforward steps.</p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'start',
          position: 'relative'
        }}>
          <div style={{
            position: 'sticky',
            top: '8rem',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeInOut }}
              style={{
                width: 200,
                height: 200,
                borderRadius: activeStep === 0 ? '50%' : activeStep === 1 ? '24px' : '0',
                background: steps[activeStep].color,
                opacity: 0.15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-radius 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <motion.span
                key={activeStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.5, y: 0 }}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  color: 'var(--text-dark)',
                  textAlign: 'center'
                }}
              >
                {steps[activeStep].title.split(' ').slice(0, 2).join(' ')}
              </motion.span>
            </motion.div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'var(--border-color)',
              zIndex: 0
            }} />
            <motion.div
              style={{
                position: 'absolute',
                left: '1rem',
                top: 0,
                width: 1,
                background: 'var(--text-dark)',
                zIndex: 1,
                transformOrigin: 'top'
              }}
              animate={{ scaleY: (activeStep + 1) / steps.length }}
              transition={{ duration: 0.6, ease: easeInOut }}
            />

            {steps.map((step, i) => (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el; }}
              >
                <StepCard step={step} index={i} isActive={activeStep === i} isPast={activeStep > i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function StepCard({ step, isActive, isPast }: {
  step: typeof steps[0];
  index: number;
  isActive: boolean;
  isPast: boolean;
}) {
  return (
    <motion.div
      style={{
        padding: '1.5rem 0 1.5rem 3rem',
        position: 'relative'
      }}
      animate={{
        opacity: isPast ? 0.4 : 1,
        y: isActive ? 0 : isPast ? -4 : 4
      }}
      transition={{ duration: 0.4, ease: easeInOut }}
    >
      <div style={{
        position: 'absolute',
        left: '-0.4rem',
        top: '2rem',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: isActive ? 'var(--text-dark)' : 'var(--border-color)',
        border: '2px solid var(--bg-alt)',
        zIndex: 2,
        transition: 'background 0.3s ease'
      }} />
      <motion.span
        className="hiw-number"
        animate={{
          scale: isActive ? 1.15 : 1,
          color: isActive ? 'var(--primary)' : 'var(--text-muted)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {step.num}
      </motion.span>
      <h3 className="hiw-title">{step.title}</h3>
      <p className="hiw-desc">{step.desc}</p>
    </motion.div>
  );
}
