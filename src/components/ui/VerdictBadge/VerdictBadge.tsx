import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { VerdictLevel } from '../../../types/verdict';

export interface VerdictBadgeProps {
  verdict: VerdictLevel;
  size?: 'sm' | 'md' | 'lg';
  score?: number;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = 'lg',
  score,
}) => {
  const configs = {
    green: {
      label: 'SAFE FOR YOU',
      sublabel: 'Meets your health profile limits',
      color: 'var(--verdict-green)',
      glow: 'var(--verdict-green-glow)',
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.4)',
      icon: <CheckCircle2 size={size === 'lg' ? 38 : size === 'md' ? 24 : 18} color="var(--verdict-green)" />,
    },
    yellow: {
      label: 'USE WITH CAUTION',
      sublabel: 'Moderate levels or allergen traces',
      color: 'var(--verdict-yellow)',
      glow: 'var(--verdict-yellow-glow)',
      bg: 'rgba(251, 191, 36, 0.1)',
      border: 'rgba(251, 191, 36, 0.4)',
      icon: <AlertTriangle size={size === 'lg' ? 38 : size === 'md' ? 24 : 18} color="var(--verdict-yellow)" />,
    },
    red: {
      label: 'NOT RECOMMENDED',
      sublabel: 'Exceeds your health guidelines',
      color: 'var(--verdict-red)',
      glow: 'var(--verdict-red-glow)',
      bg: 'rgba(248, 113, 113, 0.1)',
      border: 'rgba(248, 113, 113, 0.4)',
      icon: <XCircle size={size === 'lg' ? 38 : size === 'md' ? 24 : 18} color="var(--verdict-red)" />,
    },
    insufficient_data: {
      label: 'INSUFFICIENT DATA',
      sublabel: 'Key nutritional facts are missing',
      color: 'var(--verdict-grey)',
      glow: 'var(--verdict-grey-glow)',
      bg: 'rgba(156, 163, 175, 0.1)',
      border: 'rgba(156, 163, 175, 0.4)',
      icon: <HelpCircle size={size === 'lg' ? 38 : size === 'md' ? 24 : 18} color="var(--verdict-grey)" />,
    },
  };

  const current = configs[verdict] || configs.insufficient_data;

  if (size === 'sm') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: current.bg,
          border: `1px solid ${current.border}`,
          color: current.color,
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        {current.icon}
        <span>{current.label}</span>
      </span>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: size === 'lg' ? '28px 24px' : '16px 20px',
        borderRadius: 'var(--radius-xl)',
        background: `radial-gradient(circle at 50% 30%, ${current.bg} 0%, rgba(255, 255, 255, 0.02) 100%)`,
        border: `1.5px solid ${current.border}`,
        boxShadow: `0 0 35px ${current.glow}, 0 10px 30px rgba(0,0,0,0.5)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Illuminated Icon Ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: size === 'lg' ? 76 : 52,
          height: size === 'lg' ? 76 : 52,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `rgba(255, 255, 255, 0.05)`,
          border: `2px solid ${current.border}`,
          boxShadow: `0 0 20px ${current.glow}`,
          marginBottom: '16px',
        }}
      >
        {current.icon}
      </motion.div>

      <h2
        style={{
          fontSize: size === 'lg' ? '22px' : '17px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: current.color,
          textTransform: 'uppercase',
          marginBottom: '4px',
          textShadow: `0 0 12px ${current.glow}`,
        }}
      >
        {current.label}
      </h2>

      <p className="body-md" style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}>
        {current.sublabel}
      </p>

      {score !== undefined && (
        <div
          style={{
            marginTop: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          <span>Safety Alignment:</span>
          <span style={{ color: current.color, fontWeight: 700 }}>{score}%</span>
        </div>
      )}
    </motion.div>
  );
};
