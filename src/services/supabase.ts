import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { HealthProfile } from '../types/profile';
import { ScanRecord } from '../types/scan';

// Read environment variables (or provide placeholders)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

export interface AuthUserState {
  user: User | { id: string; email?: string; is_anonymous: boolean } | null;
  isAnonymous: boolean;
}

// -------------------------------------------------------------
// Auth Services
// -------------------------------------------------------------

export async function signInAnonymously(): Promise<{ user: any; error: any }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInAnonymously();
    return { user: data.user, error };
  }

  // Local fallback
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { user: data.user, error };
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
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
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
    });
    return { user: data.user, error };
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
    const { error } = await supabase.auth.signOut();
    return { error };
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
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
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
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: HealthProfile): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase) {
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
    return { error };
  }

  // Local fallback
  try {
    localStorage.setItem(
      `${LOCAL_PROFILE_KEY}_${profile.id}`,
      JSON.stringify(profile)
    );
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function deleteUserAccountAndData(userId: string): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase) {
    // Delete profile and scans (cascade deletes in postgres)
    await supabase.from('scans').delete().eq('user_id', userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.signOut();
    return { error };
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
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('scanned_at', { ascending: false });

    if (error || !data) return [];

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

  // Local fallback
  try {
    const raw = localStorage.getItem(`${LOCAL_SCANS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUserScan(scan: ScanRecord): Promise<{ error: any }> {
  if (isSupabaseConfigured && supabase) {
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
    return { error };
  }

  // Local fallback
  try {
    const existing = await fetchUserScans(scan.userId);
    const updated = [scan, ...existing];
    localStorage.setItem(
      `${LOCAL_SCANS_KEY}_${scan.userId}`,
      JSON.stringify(updated)
    );
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}
