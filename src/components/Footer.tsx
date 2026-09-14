import { motion } from 'framer-motion';
import { easeInOut } from '../utils/easing';

interface FooterProps {
  onB2bOpen: () => void;
  onJvOpen?: () => void;
}

const colVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: easeInOut
    }
  })
};

export default function Footer({ onB2bOpen, onJvOpen }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="footer-grid">
          <motion.div
            className="footer-brand"
            custom={0}
            variants={colVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.span
              className="footer-logo"
              whileHover={{ letterSpacing: '0.02em' }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              MUSHROOM<span className="footer-logo-dot">.</span>TAN
            </motion.span>
            <p className="footer-tagline">
              Wholesale mushroom supply for restaurants, retailers, and wellness brands. Bulk pricing and white-label options available.
            </p>
          </motion.div>

          {[
            {
              title: 'Products',
              links: [
                { label: 'Grow Kits', href: '#shop' },
                { label: 'Extracts', href: '#shop' },
                { label: 'Fresh Mushrooms', href: '#shop' },
                { label: 'Foraged', href: '#shop' }
              ]
            },
            {
              title: 'Company',
              links: [
                { label: 'Quality Standards', href: '#quality' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Joint Venture', actionJv: true },
                { label: 'Request a Quote', action: true }
              ]
            },
            {
              title: 'Contact',
              links: [
                { label: 'orders@mushroomtan.com', href: 'mailto:orders@mushroomtan.com', isExternal: true },
                { label: 'Philadelphia, PA', plain: true }
              ]
            }
          ].map((col, ci) => (
            <motion.div
              key={col.title}
              className="footer-col"
              custom={ci + 1}
              variants={colVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="footer-col-title">{col.title}</h4>
              <ul className="footer-links">
                {col.links.map((link) => {
                  if ('plain' in link && link.plain) {
                    return (
                      <li key={link.label}>
                        <span className="footer-link">{link.label}</span>
                      </li>
                    );
                  }
                  if ('actionJv' in link && link.actionJv) {
                    return (
                      <li key={link.label}>
                        <motion.a
                          href="#"
                          className="footer-link"
                          onClick={(e) => { e.preventDefault(); onJvOpen?.(); }}
                          whileHover={{ opacity: 0.8, color: 'var(--primary)' }}
                        >
                          {link.label}
                        </motion.a>
                      </li>
                    );
                  }
                  if ('action' in link && link.action) {
                    return (
                      <li key={link.label}>
                        <motion.a
                          href="#"
                          className="footer-link"
                          onClick={(e) => { e.preventDefault(); onB2bOpen(); }}
                          whileHover={{ opacity: 0.8, color: 'var(--primary)' }}
                        >
                          {link.label}
                        </motion.a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <motion.a
                        href={link.href}
                        className="footer-link"
                        whileHover={{ opacity: 0.8, color: 'var(--primary)' }}
                      >
                        {link.label}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Mushroom TAN. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
