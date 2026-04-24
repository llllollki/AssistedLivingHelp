import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type StaffUser = {
  id: string;
  display_name: string;
  role: string;
  is_active: boolean;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component - session refresh handled by middleware.
          }
        }
      }
    }
  );
}

export async function getActiveStaffUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, staffUser: null };
  }

  const { data: staffUser } = await supabase
    .from("staff_users")
    .select("id, display_name, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return {
    supabase,
    user,
    staffUser: (staffUser as StaffUser | null) ?? null
  };
}

export async function requireActiveStaffUser() {
  const { supabase, user, staffUser } = await getActiveStaffUser();

  if (!user || !staffUser) {
    redirect("/admin/login?error=Access+denied");
  }

  return { supabase, user, staffUser };
}

export async function requireAdminStaffUser() {
  const context = await requireActiveStaffUser();

  if (context.staffUser.role !== "admin") {
    redirect("/admin?error=not_admin");
  }

  return context;
}
