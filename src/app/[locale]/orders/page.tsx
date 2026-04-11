import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrdersClient } from "./orders-client";
import type { WorkOrderWithDetails } from "@/types";

export default async function OrdersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: orders } = await supabase
    .from("work_orders")
    .select(`*, unit:units(*, customer:customers(*)), installer:profiles(*), photos(*)`)
    .eq("installer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <OrdersClient
      locale={locale as "pl" | "en" | "de" | "ua"}
      orders={(orders as WorkOrderWithDetails[]) || []}
    />
  );
}
