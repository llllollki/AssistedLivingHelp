"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function createEmployeeAction(formData: FormData) {
  // Verify the acting user is an admin via the session-scoped client.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: currentStaff } = await supabase
    .from("staff_users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentStaff || currentStaff.role !== "admin") {
    redirect("/admin?error=not_admin");
  }

  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string).trim();
  const role = formData.get("role") as string;

  if (!email || !password || !displayName) {
    redirect("/admin/employees/new?error=All+fields+are+required");
  }
  if (role !== "admin" && role !== "employee") {
    redirect("/admin/employees/new?error=Invalid+role");
  }
  if (password.length < 8) {
    redirect("/admin/employees/new?error=Password+must+be+at+least+8+characters");
  }

  // Use the service role client to create the auth user and staff record.
  // This bypasses RLS and skips email confirmation for internal accounts.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: newAuthUser, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !newAuthUser?.user) {
    redirect(
      `/admin/employees/new?error=${encodeURIComponent(
        createError?.message ?? "Failed to create account"
      )}`
    );
  }

  const { error: staffError } = await adminClient.from("staff_users").insert({
    id: newAuthUser.user.id,
    display_name: displayName,
    role,
    is_active: true,
  });

  if (staffError) {
    // Rollback: delete the auth user we just created.
    await adminClient.auth.admin.deleteUser(newAuthUser.user.id);
    redirect(
      `/admin/employees/new?error=${encodeURIComponent(staffError.message)}`
    );
  }

  redirect("/admin/employees?success=created");
}
