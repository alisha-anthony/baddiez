import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';

export interface DisclaimerScreenProps {
  onAccept: () => void;
}

export const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({ onAccept }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '24px 20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.2) 0%, rgba(196, 181, 253, 0.2) 100%)',
              border: '1.5px solid var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 25px var(--accent-rose-glow)',
            }}
          >
            <ShieldCheck size={32} color="var(--accent-rose)" />
          </div>

          <h1 className="title-xl" style={{ marginBottom: '8px' }}>
            Welcome to <span className="gradient-text-rose">SHE Scan</span>
          </h1>
          <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
            Empowering women with personalized packaged food safety clarity.
          </p>
        </div>

        <GlassCard padding="lg" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-lavender)' }}>
            <HeartHandshake size={20} />
            <h3 className="title-md" style={{ fontSize: '16px' }}>Medical Notice</h3>
          </div>

          <p className="body-md" style={{ color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.6 }}>
            <strong>SHE Scan provides general nutritional guidance, not medical advice.</strong>
          </p>

          <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5, fontSize: '13.5px' }}>
            Our deterministic rule engine compares label values with established nutrition benchmarks for conditions like PCOS, pregnancy, breastfeeding, diabetes, and allergies.
          </p>

          <p className="caption" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Always consult your physician, OB/GYN, or registered dietitian before making significant dietary modifications or consuming foods with severe allergic sensitivities.
          </p>
        </GlassCard>

        <Button variant="primary" size="lg" fullWidth onClick={onAccept}>
          I Understand & Agree
        </Button>
      </motion.div>
    </div>
  );
};
