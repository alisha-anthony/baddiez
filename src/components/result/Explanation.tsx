import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { SkeletonLoader } from '../ui/SkeletonLoader/SkeletonLoader';

export interface ExplanationProps {
  explanation: string | null;
  isLoading?: boolean;
}

export const Explanation: React.FC<ExplanationProps> = ({
  explanation,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(196, 181, 253, 0.08) 0%, rgba(232, 143, 167, 0.04) 100%)',
        border: '1px solid rgba(196, 181, 253, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        marginBottom: '24px',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-lavender)" />
          <h3 className="title-md" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
            Nutritional Assessment
          </h3>
        </div>

        <button
          type="button"
          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '14px' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <SkeletonLoader height="16px" width="100%" />
                  <SkeletonLoader height="16px" width="85%" />
                  <SkeletonLoader height="16px" width="60%" />
                </div>
              ) : explanation ? (
                <p className="body-md" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {explanation}
                </p>
              ) : (
                <p className="caption" style={{ color: 'var(--text-muted)' }}>
                  Explanation temporarily unavailable. The safety verdict above is calculated deterministically and remains fully accurate.
                </p>
              )}

              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                <span>AI-assisted plain language translation of rule engine findings.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
