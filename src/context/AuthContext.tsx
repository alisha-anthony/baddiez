import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  signInAnonymously as apiSignInAnonymously,
  signUpWithEmail as apiSignUpWithEmail,
  signInWithEmail as apiSignInWithEmail,
  upgradeAnonymousAccount as apiUpgradeAnonymousAccount,
  signOutUser as apiSignOutUser,
  getStoredLocalUser,
} from '../services/supabase';

interface AuthContextType {
  user: any | null;
  isAnonymous: boolean;
  isLoading: boolean;
  signInGuest: () => Promise<any>;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  upgradeAccount: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser(data.session.user);
        } else {
          // Check local stored user
          setUser(getStoredLocalUser());
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });

        setIsLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        const localUser = getStoredLocalUser();
        setUser(localUser);
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const signInGuest = async () => {
    setIsLoading(true);
    const { user: newUser, error } = await apiSignInAnonymously();
    if (!error && newUser) {
      setUser(newUser);
    }
    setIsLoading(false);
    return { user: newUser, error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    const { user: newUser, error } = await apiSignUpWithEmail(email, password, name);
    if (!error && newUser) {
      setUser(newUser);
    }
    setIsLoading(false);
    return { user: newUser, error };
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { user: loggedIn, error } = await apiSignInWithEmail(email, password);
    if (!error && loggedIn) {
      setUser(loggedIn);
    }
    setIsLoading(false);
    return { user: loggedIn, error };
  };

  const upgradeAccount = async (email: string, password: string) => {
    setIsLoading(true);
    const { user: upgraded, error } = await apiUpgradeAnonymousAccount(email, password);
    if (!error && upgraded) {
      setUser(upgraded);
    }
    setIsLoading(false);
    return { user: upgraded, error };
  };

  const signOut = async () => {
    await apiSignOutUser();
    setUser(null);
  };

  const isAnonymous = Boolean(user?.is_anonymous);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAnonymous,
        isLoading,
        signInGuest,
        signUp,
        signIn,
        upgradeAccount,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
