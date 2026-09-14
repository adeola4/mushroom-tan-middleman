import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactLenis } from 'lenis/react';
import './index.css';
import App from './App.tsx';

export function Root() {
  return (
    <StrictMode>
      <ReactLenis
        root
        options={{
          lerp: 0.08,
          smoothWheel: true,
          syncTouch: true,
          wheelMultiplier: 1,
          touchMultiplier: 1,
        }}
      >
        <App />
      </ReactLenis>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
