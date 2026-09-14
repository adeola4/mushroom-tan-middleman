import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useRef } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
  onB2bOpen: () => void;
  onJvOpen: () => void;
}

export default function Header({ cartCount, onCartOpen, onB2bOpen, onJvOpen }: HeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 60],
    ['rgba(250, 250, 248, 0.85)', 'rgba(250, 250, 248, 0.92)']
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 60],
    ['rgba(230, 230, 226, 0.5)', 'rgba(230, 230, 226, 1)']
  );
  const headerPad = useTransform(scrollY, [0, 60], ['1rem', '0.6rem']);
  const logoSz = useTransform(scrollY, [0, 60], ['1.3rem', '1.15rem']);

  return (
    <motion.header
      ref={ref}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        paddingTop: headerPad,
        paddingBottom: headerPad,
        background: headerBg,
        borderBottom: '1px solid',
        borderColor: headerBorder,
        backdropFilter: 'blur(12px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.2)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.a
          href="#"
          className="logo-section"
          style={{ fontSize: logoSz }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span>MUSHROOM<span className="logo-dot">.</span>TAN</span>
        </motion.a>

        <nav>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
            {[
              { label: 'Catalog', href: '#shop' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Quality', href: '#quality' },
              { label: 'Joint Venture', href: '#joint-venture', action: onJvOpen }
            ].map((link) => (
              <li key={link.href}>
                <motion.a
                  href={link.action ? undefined : link.href}
                  className="nav-link"
                  onClick={link.action ? (e) => { e.preventDefault(); link.action(); } : undefined}
                  whileHover={{ color: 'var(--text-dark)' }}
                  style={{ position: 'relative', textDecoration: 'none', cursor: 'pointer' }}
                >
                  {link.label}
                  <motion.span
                    className="nav-underline"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: 1,
                      background: 'var(--text-dark)',
                      transformOrigin: 'left center'
                    }}
                  />
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.button
            className="btn btn-primary btn-sm"
            onClick={onB2bOpen}
            whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
            whileTap={{ scale: 0.97 }}
          >
            Request Quote
          </motion.button>
          <motion.button
            className="cart-btn-trigger"
            onClick={onCartOpen}
            whileHover={{ borderColor: 'var(--text-dark)' }}
            whileTap={{ scale: 0.97 }}
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                className="cart-count-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
