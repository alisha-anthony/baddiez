import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { useProfile } from '../../context/ProfileContext';

export interface ConsentScreenProps {
  onConsented: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsented }) => {
  const { completeOnboarding } = useProfile();
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding(true);
      onConsented();
    } catch (err) {
      console.warn('Error completing onboarding consent:', err);
      onConsented();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '24px 20px',
        maxWidth: '440px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.2) 0%, rgba(232, 143, 167, 0.2) 100%)',
              border: '1.5px solid var(--accent-lavender)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 25px var(--accent-lavender-glow)',
            }}
          >
            <Lock size={30} color="var(--accent-lavender)" />
          </div>

          <h2 className="title-xl" style={{ marginBottom: '8px' }}>
            Health Data Consent
          </h2>
          <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
            We take your health data privacy seriously.
          </p>
        </div>

        <GlassCard padding="lg" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={20} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p className="body-md" style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>
                Your health condition answers (PCOS, pregnancy status, diabetes type, and allergies) will be saved securely to your personal account with Row Level Security (RLS).
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={20} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p className="body-md" style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>
                Only you have read or write access to your data. No third-party ad networks or data brokers ever receive your health profile.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={20} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p className="body-md" style={{ color: 'var(--text-primary)', fontSize: '13.5px' }}>
                You can permanently delete your account and all associated scan history at any time with a single tap in Profile settings.
              </p>
            </div>
          </div>

          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                accentColor: 'var(--accent-rose)',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              I consent to storing my health profile for food safety scanning.
            </span>
          </div>
        </GlassCard>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!agreed}
          isLoading={isSubmitting}
          onClick={handleConfirm}
          icon={<ShieldCheck size={20} />}
        >
          Confirm & Enter App
        </Button>
      </motion.div>
    </div>
  );
};
