"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function makeClient() {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function loginAction(formData: FormData) {
  const supabase = await makeClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/facilities";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const params = new URLSearchParams({ error: "Invalid email or password", next });
    redirect(`/login?${params}`);
  }
  redirect(next);
}

export async function signupAction(formData: FormData) {
  const supabase = await makeClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/facilities`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Session is null when email confirmation is required.
  if (data.session) {
    redirect("/facilities");
  }
  redirect("/signup?success=check_email");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await makeClient();
  const email = formData.get("email") as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/forgot-password?success=check_email");
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await makeClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password !== confirmPassword) {
    redirect("/reset-password?error=Passwords+do+not+match");
  }
  if (password.length < 8) {
    redirect("/reset-password?error=Password+must+be+at+least+8+characters");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/login?success=password_updated");
}

export async function adminLoginAction(formData: FormData) {
  const supabase = await makeClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    redirect("/admin/login?error=Invalid+credentials");
  }

  // Verify staff membership — RLS will return null if this user is not in staff_users.
  const { data: staffUser } = await supabase
    .from("staff_users")
    .select("id, is_active")
    .eq("id", data.user.id)
    .single();

  if (!staffUser || !staffUser.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Access+denied");
  }

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await makeClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function adminSignOutAction() {
  const supabase = await makeClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
