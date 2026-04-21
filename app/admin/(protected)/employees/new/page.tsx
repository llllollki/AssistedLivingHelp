import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createEmployeeAction } from "./actions";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewEmployeePage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

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
    redirect("/admin");
  }

  const error = params.error;

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Admin / Employees / New</p>
        <h1>Add employee account</h1>
        <p className="sectionIntro">
          Create a staff account. The employee will use this email address and
          password to sign in at{" "}
          <code style={{ fontSize: "0.9em" }}>/admin/login</code>. Accounts
          created here are never accessible via public signup.
        </p>

        {error && <p className="errorBanner">{error}</p>}

        <div style={{ maxWidth: 520 }}>
          <form className="authForm" action={createEmployeeAction}>
            <label>
              Display name
              <input
                type="text"
                name="displayName"
                required
                placeholder="Jane Smith"
                autoComplete="off"
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                name="email"
                required
                placeholder="jane@example.com"
                autoComplete="off"
              />
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
                At least 8 characters. Share this securely with the employee.
              </span>
            </label>
            <label>
              Role
              <select name="role" defaultValue="employee" required>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="authFormActions" style={{ flexDirection: "row", gap: "1rem" }}>
              <button type="submit" className="primaryButton">
                Create account
              </button>
              <Link href="/admin/employees" className="secondaryButton">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
