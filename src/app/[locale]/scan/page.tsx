import { QRScannerClient } from "@/components/qr-scanner";

export default function ScanPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <QRScannerClient locale={locale as "pl" | "en" | "de" | "ua"} />;
}
