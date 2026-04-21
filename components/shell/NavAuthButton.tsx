import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { signOutAction } from "@/lib/auth-actions";

export async function NavAuthButton() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="navAuthGroup">
        <Link href="/facilities" className="navSecondary">
          Facilities
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="navSecondary">
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="navAuthGroup">
      <Link href="/login" className="navSecondary">
        Sign in
      </Link>
      <Link href="/get-help" className="navCta">
        Get Help
      </Link>
    </div>
  );
}
