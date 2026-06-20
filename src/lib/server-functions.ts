// Replacement for TanStack Start server functions
// These are now client-only functions that use Supabase directly

import { supabase } from './client';

// Auth utilities - no longer using TanStack Start middleware
export async function getAuthHeaders() {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    throw new Error('Unauthorized: No session available');
  }
  return {
    'Authorization': `Bearer ${session.data.session.access_token}`,
  };
}

// User admin functions - converted from TanStack Start RPC to direct Supabase calls
export async function ownerCreateUser(payload: {
  email: string;
  password: string;
  name?: string;
  role?: string;
}) {
  try {
    // Validate using Supabase Admin API (if available) or create via auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      user_metadata: {
        name: payload.name,
        role: payload.role,
      },
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function ownerDeleteUser(payload: { userId: string }) {
  try {
    const { error } = await supabase.auth.admin.deleteUser(payload.userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
