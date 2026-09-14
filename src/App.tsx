import { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import ProductGrid from './components/ProductGrid';
import ProcessSection from './components/ProcessSection';
import QualitySection from './components/QualitySection';
import QuizSection from './components/QuizSection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import B2bModal, { defaultB2bForm, type B2bForm } from './components/B2bModal';
import JointVentureModal, { defaultJointVentureForm, type JointVentureForm } from './components/JointVentureModal';
import SporeParticles from './components/SporeParticles';
import LoadingScreen from './components/LoadingScreen';

import type { Product } from './data/products';
import './App.css';

export interface CartItem {
  product: Product;
  quantity: number;
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [b2bModalOpen, setB2bModalOpen] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [b2bForm, setB2bForm] = useState<B2bForm>(defaultB2bForm);

  const [jvModalOpen, setJvModalOpen] = useState(false);
  const [jvSubmitted, setJvSubmitted] = useState(false);
  const [jvSubmitting, setJvSubmitting] = useState(false);
  const [jvSubmitError, setJvSubmitError] = useState<string | null>(null);
  const [jvForm, setJvForm] = useState<JointVentureForm>(defaultJointVentureForm);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = () => {
    const items = cart
      .map((i) => `${i.product.title} (x${i.quantity})`)
      .join('%0D%0A');
    const total = cart.reduce((t, i) => t + i.product.price * i.quantity, 0);
    const mailto = `mailto:orders@mushroomtan.com?subject=Pricing Inquiry — $${total.toFixed(0)}&body=Quote request items:%0D%0A${items}%0D%0A%0D%0APlease provide wholesale pricing and availability.`;
    window.open(mailto, '_blank');
  };

  const handleB2bSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!b2bForm.businessType) { setSubmitError('Please select a Business Type.'); return; }
    if (!b2bForm.monthlyVolume) { setSubmitError('Please select an Estimated Monthly Order Value.'); return; }
    if (!b2bForm.timeframe) { setSubmitError('Please select an Order Timeframe.'); return; }

    setSubmitting(true);

    const payload = {
      Sheet: 'Entries',
      Timestamp: new Date().toISOString(),
      'First Name': b2bForm.firstName,
      'Last Name': b2bForm.lastName,
      Email: b2bForm.email,
      Phone: b2bForm.phone,
      'Job Title': b2bForm.jobTitle,
      Company: b2bForm.company,
      Website: b2bForm.website,
      'Business Type': b2bForm.businessType,
      'Monthly Volume': b2bForm.monthlyVolume,
      'Distribution Channels': b2bForm.distributionChannels.join(', '),
      'Product Interests': b2bForm.productInterests.join(', '),
      'Shipping State': b2bForm.shippingState,
      'Tax ID': b2bForm.taxId,
      Timeframe: b2bForm.timeframe,
      'Contact Time': b2bForm.contactTime,
      Referral: b2bForm.referral,
      Message: b2bForm.message,
      Source: 'b2b-modal'
    };

    try {
      const res = await fetch('/api/submit-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Submission failed');

      setInquirySubmitted(true);
    } catch (err) {
      const mailtoBody = Object.entries(payload)
        .filter(([k]) => k !== 'Sheet' && k !== 'Timestamp')
        .map(([k, v]) => `${k}: ${v}`)
        .join('%0D%0A');
      const mailto = `mailto:orders@mushroomtan.com?subject=Wholesale Inquiry from ${b2bForm.company}&body=${mailtoBody}`;
      window.open(mailto, '_blank');
      setInquirySubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }, [b2bForm]);

  const handleB2bReset = () => {
    setB2bForm(defaultB2bForm);
    setInquirySubmitted(false);
    setSubmitError(null);
    setB2bModalOpen(false);
  };

  const handleJvSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setJvSubmitError(null);

    if (!jvForm.businessType) { setJvSubmitError('Please select a Business Type.'); return; }

    setJvSubmitting(true);

    const payload = {
      Sheet: 'JointVentures',
      Timestamp: new Date().toISOString(),
      'First Name': jvForm.firstName,
      'Last Name': jvForm.lastName,
      Email: jvForm.email,
      Phone: jvForm.phone,
      Company: jvForm.businessName,
      'Business Type': jvForm.businessType,
      Location: jvForm.location,
      Contributions: jvForm.contributions.join(', '),
      Proposal: jvForm.proposal,
      Source: 'joint-venture'
    };

    try {
      const res = await fetch('/api/submit-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Submission failed');

      setJvSubmitted(true);
    } catch (err) {
      const mailtoBody = Object.entries(payload)
        .filter(([k]) => k !== 'Sheet' && k !== 'Timestamp')
        .map(([k, v]) => `${k}: ${v}`)
        .join('%0D%0A');
      const mailto = `mailto:orders@mushroomtan.com?subject=Joint Venture Inquiry from ${jvForm.businessName}&body=${mailtoBody}`;
      window.open(mailto, '_blank');
      setJvSubmitted(true);
    } finally {
      setJvSubmitting(false);
    }
  }, [jvForm]);

  const handleJvReset = () => {
    setJvForm(defaultJointVentureForm);
    setJvSubmitted(false);
    setJvSubmitError(null);
    setJvModalOpen(false);
  };

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
        setB2bModalOpen(false);
        setJvModalOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app-wrapper">
      <LoadingScreen />
      <SporeParticles />

      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onB2bOpen={() => setB2bModalOpen(true)}
        onJvOpen={() => setJvModalOpen(true)}
      />

      <Hero onB2bOpen={() => setB2bModalOpen(true)} />

      <TrustBar />

      <ProductGrid
        onAdd={addToCart}
        onQuote={() => setB2bModalOpen(true)}
      />

      <ProcessSection />

      <QualitySection />

      <QuizSection />

      <CtaSection onB2bOpen={() => setB2bModalOpen(true)} />

      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      <B2bModal
        open={b2bModalOpen}
        form={b2bForm}
        submitted={inquirySubmitted}
        submitting={submitting}
        submitError={submitError}
        onClose={handleB2bReset}
        onFormChange={setB2bForm}
        onSubmit={handleB2bSubmit}
        onReset={handleB2bReset}
      />

      <JointVentureModal
        open={jvModalOpen}
        form={jvForm}
        submitted={jvSubmitted}
        submitting={jvSubmitting}
        submitError={jvSubmitError}
        onClose={handleJvReset}
        onFormChange={setJvForm}
        onSubmit={handleJvSubmit}
        onReset={handleJvReset}
      />

      <Footer onB2bOpen={() => setB2bModalOpen(true)} onJvOpen={() => setJvModalOpen(true)} />
    </div>
  );
}