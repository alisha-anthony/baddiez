import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Barcode, AlertTriangle } from 'lucide-react';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { LabelUploader } from '../../components/scanner/LabelUploader';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState';
import { fetchProductByBarcode } from '../../services/openFoodFacts';
import { runVerdictEngine } from '../../engine/verdictEngine';
import { explainVerdict } from '../../services/edgeFunctions';
import { useProfile } from '../../context/ProfileContext';
import { useHistory } from '../../context/HistoryContext';
import { Product } from '../../types/product';
import { ScanRecord } from '../../types/scan';
import { v4 as uuidv4 } from 'uuid';

export interface ScanScreenProps {
  onBack: () => void;
  onScanComplete: (record: ScanRecord) => void;
  onStartReview: (extractedData: Partial<Product>) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onBack,
  onScanComplete,
  onStartReview,
}) => {
  const { profile } = useProfile();
  const { addScan } = useHistory();

  const [activeMode, setActiveMode] = useState<'barcode' | 'ocr'>('barcode');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorState, setErrorState] = useState<{
    type: 'not_found' | 'offline' | 'general';
    title: string;
    description: string;
  } | null>(null);

  const handleBarcodeDetected = async (barcode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorState(null);

    const res = await fetchProductByBarcode(barcode);

    if (res.status === 'not_found') {
      setIsProcessing(false);
      setErrorState({
        type: 'not_found',
        title: 'Product Not Found in Database',
        description: `Barcode "${barcode}" is not registered in Open Food Facts. Snap a quick photo of the ingredient label instead!`,
      });
      return;
    }

    if (res.status === 'network_error') {
      setIsProcessing(false);
      setErrorState({
        type: 'offline',
        title: 'Connection Issue',
        description: res.error || 'Failed to reach product database. Check your internet connection.',
      });
      return;
    }

    if (res.product && profile) {
      // 1. Run deterministic verdict engine
      const verdict = runVerdictEngine(res.product, profile);

      // 2. Fetch plain-language AI explanation
      const conditionSummaries = [
        ...profile.lifeStages.map((s) => s.toUpperCase()),
        profile.diabetesType !== 'none' ? profile.diabetesType.toUpperCase() : null,
        profile.lactoseIntolerant ? 'Lactose Intolerant' : null,
      ].filter(Boolean) as string[];

      const explResult = await explainVerdict(
        res.product,
        verdict,
        conditionSummaries,
        profile.allergies,
        profile.id
      );

      // 3. Create Scan Record
      const record: ScanRecord = {
        id: uuidv4(),
        userId: profile.id,
        barcode: res.product.barcode,
        source: 'openfoodfacts',
        product: res.product,
        verdict,
        explanation: explResult.explanation,
        rulesVersion: verdict.rulesVersion,
        scannedAt: new Date().toISOString(),
      };

      await addScan(record);
      setIsProcessing(false);
      onScanComplete(record);
    } else {
      setIsProcessing(false);
    }
  };

  const handleLabelExtracted = (extractedData: Partial<Product>) => {
    onStartReview(extractedData);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '16px 20px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
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

        {/* Tab Toggle: Barcode vs Photo OCR */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-full)',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setErrorState(null);
              setActiveMode('barcode');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              color: activeMode === 'barcode' ? '#120815' : 'var(--text-secondary)',
              background: activeMode === 'barcode' ? 'var(--accent-rose)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Barcode size={16} />
            <span>Barcode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorState(null);
              setActiveMode('ocr');
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              color: activeMode === 'ocr' ? '#120815' : 'var(--text-secondary)',
              background: activeMode === 'ocr' ? 'var(--accent-lavender)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Camera size={16} />
            <span>Label OCR</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {errorState ? (
          <ErrorState
            type={errorState.type}
            title={errorState.title}
            description={errorState.description}
            actionText={errorState.type === 'not_found' ? '📸 Take Photo of Label' : 'Try Again'}
            onAction={() => {
              if (errorState.type === 'not_found') {
                setErrorState(null);
                setActiveMode('ocr');
              } else {
                setErrorState(null);
              }
            }}
            secondaryActionText="Cancel"
            onSecondaryAction={onBack}
          />
        ) : activeMode === 'barcode' ? (
          <BarcodeScanner
            onDetected={handleBarcodeDetected}
            onSwitchToUpload={() => setActiveMode('ocr')}
            isProcessing={isProcessing}
          />
        ) : (
          <LabelUploader onExtracted={handleLabelExtracted} userId={profile?.id} />
        )}

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 80,
              background: 'rgba(5, 5, 12, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                border: '3px solid rgba(232, 143, 167, 0.2)',
                borderTopColor: 'var(--accent-rose)',
                borderRadius: '50%',
                animation: 'pulseGlow 1s linear infinite',
                marginBottom: '16px',
              }}
            />
            <h3 className="title-md" style={{ color: 'var(--text-primary)' }}>
              Analyzing Food Safety...
            </h3>
            <p className="caption" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              Fetching nutritional facts & calculating verdict
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
