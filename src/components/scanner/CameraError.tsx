import React from 'react';
import { CameraOff, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button/Button';

export interface CameraErrorProps {
  errorType: 'permission_denied' | 'no_camera' | 'not_secure' | 'unknown';
  onRetry: () => void;
  onSwitchToUpload: () => void;
}

export const CameraError: React.FC<CameraErrorProps> = ({
  errorType,
  onRetry,
  onSwitchToUpload,
}) => {
  const configs = {
    permission_denied: {
      icon: <CameraOff size={48} color="var(--verdict-red)" />,
      title: 'Camera Access Blocked',
      desc: 'Please allow camera permission in your browser URL bar or phone settings to scan barcodes directly.',
    },
    no_camera: {
      icon: <AlertTriangle size={48} color="var(--verdict-yellow)" />,
      title: 'No Camera Detected',
      desc: 'We could not detect an active camera on this device. You can still scan by taking a photo of the food label.',
    },
    not_secure: {
      icon: <ShieldAlert size={48} color="var(--verdict-yellow)" />,
      title: 'HTTPS Connection Required',
      desc: 'Mobile browsers require a secure HTTPS connection to activate the camera.',
    },
    unknown: {
      icon: <CameraOff size={48} color="var(--text-muted)" />,
      title: 'Camera Unavailable',
      desc: 'Unable to start camera stream. You can upload an ingredient label photo instead.',
    },
  };

  const current = configs[errorType] || configs.unknown;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '36px 24px',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        margin: '20px',
      }}
    >
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '18px',
        }}
      >
        {current.icon}
      </div>

      <h3 className="title-md" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
        {current.title}
      </h3>

      <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '320px' }}>
        {current.desc}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
        <Button variant="primary" onClick={onSwitchToUpload} fullWidth>
          📸 Upload Label Photo Instead
        </Button>
        <Button variant="secondary" onClick={onRetry} fullWidth>
          Try Camera Again
        </Button>
      </div>
    </div>
  );
};
