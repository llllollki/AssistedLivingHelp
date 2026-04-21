import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { adminSignOutAction } from "@/lib/auth-actions";
import Link from "next/link";

type StaffUser = {
  id: string;
  display_name: string;
  role: string;
};

async function getActiveStaffUser(): Promise<StaffUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("staff_users")
    .select("id, display_name, role")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  return data;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffUser = await getActiveStaffUser();

  if (!staffUser) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="adminBanner">
        <div className="container adminBannerInner">
          <span className="adminBannerLabel">
            Internal — {staffUser.display_name}
          </span>
          <nav className="adminBannerNav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/leads">Leads</Link>
            <Link href="/admin/facilities">Facilities</Link>
            <Link href="/admin/partners">Partners</Link>
            <Link href="/admin/schedule">Schedule</Link>
            {staffUser.role === "admin" && (
              <Link href="/admin/employees">Employees</Link>
            )}
          </nav>
          <form action={adminSignOutAction}>
            <button type="submit" className="adminSignOut">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
