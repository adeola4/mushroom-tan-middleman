import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import type { CartItem } from '../App';

interface CartDrawerProps {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const formatPrice = (n: number) => `$${n.toFixed(0)}`;

export default function CartDrawer({
  open,
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout
}: CartDrawerProps) {
  const subtotal = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);

  return (
    <>
      <motion.div
        className={`cart-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        initial={false}
        animate={open ? { opacity: 1, pointerEvents: 'auto' as const } : { opacity: 0, pointerEvents: 'none' as const }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="cart-drawer"
          onClick={(e) => e.stopPropagation()}
          initial={false}
          animate={open ? { x: 0 } : { x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="cart-header">
            <h3 className="cart-header-title">
              <ClipboardList size={18} /> Quote List
            </h3>
            <motion.button
              className="cart-close-btn"
              onClick={onClose}
              whileHover={{ color: 'var(--text-dark)' }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="cart-items-container">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div
                  key="empty"
                  className="cart-empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ClipboardList size={40} style={{ strokeWidth: 1 }} />
                  <p>Your quote list is empty. Add products to request bulk pricing.</p>
                  <motion.button
                    className="btn btn-primary btn-sm"
                    onClick={onClose}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Browse Catalog
                  </motion.button>
                </motion.div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    className="cart-item"
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="cart-item-image"
                      style={{
                        background: `${item.product.color}12`,
                        borderColor: item.product.color
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: item.product.color,
                          opacity: 0.7
                        }}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-row-top">
                        <h4 className="cart-item-title">{item.product.title}</h4>
                        <motion.button
                          className="cart-item-remove"
                          onClick={() => onRemove(item.product.id)}
                          whileHover={{ opacity: 1, color: 'var(--primary)' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={13} />
                        </motion.button>
                      </div>
                      <div className="cart-item-row-bottom">
                        <div className="quantity-controller">
                          <motion.button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            whileHover={{ background: 'rgba(0,0,0,0.06)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={11} />
                          </motion.button>
                          <motion.span
                            className="qty-number"
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            whileHover={{ background: 'rgba(0,0,0,0.06)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={11} />
                          </motion.button>
                        </div>
                        <motion.span
                          className="cart-item-price"
                          key={item.quantity}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                        >
                          {formatPrice(item.product.price * item.quantity)}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {cart.length > 0 && (
              <motion.div
                className="cart-footer"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="cart-summary-row">
                  <span>Estimated value</span>
                  <motion.span
                    className="cart-total"
                    key={subtotal}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                  >
                    {formatPrice(subtotal)}
                  </motion.span>
                </div>
                <motion.button
                  className="btn btn-primary cart-checkout-btn"
                  onClick={onCheckout}
                  whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Request Pricing <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
