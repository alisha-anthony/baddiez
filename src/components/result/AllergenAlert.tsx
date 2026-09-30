import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { AllergenMatch } from '../../types/verdict';

export interface AllergenAlertProps {
  matches: AllergenMatch[];
}

export const AllergenAlert: React.FC<AllergenAlertProps> = ({ matches }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.22) 0%, rgba(248, 113, 113, 0.08) 100%)',
        border: '1.5px solid var(--verdict-red)',
        boxShadow: '0 0 25px var(--verdict-red-glow)',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(248, 113, 113, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--verdict-red)',
          flexShrink: 0,
        }}
      >
        <ShieldAlert size={22} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--verdict-red)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            marginBottom: '4px',
          }}
        >
          Allergen Match Alert
        </div>
        <p className="body-md" style={{ color: '#ffffff', marginBottom: '8px' }}>
          This product contains ingredients matched against your recorded allergies:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {matches.map((m, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#fee2e2',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              ⚠️ <strong style={{ color: '#ffffff' }}>{m.allergen.toUpperCase()}</strong> — {m.foundIn}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
