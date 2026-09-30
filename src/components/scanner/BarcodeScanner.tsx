import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BarcodeDetector as BarcodeDetectorPolyfill } from 'barcode-detector';
import { Camera, Zap, ZapOff, Sparkles } from 'lucide-react';
import { ScanFrame } from './ScanFrame';
import { CameraError } from './CameraError';

export interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onSwitchToUpload: () => void;
  isProcessing?: boolean;
}

// Sample preset barcodes for instant testing on laptop / desktop
export const SAMPLE_BARCODES = [
  {
    barcode: '3017620422003',
    name: 'Nutella Hazelnut Spread',
    tag: 'High Sugar & Dairy',
  },
  {
    barcode: '7622210449283',
    name: 'Oreo Original Cookies',
    tag: 'Refined Carbs & Sugar',
  },
  {
    barcode: '5449000000996',
    name: 'Coca-Cola 330ml',
    tag: 'Extreme Sugar Beverage',
  },
  {
    barcode: '3033490004523',
    name: 'Danone Plain Natural Yogurt',
    tag: 'Lactose & Calcium',
  },
  {
    barcode: '0041220576920',
    name: 'Pure Rolled Oats',
    tag: 'High Fiber Wholesome',
  },
];

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onDetected,
  onSwitchToUpload,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraError, setCameraError] = useState<
    'permission_denied' | 'no_camera' | 'not_secure' | 'unknown' | null
  >(null);
  const [showPresets, setShowPresets] = useState(false);
  const scanningRef = useRef<boolean>(true);

  // Initialize Barcode Detector (browser native or polyfill)
  const getDetector = useCallback(async () => {
    try {
      if ('BarcodeDetector' in window) {
        return new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });
      }
    } catch {
      // Fallback to polyfill
    }
    return new BarcodeDetectorPolyfill({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
    });
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    scanningRef.current = true;

    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('not_secure');
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('no_camera');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Check for torch capability
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('permission_denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('no_camera');
      } else {
        setCameraError('unknown');
      }
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      scanningRef.current = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Frame detection loop
  useEffect(() => {
    let animationFrameId: number;
    let detectorPromise = getDetector();

    const scanFrame = async () => {
      if (
        scanningRef.current &&
        !isProcessing &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        try {
          const detector = await detectorPromise;
          const barcodes = await detector.detect(videoRef.current);

          if (barcodes.length > 0 && scanningRef.current && !isProcessing) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue && rawValue.trim()) {
              scanningRef.current = false;
              onDetected(rawValue.trim());
              return;
            }
          }
        } catch {
          // Frame skip
        }
      }

      if (scanningRef.current && !isProcessing) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
    };

    const interval = setTimeout(() => {
      scanFrame();
    }, 500);

    return () => {
      clearTimeout(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [getDetector, isProcessing, onDetected]);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchEnabled }],
      });
      setTorchEnabled(!torchEnabled);
    } catch {
      // Ignored if device doesn't support torch
    }
  };

  if (cameraError) {
    return (
      <CameraError
        errorType={cameraError}
        onRetry={startCamera}
        onSwitchToUpload={onSwitchToUpload}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
        background: '#040408',
      }}
    >
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isProcessing ? 0.4 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Dark Translucent Mask around the center scanning square */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 5, 12, 0.45)',
          pointerEvents: 'none',
        }}
      />

      {/* Target Scan Frame */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <ScanFrame />
      </div>

      <p
        className="caption"
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: '16px',
          color: '#ffffff',
          fontWeight: 600,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Align barcode inside the glowing frame
      </p>

      {/* Floating Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 20,
        }}
      >
        {hasTorch && (
          <button
            type="button"
            onClick={toggleTorch}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: torchEnabled ? 'var(--accent-rose)' : 'rgba(0, 0, 0, 0.6)',
              color: torchEnabled ? '#120815' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {torchEnabled ? <Zap size={20} /> : <ZapOff size={20} />}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          title="Test with demo barcodes"
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(18, 18, 31, 0.8)',
            color: 'var(--accent-lavender)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(196, 181, 253, 0.3)',
          }}
        >
          <Sparkles size={14} />
          <span>Demo Items</span>
        </button>
      </div>

      {/* Demo Barcodes Drawer for zero-friction testing */}
      {showPresets && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 30,
            background: 'rgba(18, 18, 31, 0.95)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Test Without Packaging (Demo Barcodes)
            </span>
            <button
              onClick={() => setShowPresets(false)}
              style={{ fontSize: '12px', color: 'var(--text-muted)' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SAMPLE_BARCODES.map((item) => (
              <button
                key={item.barcode}
                type="button"
                onClick={() => {
                  setShowPresets(false);
                  onDetected(item.barcode);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>
                    {item.tag}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-rose-soft)',
                    color: 'var(--accent-rose)',
                  }}
                >
                  Scan
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
