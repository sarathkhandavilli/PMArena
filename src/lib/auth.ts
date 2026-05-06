import { supabase } from './supabase';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenant_id: string | null;
  is_active: boolean;
}

export const signUpEmployee = async (
  email: string,
  password: string,
  name: string,
  tenantId: string
) => {

  // 1. Check tenant limit
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, current_users, max_users')
    .eq('id', tenantId)
    .single();

  if (tenantError) {
    throw new Error('Failed to fetch tenant information.');
  }

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (tenant.current_users >= tenant.max_users) {
    throw new Error('User limit reached for this organization');
  }

  // 2. Signup Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user?.id;

  if (!userId) {
    throw new Error('User creation failed');
  }

  // 3. Insert into users table
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email,
      name,
      role: 'EMPLOYEE',
      tenant_id: tenantId,
    });

  if (dbError) {
    throw new Error(`Failed to create profile: ${dbError.message}`);
  }

  /**
   * IMPORTANT:
   * Trigger automatically increments current_users
   * DO NOT update tenants table here anymore
   */

  // 4. Refresh JWT
  await supabase.auth.signOut();

  const { data: refreshedSession, error: reloginError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (reloginError) {
    throw new Error(reloginError.message);
  }

  return refreshedSession;
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("SUPABASE RESPONSE:", data, error);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getCurrentUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};
