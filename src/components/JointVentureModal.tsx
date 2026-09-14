import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { X, ShieldCheck, ArrowRight, Building2, Handshake, Lightbulb } from 'lucide-react';

export interface JointVentureForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  location: string;
  contributions: string[];
  proposal: string;
}

export const defaultJointVentureForm: JointVentureForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  businessType: '',
  location: '',
  contributions: [],
  proposal: ''
};

interface JointVentureModalProps {
  open: boolean;
  form: JointVentureForm;
  submitted: boolean;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onFormChange: (f: JointVentureForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

const businessTypeOptions = [
  { value: 'farm-grower', label: 'Farm / Grower' },
  { value: 'processor', label: 'Processor / Manufacturer' },
  { value: 'distributor', label: 'Distributor / Logistics' },
  { value: 'retail', label: 'Retail / Market' },
  { value: 'restaurant', label: 'Restaurant / Kitchen' },
  { value: 'other', label: 'Other' }
];

const contributionOptions = [
  { value: 'facility', label: 'Facility / Space' },
  { value: 'land', label: 'Land for Cultivation' },
  { value: 'distribution', label: 'Distribution Network' },
  { value: 'capital', label: 'Capital / Investment' },
  { value: 'equipment', label: 'Processing Equipment' },
  { value: 'sales', label: 'Sales & Marketing' },
  { value: 'expertise', label: 'Mycology Expertise' },
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

export default function JointVentureModal({
  open,
  form,
  submitted,
  submitting,
  submitError,
  onClose,
  onFormChange,
  onSubmit,
  onReset
}: JointVentureModalProps) {
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
                    <h3 className="b2b-form-title">Joint Venture Inquiry</h3>
                    <p className="b2b-form-sub" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Local mushroom business looking to partner? Tell us about your operation and we&rsquo;ll explore how we can grow together.
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
                          <label htmlFor="jv-firstName" className="form-label">First Name <span className="required">*</span></label>
                          <input id="jv-firstName" type="text" required className="input-field" placeholder="First name" value={form.firstName} onChange={(e) => onFormChange({ ...form, firstName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="jv-lastName" className="form-label">Last Name <span className="required">*</span></label>
                          <input id="jv-lastName" type="text" required className="input-field" placeholder="Last name" value={form.lastName} onChange={(e) => onFormChange({ ...form, lastName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="jv-email" className="form-label">Email <span className="required">*</span></label>
                          <input id="jv-email" type="email" required className="input-field" placeholder="you@company.com" value={form.email} onChange={(e) => onFormChange({ ...form, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="jv-phone" className="form-label">Phone <span className="required">*</span></label>
                          <input id="jv-phone" type="tel" required className="input-field" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => onFormChange({ ...form, phone: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-header">
                        <Handshake size={16} />
                        <span>Business Details</span>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="jv-businessName" className="form-label">Business Name <span className="required">*</span></label>
                          <input id="jv-businessName" type="text" required className="input-field" placeholder="Your business name" value={form.businessName} onChange={(e) => onFormChange({ ...form, businessName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label htmlFor="jv-location" className="form-label">Location <span className="required">*</span></label>
                          <input id="jv-location" type="text" required className="input-field" placeholder="City, State" value={form.location} onChange={(e) => onFormChange({ ...form, location: e.target.value })} />
                        </div>
                      </div>
                      <RadioGroup label="Business Type <span class='required'>*</span>" options={businessTypeOptions} selected={form.businessType} onChange={(v) => onFormChange({ ...form, businessType: v })} />
                    </div>

                    <div className="form-section">
                      <div className="form-section-header">
                        <Lightbulb size={16} />
                        <span>What You Bring</span>
                      </div>
                      <ChipGroup label="What resources or capabilities can you contribute?" options={contributionOptions} selected={form.contributions} onChange={(v) => onFormChange({ ...form, contributions: v })} />
                    </div>

                    <div className="form-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                      <div className="form-section-header">
                        <Lightbulb size={16} />
                        <span>Proposal</span>
                      </div>
                      <div className="form-group">
                        <label htmlFor="jv-proposal" className="form-label">Tell us about your operation <span className="required">*</span></label>
                        <textarea id="jv-proposal" rows={4} required className="input-field textarea-field" placeholder="Describe your business, what you can offer, and what partnership you're looking for..." value={form.proposal} onChange={(e) => onFormChange({ ...form, proposal: e.target.value })} />
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
                <div className="success-icon">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="success-title">Inquiry received</h3>
                <p className="success-desc">
                  Thank you, <strong>{form.firstName}</strong>. We&rsquo;ll review your proposal and reach out to you at{' '}
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
