import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { easeInOut } from '../utils/easing';

type Tab = 'production' | 'supply' | 'whiteLabel';

const tabs: { key: Tab; label: string }[] = [
  { key: 'production', label: 'Production' },
  { key: 'supply', label: 'Supply Chain' },
  { key: 'whiteLabel', label: 'White Label' }
];

const content: Record<Tab, { title: string; desc: string; details: string[] }> = {
  production: {
    title: 'FDA-registered, GMP-certified production',
    desc: 'All cultivation and extraction takes place in licensed facilities that follow current Good Manufacturing Practices. Every batch is tested for potency, purity, and contaminants.',
    details: [
      'Third-party lab tested for every batch',
      'USDA Organic certification available',
      'Sterile clean-room inoculation environment',
      'HACCP-compliant processing lines'
    ]
  },
  supply: {
    title: 'Reliable cold-chain logistics',
    desc: 'We partner with temperature-controlled carriers to ensure fresh mushrooms and live cultures arrive in peak condition — every time, anywhere in the continental US.',
    details: [
      'Refrigerated freight for fresh products',
      '5–10 business day standard lead time',
      'Real-time shipment tracking',
      'Ships to all 48 contiguous states'
    ]
  },
  whiteLabel: {
    title: 'Custom branding & formulation',
    desc: 'Launch your own mushroom product line without the R&D investment. We handle formulation, production, packaging, and compliance so you can focus on sales.',
    details: [
      'Custom label design and packaging',
      'Flexible MOQ for small and large runs',
      'FDA-compliant supplement labeling',
      'DTC-ready retail packaging options'
    ]
  }
};

const detailVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(2px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: easeInOut
    }
  })
};

export default function QualitySection() {
  const [activeTab, setActiveTab] = useState<Tab>('production');

  return (
    <motion.section
      id="quality"
      className="quality-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-pretitle">Standards</span>
          <h2 className="section-title">Quality & certification</h2>
          <p className="section-subtitle">Every product meets commercial-grade standards from facility to delivery.</p>
        </motion.div>

        <LayoutGroup>
          <div className="quality-layout">
            <div className="quality-tabs">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`quality-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  layout
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ position: 'relative' }}
                >
                  {activeTab === tab.key && (
                    <motion.span
                      layoutId="qualityActive"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'var(--text-dark)',
                        borderRadius: 4,
                        zIndex: 0
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="quality-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="quality-content-title">{content[activeTab].title}</h3>
                  <p className="quality-content-desc">{content[activeTab].desc}</p>
                  <div className="quality-details">
                    {content[activeTab].details.map((detail, i) => (
                      <motion.div
                        key={detail}
                        className="quality-detail"
                        custom={i}
                        variants={detailVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {detail}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </LayoutGroup>
      </div>
    </motion.section>
  );
}
