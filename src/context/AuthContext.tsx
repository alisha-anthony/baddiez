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
    let unsubscribe: (() => void) | undefined;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser(data.session.user);
          } else {
            // No active Supabase session — check for local stored user
            setUser(getStoredLocalUser());
          }

          const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser(session.user);
            }
            // Don't set user to null here — preserve local guest users
          });

          unsubscribe = () => authListener.subscription.unsubscribe();
        } else {
          const localUser = getStoredLocalUser();
          setUser(localUser);
        }
      } catch (err) {
        console.warn('Auth initialization error, falling back to local user:', err);
        setUser(getStoredLocalUser());
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signInGuest = async () => {
    setIsLoading(true);
    try {
      const { user: newUser, error } = await apiSignInAnonymously();
      if (!error && newUser) {
        setUser(newUser);
      }
      return { user: newUser, error };
    } catch (err: any) {
      return { user: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const { user: newUser, error } = await apiSignUpWithEmail(email, password, name);
      if (!error && newUser) {
        setUser(newUser);
      }
      return { user: newUser, error };
    } catch (err: any) {
      return { user: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedIn, error } = await apiSignInWithEmail(email, password);
      if (!error && loggedIn) {
        setUser(loggedIn);
      }
      return { user: loggedIn, error };
    } catch (err: any) {
      return { user: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeAccount = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: upgraded, error } = await apiUpgradeAnonymousAccount(email, password);
      if (!error && upgraded) {
        setUser(upgraded);
      }
      return { user: upgraded, error };
    } catch (err: any) {
      return { user: null, error: err };
    } finally {
      setIsLoading(false);
    }
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
