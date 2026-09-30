import React from 'react';
import { motion } from 'framer-motion';
import { RuleVerdict } from '../../../types/verdict';

export interface NutrientBarProps {
  label: string;
  actualValue: number | null;
  limitValue: number;
  unit: string;
  verdict: RuleVerdict;
  isInformational?: boolean;
  message?: string;
  servingNote?: string;
}

export const NutrientBar: React.FC<NutrientBarProps> = ({
  label,
  actualValue,
  limitValue,
  unit,
  verdict,
  isInformational = false,
  message,
  servingNote,
}) => {
  // If actualValue is missing (unknown verdict)
  const isUnknown = actualValue === null || verdict === 'unknown';

  // Compute percentage fill relative to limit (or 100% if unknown/over)
  const ratio = isUnknown || limitValue <= 0 ? 0 : Math.min(100, Math.round((actualValue / (limitValue * 1.5)) * 100));

  let barColor = 'var(--verdict-green)';
  let barGlow = 'var(--verdict-green-glow)';
  let statusText = 'SAFE';

  if (isInformational) {
    barColor = 'var(--accent-lavender)';
    barGlow = 'var(--accent-lavender-glow)';
    statusText = 'INFO';
  } else if (verdict === 'red') {
    barColor = 'var(--verdict-red)';
    barGlow = 'var(--verdict-red-glow)';
    statusText = 'HIGH';
  } else if (verdict === 'yellow') {
    barColor = 'var(--verdict-yellow)';
    barGlow = 'var(--verdict-yellow-glow)';
    statusText = 'CAUTION';
  } else if (isUnknown) {
    barColor = 'var(--verdict-grey)';
    barGlow = 'var(--verdict-grey-glow)';
    statusText = 'UNKNOWN';
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '8px',
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
            {label}
          </span>
          {servingNote && (
            <span className="caption" style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>
              ({servingNote})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isUnknown ? 'Not listed' : `${actualValue} ${unit}`}
          </span>
          {!isUnknown && !isInformational && limitValue > 0 && (
            <span className="caption" style={{ color: 'var(--text-muted)' }}>
              / max {limitValue} {unit}
            </span>
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              color: barColor,
              backgroundColor: `rgba(255, 255, 255, 0.05)`,
              border: `1px solid ${barColor}`,
            }}
          >
            {statusText}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: message ? '8px' : '0',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isUnknown ? '15%' : `${Math.max(5, ratio)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barGlow}`,
            borderRadius: 'var(--radius-full)',
          }}
        />
      </div>

      {message && (
        <p className="caption" style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          {message}
        </p>
      )}
    </div>
  );
};
