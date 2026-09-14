import { useEffect, useRef } from 'react';

const SPORES = [
  { size: 3, top: '15%', left: '10%', delay: 0, duration: 18, anim: 'sporeFloat1' },
  { size: 2, top: '25%', left: '75%', delay: 1, duration: 22, anim: 'sporeFloat2' },
  { size: 4, top: '60%', left: '85%', delay: 0.5, duration: 20, anim: 'sporeFloat3' },
  { size: 2, top: '80%', left: '20%', delay: 2, duration: 16, anim: 'sporeFloat1' },
  { size: 3, top: '45%', left: '50%', delay: 1.5, duration: 24, anim: 'sporeFloat2' },
  { size: 1.5, top: '70%', left: '60%', delay: 3, duration: 19, anim: 'sporeFloat3' },
  { size: 2.5, top: '10%', left: '45%', delay: 0.8, duration: 21, anim: 'sporeFloat1' },
  { size: 2, top: '90%', left: '40%', delay: 2.5, duration: 17, anim: 'sporeFloat2' },
  { size: 3, top: '35%', left: '30%', delay: 1.2, duration: 23, anim: 'sporeFloat3' },
  { size: 1.5, top: '55%', left: '70%', delay: 0.3, duration: 15, anim: 'sporeFloat1' },
];

export default function SporeParticles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;

    SPORES.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'spore';
      el.style.width = `${s.size}px`;
      el.style.height = `${s.size}px`;
      el.style.top = s.top;
      el.style.left = s.left;
      el.style.animation = `${s.anim} ${s.duration}s ease-in-out ${s.delay}s infinite`;
      root.appendChild(el);
    });

    return () => {
      root.innerHTML = '';
    };
  }, []);

  return <div ref={ref} className="spore-container" aria-hidden />;
}
