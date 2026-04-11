import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnitsClient } from "./units-client";

export default async function UnitsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { qr?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // If QR code param, try to find unit and start work order flow
  const qrCode = searchParams.qr;
  if (qrCode) {
    const { data: unit } = await supabase
      .from("units")
      .select("id")
      .eq("qr_code_id", qrCode)
      .single();

    if (unit) {
      // Check for existing in-progress order
      const { data: existing } = await supabase
        .from("work_orders")
        .select("id")
        .eq("unit_id", unit.id)
        .eq("status", "in_progress")
        .single();

      if (existing) {
        redirect(`/${locale}/work-orders/${existing.id}`);
      }
    }
  }

  const { data: units } = await supabase
    .from("units")
    .select("*, customer:customers(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <UnitsClient
      locale={locale as "pl" | "en" | "de" | "ua"}
      units={units || []}
      scannedQr={qrCode}
    />
  );
}
