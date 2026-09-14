import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function QuizSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = document.getElementById('inline-quiz-container');
    if (!container) return;

    const initQuiz = () => {
      const win = window as any;
      if (win.MushroomTAN && typeof win.MushroomTAN.initInlineQuiz === 'function') {
        if (!container.querySelector('#mt-inline-quiz-wrapper')) {
          win.MushroomTAN.initInlineQuiz(container);
        }
        return true;
      }
      return false;
    };

    if (!initQuiz()) {
      const interval = setInterval(() => {
        if (initQuiz()) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);


  return (
    <motion.section
      id="quiz"
      className="quiz-section"
      ref={ref}
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
          <span className="section-pretitle">Qualify</span>
          <h2 className="section-title">Find your fit in 30 seconds</h2>
          <p className="section-subtitle">
            Answer two quick questions and we'll show you exactly which products and pricing tier match your business.
          </p>
        </motion.div>

        <motion.div
          id="inline-quiz-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.section>
  );
}
