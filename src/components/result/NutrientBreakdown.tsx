import React, { useState } from 'react';
import { RuleResult } from '../../types/verdict';
import { Product } from '../../types/product';
import { NutrientBar } from '../ui/NutrientBar/NutrientBar';

export interface NutrientBreakdownProps {
  ruleResults: RuleResult[];
  product: Product;
}

export const NutrientBreakdown: React.FC<NutrientBreakdownProps> = ({
  ruleResults,
  product,
}) => {
  const [viewMode, setViewMode] = useState<'per100' | 'serving'>('per100');
  const unitLabel = product.servingUnit === 'per100ml' ? '100ml' : '100g';
  const hasServingSize = Boolean(product.servingSize);

  // Group or filter rule results (ignore avoid rules as they are in AvoidList)
  const nutrientRules = ruleResults.filter((r) => !r.ruleId.includes('_avoid_'));

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <h3 className="title-md" style={{ color: 'var(--text-primary)' }}>
          Nutrient Breakdown
        </h3>

        {hasServingSize && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('per100')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                color: viewMode === 'per100' ? '#ffffff' : 'var(--text-muted)',
                background: viewMode === 'per100' ? 'var(--accent-rose)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              Per {unitLabel}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('serving')}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                color: viewMode === 'serving' ? '#ffffff' : 'var(--text-muted)',
                background: viewMode === 'serving' ? 'var(--accent-rose)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              Per Serving ({product.servingSize})
            </button>
          </div>
        )}
      </div>

      {nutrientRules.length === 0 ? (
        <div
          style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          No specific nutrient limits applied for current profile.
        </div>
      ) : (
        nutrientRules.map((rule) => (
          <NutrientBar
            key={rule.ruleId}
            label={rule.nutrient}
            actualValue={rule.actualValue}
            limitValue={rule.limitValue}
            unit={rule.unit}
            verdict={rule.verdict}
            isInformational={rule.isInformational}
            message={rule.message}
            servingNote={viewMode === 'serving' && hasServingSize ? product.servingSize : `per ${unitLabel}`}
          />
        ))
      )}
    </div>
  );
};
