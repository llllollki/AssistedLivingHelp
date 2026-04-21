import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { loginAction } from "@/lib/auth-actions";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ error?: string; success?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/facilities");

  const error = params.error;
  const success = params.success;
  const next = params.next ?? "/facilities";

  return (
    <div className="authPage">
      <div className="authCard">
        <p className="eyebrow">Family account</p>
        <h1>Sign in</h1>
        <p className="authSubtext">
          Sign in to browse assisted living facilities and track your inquiry.
        </p>

        {error && <p className="errorBanner">{error}</p>}
        {success === "password_updated" && (
          <p className="successBanner">Password updated. Please sign in.</p>
        )}

        <form className="authForm" action={loginAction}>
          <input type="hidden" name="next" value={next} />
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

        <div className="authLinks">
          <Link href="/forgot-password">Forgot your password?</Link>
          <span>
            No account?{" "}
            <Link href="/signup">Create one</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
