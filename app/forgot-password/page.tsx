import { forgotPasswordAction } from "@/lib/auth-actions";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const error = params.error;
  const success = params.success;

  if (success === "check_email") {
    return (
      <div className="authPage">
        <div className="authCard">
          <p className="eyebrow">Password reset</p>
          <h1>Check your email</h1>
          <p className="authSubtext">
            If that email address is registered, we sent a password reset link.
            Check your inbox and spam folder.
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
        <p className="eyebrow">Password reset</p>
        <h1>Reset password</h1>
        <p className="authSubtext">
          Enter your email address and we will send you a reset link.
        </p>

        {error && <p className="errorBanner">{error}</p>}

        <form className="authForm" action={forgotPasswordAction}>
          <label>
            Email address
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <div className="authFormActions">
            <button type="submit" className="primaryButton">
              Send reset link
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
