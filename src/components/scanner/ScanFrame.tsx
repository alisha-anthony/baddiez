import React from 'react';
import { motion } from 'framer-motion';

export const ScanFrame: React.FC = () => {
  const cornerColor = 'var(--accent-rose)';
  const cornerLength = '28px';
  const cornerThickness = '3.5px';

  return (
    <div
      style={{
        position: 'relative',
        width: '270px',
        height: '270px',
        margin: '0 auto',
      }}
    >
      {/* Laser Scanning Line */}
      <div
        className="anim-scan-laser"
        style={{
          position: 'absolute',
          left: '10px',
          right: '10px',
          height: '2.5px',
          background: 'linear-gradient(90deg, transparent 0%, var(--accent-rose) 50%, transparent 100%)',
          boxShadow: '0 0 16px var(--accent-rose), 0 0 8px #ffffff',
          borderRadius: '2px',
          zIndex: 10,
        }}
      />

      {/* Top Left Corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: cornerLength,
          height: cornerThickness,
          backgroundColor: cornerColor,
          borderRadius: '4px 0 0 0',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: cornerThickness,
          height: cornerLength,
          backgroundColor: cornerColor,
          borderRadius: '4px 0 0 0',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />

      {/* Top Right Corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: cornerLength,
          height: cornerThickness,
          backgroundColor: cornerColor,
          borderRadius: '0 4px 0 0',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: cornerThickness,
          height: cornerLength,
          backgroundColor: cornerColor,
          borderRadius: '0 4px 0 0',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />

      {/* Bottom Left Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: cornerLength,
          height: cornerThickness,
          backgroundColor: cornerColor,
          borderRadius: '0 0 0 4px',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: cornerThickness,
          height: cornerLength,
          backgroundColor: cornerColor,
          borderRadius: '0 0 0 4px',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />

      {/* Bottom Right Corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: cornerLength,
          height: cornerThickness,
          backgroundColor: cornerColor,
          borderRadius: '0 0 4px 0',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: cornerThickness,
          height: cornerLength,
          backgroundColor: cornerColor,
          borderRadius: '0 0 4px 0',
          boxShadow: '0 0 10px var(--accent-rose-glow)',
        }}
      />

      {/* Subtle Target Grid Crosshair */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(232, 143, 167, 0.15)',
          borderRadius: '16px',
        }}
      />
    </div>
  );
};
