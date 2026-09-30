import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabel,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div style={{ width: '100%', marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span className="caption" style={{ color: 'var(--text-muted)' }}>
          {stepLabel || `Step ${currentStep} of ${totalSteps}`}
        </span>
        <span className="caption" style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
          {Math.round(percentage)}%
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-rose) 0%, var(--accent-lavender) 100%)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 0 12px var(--accent-rose-glow)',
          }}
        />
      </div>
    </div>
  );
};
