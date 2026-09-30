import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || isLoading ? 0.6 : 1,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 14px', fontSize: '13px' },
    md: { padding: '12px 20px', fontSize: '15px' },
    lg: { padding: '16px 28px', fontSize: '16px', fontWeight: 700 },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)',
      color: '#120815',
      boxShadow: '0 4px 20px rgba(232, 143, 167, 0.35)',
      border: 'none',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.07)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--text-primary)',
      border: '1px solid var(--glass-border)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent-rose)',
      border: '1.5px solid var(--accent-rose)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
    danger: {
      background: 'rgba(248, 113, 113, 0.12)',
      color: 'var(--verdict-red)',
      border: '1px solid rgba(248, 113, 113, 0.3)',
    },
  };

  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      whileHover={disabled || isLoading ? undefined : { scale: 1.01 }}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <span
          style={{
            width: 18,
            height: 18,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'pulseGlow 1s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      <span>{children}</span>
    </motion.button>
  );
};
