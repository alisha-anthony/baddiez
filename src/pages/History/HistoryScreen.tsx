import React, { useState } from 'react';
import { Search, History, Filter } from 'lucide-react';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { VerdictBadge } from '../../components/ui/VerdictBadge/VerdictBadge';
import { useHistory } from '../../context/HistoryContext';
import { ScanRecord } from '../../types/scan';
import { VerdictLevel } from '../../types/verdict';

export interface HistoryScreenProps {
  onSelectScan: (record: ScanRecord) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onSelectScan }) => {
  const { scans } = useHistory();
  const [search, setSearch] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<VerdictLevel | 'all'>('all');

  const filtered = scans.filter((record) => {
    const matchesSearch =
      record.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (record.product.brand && record.product.brand.toLowerCase().includes(search.toLowerCase()));

    const matchesVerdict = filterVerdict === 'all' || record.verdict.overall === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h1 className="title-xl" style={{ marginBottom: '4px' }}>
          Scan History
        </h1>
        <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
          Review all packaged items scanned against your health profile.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scanned products or brands..."
          className="glass-input"
          style={{ paddingLeft: '40px' }}
        />
        <Search
          size={18}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        {[
          { id: 'all', label: 'All Scans' },
          { id: 'green', label: '🟢 Safe' },
          { id: 'yellow', label: '🟡 Caution' },
          { id: 'red', label: '🔴 Avoid' },
          { id: 'insufficient_data', label: '⚪ Unknown' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilterVerdict(item.id as any)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 600,
              background: filterVerdict === item.id ? 'var(--accent-rose)' : 'rgba(255,255,255,0.05)',
              color: filterVerdict === item.id ? '#120815' : 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.08)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Scans List */}
      {filtered.length === 0 ? (
        <GlassCard padding="lg" style={{ textAlign: 'center', marginTop: '20px' }}>
          <History size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 className="title-md" style={{ marginBottom: '6px' }}>No Scans Found</h3>
          <p className="caption" style={{ color: 'var(--text-secondary)' }}>
            {scans.length === 0
              ? 'Your scan history is empty. Products you scan will be recorded here.'
              : 'No items match your filter criteria.'}
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((record) => {
            const dateStr = new Date(record.scannedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <GlassCard
                key={record.id}
                variant="interactive"
                padding="md"
                onClick={() => onSelectScan(record)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {record.product.imageUrl ? (
                      <img
                        src={record.product.imageUrl}
                        alt=""
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'contain',
                          background: '#ffffff',
                          padding: '2px',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        📦
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {record.product.name}
                      </div>
                      <div className="caption" style={{ color: 'var(--text-muted)' }}>
                        {record.product.brand || 'Packaged item'} • {dateStr}
                      </div>
                    </div>
                  </div>

                  <VerdictBadge verdict={record.verdict.overall} size="sm" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
