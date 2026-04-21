import { resetPasswordAction } from "@/lib/auth-actions";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const error = params.error;

  return (
    <div className="authPage">
      <div className="authCard">
        <p className="eyebrow">Password reset</p>
        <h1>Set new password</h1>
        <p className="authSubtext">
          Choose a new password for your account.
        </p>

        {error && <p className="errorBanner">{error}</p>}

        <form className="authForm" action={resetPasswordAction}>
          <label>
            New password
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <div className="authFormActions">
            <button type="submit" className="primaryButton">
              Update password
            </button>
          </div>
        </form>

        <div className="authLinks">
          <Link href="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
