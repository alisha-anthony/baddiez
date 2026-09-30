import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { HealthProfile } from '../types/profile';
import { ScanRecord } from '../types/scan';

// Read environment variables (sanitized defensively)
const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local fallback storage keys for seamless offline / zero-config demo
const LOCAL_PROFILE_KEY = 'shescan_local_profile';
const LOCAL_SCANS_KEY = 'shescan_local_scans';
const LOCAL_USER_KEY = 'shescan_local_user';

// Helper to verify if an ID is a valid RFC 4122 UUID (required by Postgres auth.users FK)
export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export interface AuthUserState {
  user: User | { id: string; email?: string; is_anonymous: boolean } | null;
  isAnonymous: boolean;
}

// -------------------------------------------------------------
// Auth Services
// -------------------------------------------------------------

export async function signInAnonymously(): Promise<{ user: any; error: any }> {
  // Try Supabase anonymous sign-in if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data?.user) {
        return { user: data.user, error: null };
      }
      console.info('Supabase anonymous sign-in not enabled or failed, using local guest session:', error?.message);
    } catch (err) {
      console.warn('Supabase anonymous auth exception:', err);
    }
  }

  // Guaranteed local guest fallback
  const existingLocal = getStoredLocalUser();
  if (existingLocal?.id && existingLocal.is_anonymous) {
    return { user: existingLocal, error: null };
  }

  const guestUser = {
    id: 'guest-' + Math.random().toString(36).substring(2, 9),
    email: undefined,
    is_anonymous: true,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
  return { user: guestUser, error: null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: any; error: any }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (!error && data?.user) {
        return { user: data.user, error: null };
      }
      if (error) {
        return { user: null, error };
      }
    } catch (err: any) {
      return { user: null, error: err };
    }
  }

  const localUser = {
    id: 'user-' + Math.random().toString(36).substring(2, 9),
    email,
    is_anonymous: false,
    user_metadata: { display_name: displayName },
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  return { user: localUser, error: null };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: any; error: any }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data?.user) {
        return { user: data.user, error: null };
      }
      if (error) {
        return { user: null, error };
      }
    } catch (err: any) {
      return { user: null, error: err };
    }
  }

  const localUser = {
    id: 'user-' + Math.random().toString(36).substring(2, 9),
    email,
    is_anonymous: false,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
  return { user: localUser, error: null };
}

export async function upgradeAnonymousAccount(
  email: string,
  password: string
): Promise<{ user: any; error: any }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
      });
      if (!error && data?.user) {
        return { user: data.user, error: null };
      }
    } catch {}
  }

  const existing = getStoredLocalUser();
  const upgradedUser = {
    ...existing,
    email,
    is_anonymous: false,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(upgradedUser));
  return { user: upgradedUser, error: null };
}

export async function signOutUser(): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }

  localStorage.removeItem(LOCAL_USER_KEY);
  return { error: null };
}

export function getStoredLocalUser(): any {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Profile Database Services
// -------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<HealthProfile | null> {
  // 1. If user ID is a valid Postgres UUID, try fetching from Supabase
  if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        const profile: HealthProfile = {
          id: data.id,
          displayName: data.display_name,
          lifeStages: data.life_stages || [],
          diabetesType: data.diabetes_type || 'none',
          lactoseIntolerant: Boolean(data.lactose_intolerant),
          allergies: data.allergies || [],
          customAllergies: data.custom_allergies || [],
          consentGiven: Boolean(data.consent_given),
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // Cache locally
        try {
          localStorage.setItem(`${LOCAL_PROFILE_KEY}_${userId}`, JSON.stringify(profile));
        } catch {}

        return profile;
      }
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err);
    }
  }

  // 2. Local fallback storage
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: HealthProfile): Promise<{ error: any }> {
  // Always persist locally first so user data is never lost
  try {
    localStorage.setItem(
      `${LOCAL_PROFILE_KEY}_${profile.id}`,
      JSON.stringify(profile)
    );
  } catch (err) {
    console.warn('LocalStorage save profile error:', err);
  }

  // If Supabase is configured and this is a registered auth UUID, sync to remote
  if (isSupabaseConfigured && supabase && isValidUuid(profile.id)) {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        display_name: profile.displayName,
        life_stages: profile.lifeStages,
        diabetes_type: profile.diabetesType,
        lactose_intolerant: profile.lactoseIntolerant,
        allergies: profile.allergies,
        custom_allergies: profile.customAllergies,
        consent_given: profile.consentGiven,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('Supabase profile sync warning (saved locally):', error.message || error);
      }
    } catch (err) {
      console.warn('Supabase profile sync exception (saved locally):', err);
    }
  }

  return { error: null };
}

export async function deleteUserAccountAndData(userId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
    try {
      await supabase.from('scans').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // Local fallback cleanup
  localStorage.removeItem(`${LOCAL_PROFILE_KEY}_${userId}`);
  localStorage.removeItem(`${LOCAL_SCANS_KEY}_${userId}`);
  localStorage.removeItem(LOCAL_USER_KEY);
  return { error: null };
}

// -------------------------------------------------------------
// Scans Database Services
// -------------------------------------------------------------

export async function fetchUserScans(userId: string): Promise<ScanRecord[]> {
  if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('scanned_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          barcode: row.barcode,
          source: row.source,
          product: row.product,
          verdict: row.verdict,
          explanation: row.explanation,
          rulesVersion: row.rules_version,
          scannedAt: row.scanned_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch scans error:', err);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_SCANS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUserScan(scan: ScanRecord): Promise<{ error: any }> {
  // Always persist locally first
  try {
    const existing = await fetchUserScans(scan.userId);
    const updated = [scan, ...existing.filter((s) => s.id !== scan.id)];
    localStorage.setItem(
      `${LOCAL_SCANS_KEY}_${scan.userId}`,
      JSON.stringify(updated)
    );
  } catch (err) {
    console.warn('Local scan save error:', err);
  }

  // If Supabase is configured and user ID is a valid UUID, sync to remote
  if (isSupabaseConfigured && supabase && isValidUuid(scan.userId)) {
    try {
      const { error } = await supabase.from('scans').insert({
        id: scan.id,
        user_id: scan.userId,
        barcode: scan.barcode,
        source: scan.source,
        product: scan.product,
        verdict: scan.verdict,
        explanation: scan.explanation,
        rules_version: scan.rulesVersion,
        scanned_at: scan.scannedAt,
      });

      if (error) {
        console.warn('Supabase scan sync warning (saved locally):', error.message || error);
      }
    } catch (err) {
      console.warn('Supabase scan sync exception (saved locally):', err);
    }
  }

  return { error: null };
}
