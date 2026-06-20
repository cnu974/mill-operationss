// Client-only user management functions (no longer using TanStack Start)
// These use Supabase client directly

type CreateInput = { email: string; password: string; full_name: string; role: string };

const ALLOWED_ROLES = new Set([
  "owner","procurement_manager","procurement_manager","production_operator","sales_executive","accounts",
]);

function validateCreateInput(input: CreateInput) {
  if (!input?.email) throw new Error("Username or email required");
  const raw = input.email.trim();
  const email = raw.includes("@") ? raw : `${raw.toLowerCase()}@mill.local`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid username/email");
  if (!input?.password || input.password.length < 6) throw new Error("Password must be at least 6 characters");
  if (!input?.full_name || input.full_name.length < 1) throw new Error("Full name required");
  if (!ALLOWED_ROLES.has(input.role)) throw new Error("Invalid role");
  return { ...input, email };
}

// Note: These functions now use the client-side Supabase API
// Server-side admin functionality requires a backend
export async function ownerCreateUser(input: CreateInput) {
  try {
    const validated = validateCreateInput(input);
    
    // For client-only app, we use Supabase REST API directly
    // In production, these operations should go through a backend
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          email: validated.email,
          password: validated.password,
          email_confirm: true,
          user_metadata: { 
            full_name: validated.full_name, 
            requested_role: validated.role === "owner" ? null : validated.role 
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const created = await response.json();
    return { id: created.id, email: created.email };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function ownerDeleteUser(input: { user_id: string }) {
  try {
    if (!input?.user_id) throw new Error("user_id required");
    
    // For client-only app, deletion requires a backend with proper authentication
    // This is a placeholder that would need backend implementation
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${input.user_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return { ok: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
