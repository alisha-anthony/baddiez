import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanRecord } from '../types/scan';
import { fetchUserScans, saveUserScan } from '../services/supabase';
import { useAuth } from './AuthContext';

interface HistoryContextType {
  scans: ScanRecord[];
  isLoading: boolean;
  addScan: (scan: ScanRecord) => Promise<boolean>;
  getScanById: (id: string) => ScanRecord | undefined;
  refreshHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = async () => {
    if (user?.id) {
      setIsLoading(true);
      const data = await fetchUserScans(user.id);
      setScans(data);
      setIsLoading(false);
    } else {
      setScans([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const addScan = async (scan: ScanRecord): Promise<boolean> => {
    const { error } = await saveUserScan(scan);
    if (!error) {
      setScans((prev) => [scan, ...prev]);
      return true;
    }
    return false;
  };

  const getScanById = (id: string): ScanRecord | undefined => {
    return scans.find((s) => s.id === id);
  };

  return (
    <HistoryContext.Provider
      value={{
        scans,
        isLoading,
        addScan,
        getScanById,
        refreshHistory: loadHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within a HistoryProvider');
  return context;
};
