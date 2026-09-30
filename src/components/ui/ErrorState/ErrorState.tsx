import React from 'react';
import { AlertCircle, WifiOff, CameraOff, PackageX } from 'lucide-react';
import { Button } from '../Button/Button';

export interface ErrorStateProps {
  type?: 'not_found' | 'offline' | 'camera' | 'general';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'general',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  const icons = {
    not_found: <PackageX size={44} color="var(--verdict-yellow)" />,
    offline: <WifiOff size={44} color="var(--verdict-red)" />,
    camera: <CameraOff size={44} color="var(--accent-rose)" />,
    general: <AlertCircle size={44} color="var(--accent-lavender)" />,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '32px 20px',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(12px)',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px',
        }}
      >
        {icons[type]}
      </div>

      <h3 className="title-md" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>

      <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '300px' }}>
        {description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '260px' }}>
        {actionText && onAction && (
          <Button variant="primary" onClick={onAction} fullWidth>
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button variant="ghost" onClick={onSecondaryAction} fullWidth>
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
