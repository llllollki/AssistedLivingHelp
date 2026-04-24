import { redirect } from "next/navigation";
import { getActiveStaffUser } from "@/lib/supabase-server";
import { adminLoginAction } from "@/lib/auth-actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

  const { user, staffUser } = await getActiveStaffUser();

  if (user && staffUser) {
    redirect("/admin");
  }

  const error = params.error;

  return (
    <div className="authPage">
      <div className="authCard">
        <p className="eyebrow">Internal access</p>
        <h1>Staff sign in</h1>
        <p className="authSubtext">
          This area is restricted to Assisted Living Help staff. Contact your
          administrator if you need access.
        </p>

        {error && <p className="errorBanner">{error}</p>}

        <form className="authForm" action={adminLoginAction}>
          <label>
            Email address
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </label>
          <div className="authFormActions">
            <button type="submit" className="primaryButton">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
