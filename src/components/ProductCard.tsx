import { motion } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  imageSrc: string;
  onAdd: (p: Product) => void;
  onQuote: () => void;
  index: number;
}

export default function ProductCard({ product, imageSrc, onAdd, onQuote, index }: ProductCardProps) {
  return (
    <motion.div
      className="product-card"
      layout
      initial={{ opacity: 0, y: 40, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 20, filter: 'blur(2px)' }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -8,
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
        transition: { type: 'spring', stiffness: 200, damping: 20 }
      }}
    >
      <motion.div
        className="product-image-area"
        whileHover={{ '--img-scale': 1.05 } as any}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <span className="badge badge-primary product-badge">{product.badge}</span>
        <motion.img
          src={imageSrc}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transformOrigin: 'center', willChange: 'transform' }}
          whileHover={{ scale: 1.08, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
        />
      </motion.div>

      <div className="product-card-body">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta-row">
          <span className="product-moq">Min: {product.moq}</span>
          <span className="product-lead-time">{product.leadTime}</span>
        </div>
      </div>

      <div className="product-card-footer">
        <motion.span className="product-price">
          ${product.price}<span className="product-price-unit"> / unit</span>
        </motion.span>
        <div className="product-card-actions">
          <motion.button
            className="btn btn-secondary btn-xs"
            onClick={onQuote}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText size={12} /> Quote
          </motion.button>
          <motion.button
            className="btn btn-primary btn-xs"
            onClick={() => onAdd(product)}
            whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={13} /> Add to List
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
