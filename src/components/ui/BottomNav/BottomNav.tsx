import React from 'react';
import { motion } from 'framer-motion';
import { Home, Scan, History, User } from 'lucide-react';

export type TabType = 'home' | 'scan' | 'history' | 'profile';

export interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--max-app-width)',
          padding: '12px 16px 20px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: 'rgba(18, 18, 31, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 12px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              color: activeTab === 'home' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <Home size={22} />
            <span style={{ fontSize: '11px', fontWeight: activeTab === 'home' ? 700 : 500 }}>
              Home
            </span>
          </button>

          {/* Center Scan Button (Big & Prominent) */}
          <div style={{ position: 'relative', top: '-18px' }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.06 }}
              onClick={() => onTabChange('scan')}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)',
                color: '#120815',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 24px var(--accent-rose-glow), 0 0 0 4px rgba(18, 18, 31, 0.9)',
                cursor: 'pointer',
              }}
            >
              <Scan size={28} strokeWidth={2.4} />
            </motion.button>
          </div>

          {/* History Tab */}
          <button
            type="button"
            onClick={() => onTabChange('history')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              color: activeTab === 'history' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <History size={22} />
            <span style={{ fontSize: '11px', fontWeight: activeTab === 'history' ? 700 : 500 }}>
              History
            </span>
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              color: activeTab === 'profile' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <User size={22} />
            <span style={{ fontSize: '11px', fontWeight: activeTab === 'profile' ? 700 : 500 }}>
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
