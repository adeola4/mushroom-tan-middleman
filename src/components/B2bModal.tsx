import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { X, ShieldCheck, ArrowRight, Building2, Globe, Package, Truck, HelpCircle } from 'lucide-react';

export interface B2bForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  website: string;
  businessType: string;
  monthlyVolume: string;
  distributionChannels: string[];
  productInterests: string[];
  shippingState: string;
  taxId: string;
  timeframe: string;
  contactTime: string;
  referral: string;
  message: string;
}

export const defaultB2bForm: B2bForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  company: '',
  website: '',
  businessType: '',
  monthlyVolume: '',
  distributionChannels: [],
  productInterests: [],
  shippingState: '',
  taxId: '',
  timeframe: '',
  contactTime: '',
  referral: '',
  message: ''
};

interface B2bModalProps {
  open: boolean;
  form: B2bForm;
  submitted: boolean;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onFormChange: (f: B2bForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'retailer', label: 'Retailer / Grocer' },
  { value: 'distributor', label: 'Distributor / Wholesaler' },
  { value: 'brand', label: 'Brand / Wellness Company' },
  { value: 'farm', label: 'Farm / Grower' },
  { value: 'buyer', label: 'Buyer / Individual' },
  { value: 'other', label: 'Other' }
];

const volumeOptions = [
  { value: 'under-1k', label: 'Under $1,000 / month' },
  { value: '1k-5k', label: '$1,000 – $5,000 / month' },
  { value: '5k-20k', label: '$5,000 – $20,000 / month' },
  { value: '20k-plus', label: '$20,000+ / month' },
  { value: 'unsure', label: 'Not sure yet' }
];

const channelOptions = [
  { value: 'retail', label: 'Retail' },
  { value: 'food-service', label: 'Food Service' },
  { value: 'dtc', label: 'Direct-to-Consumer' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'farm-table', label: 'Farm-to-Table' }
];

const productOptions = [
  { value: 'kits', label: 'Grow Kits' },
  { value: 'extracts', label: 'Extracts & Tinctures' },
  { value: 'fresh', label: 'Fresh Mushrooms' },
  { value: 'foraged', label: 'Foraged Items' },
  { value: 'white-label', label: 'White-Label / Private Label' }
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const timeframeOptions = [
  { value: 'asap', label: 'ASAP (1–2 weeks)' },
  { value: '30-days', label: 'Within 30 days' },
  { value: '1-3-months', label: '1–3 months' },
  { value: '3-plus', label: '3+ months' },
  { value: 'researching', label: 'Just researching' }
];

const contactTimeOptions = [
  { value: 'morning', label: 'Morning (8–12 ET)' },
  { value: 'afternoon', label: 'Afternoon (12–5 ET)' },
  { value: 'evening', label: 'Evening (5–8 ET)' },
  { value: 'any', label: 'No preference' }
];

const referralOptions = [
  { value: 'search', label: 'Search engine' },
  { value: 'social', label: 'Social media' },
  { value: 'referral', label: 'Referral / Word of mouth' },
  { value: 'trade', label: 'Trade show / Event' },
  { value: 'podcast', label: 'Podcast / Media' },
  { value: 'existing', label: 'Existing customer' },
  { value: 'other', label: 'Other' }
];

function ChipGroup({ options, selected, onChange, label }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div className="chip-group">
      <span className="form-label" dangerouslySetInnerHTML={{ __html: label }} />
      <div className="chip-row">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <motion.button
              key={opt.value}
              type="button"
              className={`chip-btn ${active ? 'active' : ''}`}
              onClick={() => {
                if (active) {
                  onChange(selected.filter((v) => v !== opt.value));
                } else {
                  onChange([...selected, opt.value]);
                }
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function RadioGroup({ options, selected, onChange, label }: {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="chip-group">
      <span className="form-label" dangerouslySetInnerHTML={{ __html: label }} />
      <div className="chip-row">
        {options.map((opt) => (
          <motion.button
            key={opt.value}
            type="button"
            className={`chip-btn ${selected === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function B2bModal({
  open,
  form,
  submitted,
  submitting,
  submitError,
  onClose,
  onFormChange,
  onSubmit,
  onReset
}: B2bModalProps) {
  const lenis = useLenis();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="b2b-modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="b2b-modal-content modal-layout" onClick={(e) => e.stopPropagation()}>
            <motion.button
              className="b2b-modal-close"
              onClick={onClose}
              aria-label="Close modal"
              whileHover={{ background: 'var(--bg-surface)', color: 'var(--text-dark)' }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>

            {!submitted ? (
              <>
                <div style={{ padding: '2.5rem 2.5rem 0', flexShrink: 0 }}>
                  <div className="b2b-form-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="b2b-form-title">Wholesale Partnership Inquiry</h3>
                    <p className="b2b-form-sub" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Tell us about your business and we&rsquo;ll provide a custom quote within one business day.
                    </p>
                  </div>

                  {submitError && (
                    <div className="b2b-error-banner" style={{ marginBottom: '1rem' }}>{submitError}</div>
                  )}
                </div>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <div className="modal-body" data-lenis-prevent style={{ padding: '0 2.5rem' }}>
                    <div className="form-section">
                      <div className="form-section-header">
                        <Building2 size={16} />
                        <span>Contact Information</span>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="b2b-firstName" className="form-label">First Name <span className="required">*</span></label>
                          <input id="b2b-firstName" type="text" required className="input-field" placeholder="First name" value={form.firstName} onChange={(e) => onFormChange({ ...form, firstName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="b2b-lastName" className="form-label">Last Name <span className="required">*</span></label>
                          <input id="b2b-lastName" type="text" required className="input-field" placeholder="Last name" value={form.lastName} onChange={(e) => onFormChange({ ...form, lastName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="b2b-email" className="form-label">Email <span className="required">*</span></label>
                          <input id="b2b-email" type="email" required className="input-field" placeholder="you@company.com" value={form.email} onChange={(e) => onFormChange({ ...form, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="b2b-phone" className="form-label">Phone <span className="required">*</span></label>
                          <input id="b2b-phone" type="tel" required className="input-field" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => onFormChange({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="b2b-jobTitle" className="form-label">Job Title</label>
                          <input id="b2b-jobTitle" type="text" className="input-field" placeholder="e.g. Purchasing Manager" value={form.jobTitle} onChange={(e) => onFormChange({ ...form, jobTitle: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-header">
                        <Globe size={16} />
                        <span>Company Details</span>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="b2b-company" className="form-label">Company Name <span className="required">*</span></label>
                          <input id="b2b-company" type="text" required className="input-field" placeholder="Company name" value={form.company} onChange={(e) => onFormChange({ ...form, company: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="b2b-website" className="form-label">Company Website</label>
                          <input id="b2b-website" type="url" className="input-field" placeholder="https://company.com" value={form.website} onChange={(e) => onFormChange({ ...form, website: e.target.value })} />
                        </div>
                      </div>
                      <RadioGroup label="Business Type <span class='required'>*</span>" options={businessTypes} selected={form.businessType} onChange={(v) => onFormChange({ ...form, businessType: v })} />
                    </div>

                    <div className="form-section">
                      <div className="form-section-header">
                        <Package size={16} />
                        <span>Business Profile</span>
                      </div>
                      <RadioGroup label="Estimated Monthly Order Value <span class='required'>*</span>" options={volumeOptions} selected={form.monthlyVolume} onChange={(v) => onFormChange({ ...form, monthlyVolume: v })} />
                      <ChipGroup label="Distribution Channels" options={channelOptions} selected={form.distributionChannels} onChange={(v) => onFormChange({ ...form, distributionChannels: v })} />
                    </div>

                    <div className="form-section">
                      <div className="form-section-header">
                        <HelpCircle size={16} />
                        <span>Product Interests</span>
                      </div>
                      <ChipGroup label="What are you interested in? <span class='required'>*</span>" options={productOptions} selected={form.productInterests} onChange={(v) => onFormChange({ ...form, productInterests: v })} />
                    </div>

                    <div className="form-section">
                      <div className="form-section-header">
                        <Truck size={16} />
                        <span>Order Details</span>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="b2b-state" className="form-label">Shipping State <span className="required">*</span></label>
                          <select id="b2b-state" required className="input-field select-field" value={form.shippingState} onChange={(e) => onFormChange({ ...form, shippingState: e.target.value })}>
                            <option value="">Select state</option>
                            {states.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="b2b-taxId" className="form-label">Tax ID / EIN</label>
                          <input id="b2b-taxId" type="text" className="input-field" placeholder="Optional" value={form.taxId} onChange={(e) => onFormChange({ ...form, taxId: e.target.value })} />
                        </div>
                      </div>
                      <RadioGroup label="Order Timeframe <span class='required'>*</span>" options={timeframeOptions} selected={form.timeframe} onChange={(v) => onFormChange({ ...form, timeframe: v })} />
                      <RadioGroup label="Preferred Contact Time" options={contactTimeOptions} selected={form.contactTime} onChange={(v) => onFormChange({ ...form, contactTime: v })} />
                    </div>

                    <div className="form-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                      <div className="form-section-header">
                        <HelpCircle size={16} />
                        <span>Additional</span>
                      </div>
                      <RadioGroup label="How did you hear about us?" options={referralOptions} selected={form.referral} onChange={(v) => onFormChange({ ...form, referral: v })} />
                      <div className="form-group">
                        <label htmlFor="b2b-message" className="form-label">Message / Custom Requests</label>
                        <textarea id="b2b-message" rows={3} className="input-field textarea-field" placeholder="Volume estimates, custom formulations, packaging preferences, or any other details" value={form.message} onChange={(e) => onFormChange({ ...form, message: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <motion.button
                      type="submit"
                      className="btn btn-primary btn-form-submit"
                      disabled={submitting}
                      whileHover={!submitting ? { y: -1, boxShadow: 'var(--shadow-md)' } : {}}
                      whileTap={!submitting ? { scale: 0.97 } : {}}
                      style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                      {submitting ? 'Submitting...' : 'Submit Inquiry'} <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </>
            ) : (
              <div className="b2b-success-wrapper" style={{ padding: '2.5rem', overflowY: 'auto' }}>
                <motion.div
                  className="success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                >
                  <ShieldCheck size={32} />
                </motion.div>
                <h3 className="success-title">Inquiry received</h3>
                <p className="success-desc">
                  Thank you, <strong>{form.firstName}</strong>. A sales representative will reach out to you at{' '}
                  <strong>{form.email}</strong> within one business day.
                </p>
                <motion.button
                  onClick={onReset}
                  className="btn btn-primary"
                  whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Close
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
