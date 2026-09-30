import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scan, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { VerdictBadge } from '../../components/ui/VerdictBadge/VerdictBadge';
import { AllergenAlert } from '../../components/result/AllergenAlert';
import { NutrientBreakdown } from '../../components/result/NutrientBreakdown';
import { AvoidList } from '../../components/result/AvoidList';
import { Explanation } from '../../components/result/Explanation';
import { Alternatives } from '../../components/result/Alternatives';
import { ScanRecord } from '../../types/scan';

export interface ResultScreenProps {
  record: ScanRecord;
  onScanAnother: () => void;
  onBack: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  record,
  onScanAnother,
  onBack,
}) => {
  const { product, verdict, explanation } = record;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SHE Scan Verdict: ${product.name}`,
          text: `${product.name} scored ${verdict.overall.toUpperCase()} on SHE Scan for women's health conditions.`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 20px 48px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            color: 'var(--text-primary)',
            background: 'rgba(255, 255, 255, 0.08)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-rose)', letterSpacing: '0.04em' }}>
          SAFETY REPORT
        </span>

        <button
          type="button"
          onClick={handleShare}
          style={{
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.08)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Product Summary Header Card */}
      <GlassCard padding="md" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              padding: '4px',
            }}
          />
        ) : (
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            📦
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </h2>
          <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
            {product.brand ? `${product.brand} • ` : ''}
            {product.source === 'ocr' ? 'Extracted from Photo' : 'Barcode Scanned'}
          </div>
        </div>
      </GlassCard>

      {/* Allergen Alert (Overrides Everything if present) */}
      <AllergenAlert matches={verdict.allergenMatches} />

      {/* Traces Caution Alert Banner */}
      {verdict.tracesWarnings && verdict.tracesWarnings.length > 0 && verdict.allergenMatches.length === 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            color: 'var(--verdict-yellow)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Traces Warning:</strong> Packaging indicates traces of allergen: {verdict.tracesWarnings.map((t) => t.allergen).join(', ')}.
          </span>
        </div>
      )}

      {/* Big Animated Verdict Badge */}
      <div style={{ marginBottom: '24px' }}>
        <VerdictBadge verdict={verdict.overall} score={verdict.score} size="lg" />
      </div>

      {/* AI Plain-Language Explanation Block */}
      <Explanation explanation={explanation} />

      {/* Blacklist / Avoid List & Health Impact */}
      <AvoidList
        avoidIngredients={verdict.avoidIngredients}
        consequences={verdict.consequences}
      />

      {/* Nutrient Breakdown Bars (Value vs Limit) */}
      <NutrientBreakdown ruleResults={verdict.ruleResults} product={product} />

      {/* Healthier Whole-Food Alternatives (Shown for RED verdicts) */}
      {verdict.overall === 'red' && (
        <Alternatives alternatives={verdict.alternatives} />
      )}

      {/* Scan Another Button */}
      <div style={{ marginTop: '16px' }}>
        <Button variant="primary" size="lg" fullWidth onClick={onScanAnother} icon={<Scan size={20} />}>
          Scan Another Product
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <span className="caption" style={{ color: 'var(--text-muted)' }}>
          Evaluated using SHE Scan Engine v{verdict.rulesVersion}
        </span>
      </div>
    </div>
  );
};
