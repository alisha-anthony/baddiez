import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import { extractLabelFromImage } from '../../services/edgeFunctions';
import { Product } from '../../types/product';

export interface LabelUploaderProps {
  onExtracted: (extractedData: Partial<Product>) => void;
  userId?: string;
}

export const LabelUploader: React.FC<LabelUploaderProps> = ({
  onExtracted,
  userId,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // 1. Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 2. Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const resultString = reader.result as string;
        const base64Data = resultString.split(',')[1];
        const mimeType = file.type || 'image/jpeg';

        try {
          const res = await extractLabelFromImage(base64Data, mimeType, userId);
          if (res.data) {
            onExtracted(res.data);
          } else {
            setErrorMsg(res.error || 'Could not extract nutrition information from image.');
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Error communicating with extraction service.');
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('Failed to read image file.');
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch {
      setErrorMsg('Unexpected error handling file.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1.5px dashed rgba(255, 255, 255, 0.15)',
        textAlign: 'center',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '260px', marginBottom: '16px' }}>
          <img
            src={previewUrl}
            alt="Label preview"
            style={{
              width: '100%',
              maxHeight: '240px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'var(--accent-rose-soft)',
            border: '1px solid var(--accent-rose-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-rose)',
          }}
        >
          <Camera size={32} />
        </div>
      )}

      <h3 className="title-md" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
        {previewUrl ? 'Reading Food Label...' : 'Take or Upload Label Photo'}
      </h3>

      <p className="body-md" style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '300px' }}>
        Photograph the Nutrition Facts panel and Ingredients list clearly under good lighting.
      </p>

      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            color: 'var(--verdict-red)',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'left',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '280px' }}>
        <Button
          variant="primary"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isProcessing}
          fullWidth
          icon={<Upload size={18} />}
        >
          {previewUrl ? 'Try Another Photo' : 'Choose / Snap Photo'}
        </Button>
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--accent-lavender)',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <Sparkles size={14} />
        <span>Gemini Vision extracts ingredients & nutrients</span>
      </div>
    </div>
  );
};
