import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkOrderDetailClient } from "@/components/work-order";
import type { WorkOrderWithDetails } from "@/types";

export default async function WorkOrderPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  // Fetch work order with related data
  const { data: workOrder, error } = await supabase
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
    .eq("id", params.id)
    .eq("installer_id", user.id)
    .single();

  if (error || !workOrder) {
    redirect(`/${params.locale}/dashboard`);
  }

  return (
    <WorkOrderDetailClient
      workOrder={workOrder as WorkOrderWithDetails}
      locale={params.locale as "pl" | "en" | "de" | "ua"}
    />
  );
}
