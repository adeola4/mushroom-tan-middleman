import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { products, productImages, categories, categoryLabels, type Product, type Category } from '../data/products';
import ProductCard from './ProductCard';

interface ProductGridProps {
  onAdd: (p: Product) => void;
  onQuote: () => void;
}

export default function ProductGrid({ onAdd, onQuote }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const filtered =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <section id="shop" className="shop-section">
      <div className="container">
        <div className="section-header">
          <motion.span
            className="section-pretitle"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Catalog
          </motion.span>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Commercial products
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Bulk pricing available on all items. Minimums and lead times listed per product.
          </motion.p>
        </div>

        <LayoutGroup>
          <motion.div className="shop-controls" layout>
            {categories.map((cat) => (
              <motion.button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                layout
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: 'relative' }}
              >
                {selectedCategory === cat && (
                  <motion.span
                    layoutId="activePill"
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
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {categoryLabels[cat]}
                </span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div layout className="products-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  imageSrc={p.image || productImages[p.category]}
                  onAdd={onAdd}
                  onQuote={onQuote}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No products in this category yet. Check back soon.
            </motion.div>
          )}
        </LayoutGroup>
      </div>
    </section>
  );
}
