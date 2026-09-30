import React from 'react';
import { motion } from 'framer-motion';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'rose' | 'lavender';
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  selected = false,
  onClick,
  variant = 'rose',
  disabled = false,
}) => {
  const activeColor = variant === 'rose' ? 'var(--accent-rose)' : 'var(--accent-lavender)';
  const activeBg =
    variant === 'rose'
      ? 'linear-gradient(135deg, rgba(232, 143, 167, 0.22) 0%, rgba(232, 143, 167, 0.08) 100%)'
      : 'linear-gradient(135deg, rgba(196, 181, 253, 0.22) 0%, rgba(196, 181, 253, 0.08) 100%)';
  const activeShadow =
    variant === 'rose' ? '0 0 16px var(--accent-rose-glow)' : '0 0 16px var(--accent-lavender-glow)';

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.95 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        borderRadius: 'var(--radius-full)',
        fontSize: '14px',
        fontWeight: selected ? 600 : 500,
        color: selected ? '#ffffff' : 'var(--text-secondary)',
        background: selected ? activeBg : 'rgba(255, 255, 255, 0.04)',
        border: `1px solid ${selected ? activeColor : 'rgba(255, 255, 255, 0.08)'}`,
        boxShadow: selected ? activeShadow : 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
      <span>{label}</span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: activeColor,
            marginLeft: '2px',
          }}
        />
      )}
    </motion.button>
  );
};
