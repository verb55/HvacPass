import { jsPDF } from "jspdf";
import type { WorkOrderWithDetails } from "@/types";

export interface PDFPhoto {
  type: string;
  dataUrl: string;
  label: string;
}

export interface GeneratePDFOptions {
  workOrder: WorkOrderWithDetails;
  locale?: "pl" | "en" | "de" | "ua";
  photos?: PDFPhoto[];
  companyLogo?: string;
}

interface LabelSet {
  title: string;
  reportId: string;
  customer: string;
  unit: string;
  techParams: string;
  address: string;
  workDetails: string;
  workType: string;
  date: string;
  duration: string;
  gpsLocation: string;
  notes: string;
  photoGallery: string;
  installer: string;
  license: string;
  company: string;
  footer: string;
  page: string;
  types: { install: string; service: string; warranty: string };
  noNotes: string;
}

const labels: Record<string, LabelSet> = {
  pl: {
    title: "Raport Serwisowy",
    reportId: "ID Zlecenia",
    customer: "Klient",
    unit: "Urządzenie",
    techParams: "Parametry techniczne",
    address: "Adres",
    workDetails: "Szczegóły pracy",
    workType: "Typ zlecenia",
    date: "Data wykonania",
    duration: "Czas trwania",
    gpsLocation: "Dowód lokalizacji (GPS)",
    notes: "Notatki instalatora",
    photoGallery: "Dokumentacja fotograficzna",
    installer: "Instalator",
    license: "Uprawnienia",
    company: "Firma",
    footer: "Certyfikat Jakości - Miejsce pracy pozostawiono w nienagannym stanie.",
    page: "Strona",
    types: { install: "Instalacja", service: "Serwis", warranty: "Gwarancja" },
    noNotes: "Brak notatek",
  },
  en: {
    title: "Service Report",
    reportId: "Work Order ID",
    customer: "Customer",
    unit: "Unit",
    techParams: "Technical Parameters",
    address: "Address",
    workDetails: "Work Details",
    workType: "Work Type",
    date: "Date",
    duration: "Duration",
    gpsLocation: "Location Proof (GPS)",
    notes: "Notes",
    photoGallery: "Photo Documentation",
    installer: "Installer",
    license: "License",
    company: "Company",
    footer: "Quality Certificate - Worksite left in impeccable condition.",
    page: "Page",
    types: { install: "Installation", service: "Service", warranty: "Warranty" },
    noNotes: "No notes provided",
  },
  de: {
    title: "Servicebericht",
    reportId: "Auftrags-ID",
    customer: "Kunde",
    unit: "Gerät",
    techParams: "Technische Parameter",
    address: "Adresse",
    workDetails: "Arbeitsdetails",
    workType: "Arbeitsart",
    date: "Datum",
    duration: "Dauer",
    gpsLocation: "Standortnachweis (GPS)",
    notes: "Notizen",
    photoGallery: "Fotodokumentation",
    installer: "Installateur",
    license: "Lizenz",
    company: "Firma",
    footer: "Qualitätszertifikat - Arbeitsplatz in einwandfreiem Zustand hinterlassen.",
    page: "Seite",
    types: { install: "Installation", service: "Wartung", warranty: "Garantie" },
    noNotes: "Keine Notizen",
  },
  ua: {
    title: "Сервісний звіт",
    reportId: "ID Замовлення",
    customer: "Клієнт",
    unit: "Пристрій",
    techParams: "Технічні параметри",
    address: "Адреса",
    workDetails: "Деталі роботи",
    workType: "Тип роботи",
    date: "Дата",
    duration: "Тривалість",
    gpsLocation: "Підтвердження локації (GPS)",
    notes: "Примітки",
    photoGallery: "Фотодокументація",
    installer: "Монтажник",
    license: "Ліцензія",
    company: "Компанія",
    footer: "Сертифікат якості - Робоче місце залишено в ідеальному стані.",
    page: "Сторінка",
    types: { install: "Встановлення", service: "Сервіс", warranty: "Гарантія" },
    noNotes: "Немає приміток",
  },
};

export async function generateWorkOrderPDF({
  workOrder,
  locale = "pl",
  photos = [],
  companyLogo,
}: GeneratePDFOptions): Promise<Blob> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const t = labels[locale] ?? labels.pl;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const primaryColor: [number, number, number] = [249, 115, 22];
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];

  let y = margin;

  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 20) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // --- NAGŁÓWEK ---
  if (companyLogo) {
    doc.addImage(companyLogo, "PNG", margin, y, 40, 15);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text("HVAC Premium Service", margin, y + 8);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...textColor);
  doc.text(t.title, pageWidth - margin, y + 8, { align: "right" });

  y += 20;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- DANE KLIENTA (przez unit.customer) ---
  const customer = workOrder.unit.customer;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(t.reportId + ": " + workOrder.id.split("-")[0].toUpperCase(), margin, y);

  y += 8;
  doc.setTextColor(...textColor);
  doc.text(t.customer, margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(customer.name || "-", margin, y);
  y += 5;
  const fullAddress = [customer.address, customer.city].filter(Boolean).join(", ");
  doc.text(fullAddress || "-", margin, y);

  // --- URZĄDZENIE ---
  const rightColX = pageWidth / 2 + 10;
  let rightColY = y - 10;

  doc.setFont("helvetica", "bold");
  doc.text(t.unit, rightColX, rightColY);
  doc.setFont("helvetica", "normal");
  rightColY += 5;
  doc.text(`${workOrder.unit.brand} ${workOrder.unit.model}`, rightColX, rightColY);
  rightColY += 5;
  doc.text(`S/N: ${workOrder.unit.serial_number ?? "-"}`, rightColX, rightColY);

  if (workOrder.unit.install_params) {
    rightColY += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(t.techParams, rightColX, rightColY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);

    const params = workOrder.unit.install_params as Record<string, unknown>;
    for (const [key, value] of Object.entries(params)) {
      rightColY += 5;
      doc.text(`${key}: ${String(value)}`, rightColX, rightColY);
    }
  }

  y = Math.max(y, rightColY) + 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- SZCZEGÓŁY PRACY ---
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.text(t.workDetails, margin, y);
  doc.setFont("helvetica", "normal");

  y += 6;
  const typeKey = workOrder.type as keyof typeof t.types;
  doc.text(`${t.workType}: ${t.types[typeKey] ?? workOrder.type}`, margin, y);

  y += 6;
  doc.text(
    `${t.date}: ${workOrder.start_time ? formatDateShort(workOrder.start_time) : "-"}`,
    margin,
    y
  );

  y += 6;
  doc.text(`${t.duration}: ${calculateWorkDuration(workOrder)}`, margin, y);

  // GPS
  const gpsCoords = workOrder.gps_start ?? workOrder.gps_end;
  if (gpsCoords) {
    y += 6;
    const coordStr = `${gpsCoords.latitude}, ${gpsCoords.longitude}`;
    doc.text(`${t.gpsLocation}: `, margin, y);
    doc.setTextColor(...primaryColor);
    doc.textWithLink(coordStr, margin + 55, y, {
      url: `https://www.google.com/maps/search/?api=1&query=${coordStr}`,
    });
    doc.setTextColor(...textColor);
  }

  y += 15;

  // --- NOTATKI ---
  checkPageBreak(40);
  doc.setFont("helvetica", "bold");
  doc.text(t.notes, margin, y);
  doc.setFont("helvetica", "normal");
  y += 6;

  if (workOrder.notes) {
    const splitNotes = doc.splitTextToSize(workOrder.notes, pageWidth - margin * 2);
    for (const line of splitNotes) {
      checkPageBreak(10);
      doc.text(line as string, margin, y);
      y += 6;
    }
  } else {
    doc.setTextColor(...mutedColor);
    doc.text(t.noNotes, margin, y);
    doc.setTextColor(...textColor);
    y += 6;
  }

  y += 10;

  // --- GALERIA ZDJĘĆ ---
  if (photos.length > 0) {
    doc.addPage();
    y = margin;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(t.photoGallery, margin, y);
    doc.setTextColor(...textColor);
    y += 15;

    const imgWidth = 80;
    const imgHeight = 60;
    const gapX = 10;
    const gapY = 15;

    photos.forEach((photo, index) => {
      const isRightCol = index % 2 !== 0;
      const xPos = isRightCol ? margin + imgWidth + gapX : margin;
      if (index === 2) y += imgHeight + gapY;

      try {
        doc.addImage(photo.dataUrl, "JPEG", xPos, y, imgWidth, imgHeight);
      } catch (e) {
        console.error("Błąd ładowania zdjęcia do PDF:", e);
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPos, y, imgWidth, imgHeight);
        doc.text("Błąd zdjęcia", xPos + 20, y + 30);
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(photo.label, xPos, y + imgHeight + 5);
    });
  }

  // --- STOPKA ---
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(t.footer, pageWidth / 2, footerY, { align: "center" });
    doc.text(
      `${t.page} ${i} / ${pageCount}`,
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  }

  return doc.output("blob");
}

export async function downloadPDF(options: GeneratePDFOptions): Promise<void> {
  const blob = await generateWorkOrderPDF(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `raport-${options.workOrder.order_number ?? options.workOrder.id.slice(0, 8)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Helpers ---
function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateWorkDuration(workOrder: WorkOrderWithDetails): string {
  if (!workOrder.start_time) return "-";
  const start = new Date(workOrder.start_time);
  const end = workOrder.end_time ? new Date(workOrder.end_time) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
