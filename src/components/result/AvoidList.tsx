import React from 'react';
import { Ban, AlertOctagon } from 'lucide-react';

export interface AvoidListProps {
  avoidIngredients: string[];
  consequences: string[];
}

export const AvoidList: React.FC<AvoidListProps> = ({
  avoidIngredients,
  consequences,
}) => {
  if (avoidIngredients.length === 0 && consequences.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(248, 113, 113, 0.05)',
        border: '1px solid rgba(248, 113, 113, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        marginBottom: '24px',
      }}
    >
      {avoidIngredients.length > 0 && (
        <div style={{ marginBottom: consequences.length > 0 ? '16px' : 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--verdict-red)',
              fontSize: '15px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <Ban size={18} />
            <span>Avoid Entirely Ingredients Detected</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {avoidIngredients.map((item, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(248, 113, 113, 0.15)',
                  border: '1px solid rgba(248, 113, 113, 0.35)',
                  color: '#fee2e2',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                ✕ {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {consequences.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--verdict-yellow)',
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <AlertOctagon size={16} />
            <span>Health Impact / Consequences</span>
          </div>

          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.5 }}>
            {consequences.map((c, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
