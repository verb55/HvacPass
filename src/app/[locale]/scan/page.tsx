import { QRScannerClient } from "@/components/qr-scanner";

export default function ScanPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    /** * Ta klasa 'fixed inset-0 z-50' to klucz do sukcesu:
     * - fixed: wyrywa element z normalnego układu strony
     * - inset-0: rozciąga go od krawędzi do krawędzi (góra, dół, lewo, prawo)
     * - z-50: kładzie skaner na samym wierzchu, nad menu i nagłówkiem
     */
    <div className="fixed inset-0 z-50 bg-black">
      <QRScannerClient locale={locale as "pl" | "en" | "de" | "ua"} />
    </div>
  );
}