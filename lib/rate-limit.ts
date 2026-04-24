import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

function currentWindowStart(): string {
  const now = new Date();
  const slotMinute = Math.floor(now.getMinutes() / WINDOW_MINUTES) * WINDOW_MINUTES;
  const d = new Date(now);
  d.setMinutes(slotMinute, 0, 0);
  return d.toISOString();
}

export async function checkIntakeRateLimit(ip: string): Promise<{ limited: boolean }> {
  if (!ip || ip === "unknown") return { limited: false };

  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) return { limited: false };

  try {
    const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
      p_ip: ip,
      p_window_start: currentWindowStart()
    });

    if (error || data == null) return { limited: false };
    return { limited: (data as number) > MAX_ATTEMPTS };
  } catch {
    return { limited: false };
  }
}
