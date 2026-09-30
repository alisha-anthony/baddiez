import React, { createContext, useContext, useState, useEffect } from 'react';
import { HealthProfile, LifeStage, DiabetesType, Allergen } from '../types/profile';
import { fetchProfile, saveProfile, deleteUserAccountAndData } from '../services/supabase';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profile: HealthProfile | null;
  isLoading: boolean;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => void;
  updateProfile: (updated: Partial<HealthProfile>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  // Temporary onboarding state held in local state before authentication & consent
  onboardingDraft: Partial<HealthProfile>;
  updateOnboardingDraft: (draft: Partial<HealthProfile>) => void;
  completeOnboarding: (consentGiven: boolean) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const DISCLAIMER_STORAGE_KEY = 'shescan_disclaimer_accepted';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(() => {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true';
  });

  const [onboardingDraft, setOnboardingDraft] = useState<Partial<HealthProfile>>({
    lifeStages: [],
    diabetesType: 'none',
    lactoseIntolerant: false,
    allergies: [],
    customAllergies: [],
  });

  useEffect(() => {
    async function load() {
      if (user?.id) {
        setIsLoading(true);
        const data = await fetchProfile(user.id);
        if (data) {
          setProfile(data);
        }
        setIsLoading(false);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const acceptDisclaimer = () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    setDisclaimerAccepted(true);
  };

  const updateOnboardingDraft = (draft: Partial<HealthProfile>) => {
    setOnboardingDraft((prev) => ({ ...prev, ...draft }));
  };

  const completeOnboarding = async (consentGiven: boolean): Promise<boolean> => {
    if (!user?.id) return false;

    const newProfile: HealthProfile = {
      id: user.id,
      displayName: user.user_metadata?.display_name || 'Health Explorer',
      email: user.email || null,
      isAnonymous: Boolean(user.is_anonymous),
      lifeStages: onboardingDraft.lifeStages || [],
      diabetesType: onboardingDraft.diabetesType || 'none',
      lactoseIntolerant: Boolean(onboardingDraft.lactoseIntolerant),
      allergies: onboardingDraft.allergies || [],
      customAllergies: onboardingDraft.customAllergies || [],
      consentGiven,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error } = await saveProfile(newProfile);
    if (!error) {
      setProfile(newProfile);
      return true;
    }
    return false;
  };

  const updateProfile = async (updated: Partial<HealthProfile>): Promise<boolean> => {
    if (!profile) return false;

    const merged: HealthProfile = {
      ...profile,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await saveProfile(merged);
    if (!error) {
      setProfile(merged);
      return true;
    }
    return false;
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user?.id) return false;
    const { error } = await deleteUserAccountAndData(user.id);
    if (!error) {
      setProfile(null);
      return true;
    }
    return false;
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        disclaimerAccepted,
        acceptDisclaimer,
        updateProfile,
        deleteAccount,
        onboardingDraft,
        updateOnboardingDraft,
        completeOnboarding,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};
