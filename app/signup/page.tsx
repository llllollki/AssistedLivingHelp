import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { signupAction } from "@/lib/auth-actions";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/facilities");

  const error = params.error;
  const success = params.success;

  if (success === "check_email") {
    return (
      <div className="authPage">
        <div className="authCard">
          <p className="eyebrow">Family account</p>
          <h1>Check your email</h1>
          <p className="authSubtext">
            We sent a confirmation link to your email address. Click it to
            activate your account and access facility search.
          </p>
          <div className="authLinks">
            <Link href="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <p className="eyebrow">Family account</p>
        <h1>Create account</h1>
        <p className="authSubtext">
          Create a free account to browse our vetted facility subset after you
          sign in. Concierge follow-up still happens through our staff workflow.
        </p>

        {error && <p className="errorBanner">{error}</p>}

        <form className="authForm" action={signupAction}>
          <div className="authFormRow">
            <label>
              First name
              <input
                type="text"
                name="firstName"
                required
                autoComplete="given-name"
                placeholder="Jane"
              />
            </label>
            <label>
              Last name
              <input
                type="text"
                name="lastName"
                required
                autoComplete="family-name"
                placeholder="Smith"
              />
            </label>
          </div>
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
              autoComplete="new-password"
              minLength={8}
            />
            <span className="heroMicrocopy" style={{ marginTop: 0 }}>
              At least 8 characters
            </span>
          </label>
          <div className="authFormActions">
            <button type="submit" className="primaryButton">
              Create account
            </button>
          </div>
        </form>

        <div className="authLinks">
          <span>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
