import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'rose' | 'interactive' | 'verdict';
  verdictGlow?: 'green' | 'yellow' | 'red' | 'grey';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  verdictGlow,
  padding = 'md',
  style,
  ...rest
}) => {
  const paddingMap = {
    none: '0',
    sm: '12px',
    md: '20px',
    lg: '28px',
  };

  let glowShadow = 'var(--shadow-card)';
  let borderColor = 'var(--glass-border)';

  if (verdictGlow === 'green') {
    glowShadow = '0 8px 32px var(--verdict-green-glow), 0 0 1px 1px rgba(52, 211, 153, 0.2)';
    borderColor = 'rgba(52, 211, 153, 0.3)';
  } else if (verdictGlow === 'yellow') {
    glowShadow = '0 8px 32px var(--verdict-yellow-glow), 0 0 1px 1px rgba(251, 191, 36, 0.2)';
    borderColor = 'rgba(251, 191, 36, 0.3)';
  } else if (verdictGlow === 'red') {
    glowShadow = '0 8px 32px var(--verdict-red-glow), 0 0 1px 1px rgba(248, 113, 113, 0.2)';
    borderColor = 'rgba(248, 113, 113, 0.3)';
  } else if (verdictGlow === 'grey') {
    glowShadow = '0 8px 32px var(--verdict-grey-glow), 0 0 1px 1px rgba(156, 163, 175, 0.2)';
    borderColor = 'rgba(156, 163, 175, 0.3)';
  }

  const baseStyle: any = {
    background:
      variant === 'rose'
        ? 'linear-gradient(135deg, rgba(232, 143, 167, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
        : 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    border: `1px solid ${borderColor}`,
    borderRadius: 'var(--radius-lg)',
    padding: paddingMap[padding],
    boxShadow: glowShadow,
    transition: 'all 0.25s ease',
    ...style,
  };

  return (
    <motion.div
      style={baseStyle as any}
      whileHover={variant === 'interactive' ? { y: -2, background: 'var(--glass-bg-hover)' } : undefined}
      whileTap={variant === 'interactive' ? { y: 0 } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
