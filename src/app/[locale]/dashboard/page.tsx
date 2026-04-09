import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { WorkOrderWithDetails } from "@/types";

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get active work orders
  const { data: activeOrders } = await supabase
    .from("work_orders")
    .select(`
      *,
      unit:units(
        *,
        customer:customers(*)
      ),
      installer:profiles(*),
      photos(*)
    `)
    .eq("installer_id", user.id)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1);

  // Get recent completed orders
  const { data: recentOrders } = await supabase
    .from("work_orders")
    .select(`
      *,
      unit:units(
        *,
        customer:customers(*)
      ),
      installer:profiles(*),
      photos(*)
    `)
    .eq("installer_id", user.id)
    .in("status", ["completed", "cancelled"])
    .order("created_at", { ascending: false })
    .limit(10);

  // Calculate stats
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count: completedThisMonth } = await supabase
    .from("work_orders")
    .select("*", { count: "exact", head: true })
    .eq("installer_id", user.id)
    .eq("status", "completed")
    .gte("completed_at", firstDayOfMonth.toISOString());

  return (
    <DashboardClient
      locale={locale as "pl" | "en" | "de" | "ua"}
      activeOrders={(activeOrders as WorkOrderWithDetails[]) || []}
      recentOrders={(recentOrders as WorkOrderWithDetails[]) || []}
      stats={{
        activeOrders: activeOrders?.length || 0,
        completedThisMonth: completedThisMonth || 0,
      }}
    />
  );
}
