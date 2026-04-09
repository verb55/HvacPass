import { PhotoUploadClient } from "@/components/work-order";
import { redirect } from "next/navigation";
import { photoTypeSchema } from "@/lib/validators";

export default async function PhotoPage({
  params,
}: {
  params: { locale: string; workOrderId: string; photoType: string };
}) {
  // Validate photo type
  const validTypes = ["protection", "technical", "final", "cleaning"];
  if (!validTypes.includes(params.photoType)) {
    redirect(`/${params.locale}/work-orders/${params.workOrderId}`);
  }

  return (
    <PhotoUploadClient
      workOrderId={params.workOrderId}
      photoType={params.photoType as "protection" | "technical" | "final" | "cleaning"}
      locale={params.locale as "pl" | "en" | "de" | "ua"}
    />
  );
}
