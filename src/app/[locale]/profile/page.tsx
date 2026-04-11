import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: totalOrders } = await supabase
    .from("work_orders")
    .select("*", { count: "exact", head: true })
    .eq("installer_id", user.id);

  const { count: completedOrders } = await supabase
    .from("work_orders")
    .select("*", { count: "exact", head: true })
    .eq("installer_id", user.id)
    .eq("status", "completed");

  return (
    <ProfileClient
      locale={locale as "pl" | "en" | "de" | "ua"}
      profile={profile}
      email={user.email || ""}
      stats={{ total: totalOrders || 0, completed: completedOrders || 0 }}
    />
  );
}
