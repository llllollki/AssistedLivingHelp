import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminEmployeesPage() {
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

  const { data: employees } = await supabase
    .from("staff_users")
    .select("id, display_name, role, is_active, created_at")
    .order("created_at");

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Admin / Employees</p>
        <h1>Employee accounts</h1>
        <p className="sectionIntro">
          Staff accounts that can access the admin area. Only admins can create
          new accounts.
        </p>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/admin/employees/new" className="primaryButton">
            Add employee
          </Link>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Display name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.display_name}</td>
                  <td>{emp.role}</td>
                  <td>{emp.is_active ? "Active" : "Inactive"}</td>
                  <td>
                    {new Date(emp.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {(!employees || employees.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ color: "var(--muted)" }}>
                    No employees yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
