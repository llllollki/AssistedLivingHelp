import { redirect } from "next/navigation";
import { getActiveStaffUser } from "@/lib/supabase-server";
import { adminSignOutAction } from "@/lib/auth-actions";
import Link from "next/link";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { staffUser } = await getActiveStaffUser();

  if (!staffUser) {
    redirect("/admin/login");
  }

  return (
    <div>
      <div className="adminBanner">
        <div className="container adminBannerInner">
          <span className="adminBannerLabel">Internal - {staffUser.display_name}</span>
          <nav className="adminBannerNav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/leads">Leads</Link>
            <Link href="/admin/facilities">Facilities</Link>
            <Link href="/admin/partners">Partners</Link>
            <Link href="/admin/schedule">Schedule</Link>
            {staffUser.role === "admin" && <Link href="/admin/employees">Employees</Link>}
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
