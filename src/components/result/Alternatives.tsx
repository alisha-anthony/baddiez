import React from 'react';
import { Leaf, ArrowRight } from 'lucide-react';
import { Alternative } from '../../types/verdict';

export interface AlternativesProps {
  alternatives?: Alternative[];
  onSelectAlternative?: (alt: Alternative) => void;
}

export const Alternatives: React.FC<AlternativesProps> = ({
  alternatives,
  onSelectAlternative,
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div style={{ marginBottom: '28px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--verdict-green)',
          marginBottom: '14px',
        }}
      >
        <Leaf size={18} />
        <h3 className="title-md" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
          Healthier Whole-Food Alternatives
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alternatives.map((alt, idx) => (
          <div
            key={idx}
            onClick={() => onSelectAlternative && onSelectAlternative(alt)}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(52, 211, 153, 0.05)',
              border: '1px solid rgba(52, 211, 153, 0.2)',
              cursor: alt.barcode ? 'pointer' : 'default',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                {alt.name}
              </div>
              {alt.description && (
                <p className="caption" style={{ color: 'var(--text-secondary)' }}>
                  {alt.description}
                </p>
              )}
            </div>

            {alt.barcode && (
              <ArrowRight size={16} color="var(--verdict-green)" style={{ flexShrink: 0, marginLeft: '10px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
