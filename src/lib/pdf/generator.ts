import { jsPDF } from "jspdf";
import type { WorkOrderWithDetails } from "@/types";

// Rozszerzone opcje, abyśmy mogli przekazać zdjęcia w formacie Base64 z komponentu
export interface PDFPhoto {
  type: string;
  dataUrl: string; // Zdjęcie w formacie Base64
  label: string;
}

export interface GeneratePDFOptions {
  workOrder: WorkOrderWithDetails;
  locale?: "pl" | "en" | "de" | "ua";
  photos?: PDFPhoto[]; // Przekazane wyrenderowane zdjęcia
  companyLogo?: string; // Opcjonalne logo firmy w Base64
}

// Rozszerzone tłumaczenia
const labels = {
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
    types: { install: "Installation", service: "Service", warranty: "Warranty" },
    noNotes: "No notes provided",
  },
  // Tu można dodać analogicznie 'de' i 'ua'
  de: { title: "Servicebericht", reportId: "Auftrags-ID", customer: "Kunde", unit: "Gerät", techParams: "Technische Parameter", address: "Adresse", workDetails: "Arbeitsdetails", workType: "Arbeitsart", date: "Datum", duration: "Dauer", gpsLocation: "Standortnachweis (GPS)", notes: "Notizen", photoGallery: "Fotodokumentation", installer: "Installateur", license: "Lizenz", company: "Firma", footer: "Qualitätszertifikat - Arbeitsplatz in einwandfreiem Zustand hinterlassen.", types: { install: "Installation", service: "Wartung", warranty: "Garantie" }, noNotes: "Keine Notizen" },
  ua: { title: "Сервісний звіт", reportId: "ID Замовлення", customer: "Клієнт", unit: "Пристрій", techParams: "Технічні параметри", address: "Адреса", workDetails: "Деталі роботи", workType: "Тип роботи", date: "Дата", duration: "Тривалість", gpsLocation: "Підтвердження локації (GPS)", notes: "Примітки", photoGallery: "Фотодокументація", installer: "Монтажник", license: "Ліцензія", company: "Компанія", footer: "Сертифікат якості - Робоче місце залишено в ідеальному стані.", types: { install: "Встановлення", service: "Сервіс", warranty: "Гарантія" }, noNotes: "Немає приміток" }
};

export async function generatePDF({
  workOrder,
  locale = "pl",
  photos = [],
  companyLogo,
}: GeneratePDFOptions): Promise<Blob> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const t = labels[locale] || labels.pl;
  
  // Konfiguracja styli
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const primaryColor: [number, number, number] = [249, 115, 22]; // Pomarańczowy Tailwind (orange-500)
  const textColor: [number, number, number] = [30, 41, 59]; // Slate-800
  const mutedColor: [number, number, number] = [100, 116, 139]; // Slate-500

  let y = margin;

  // --- Funkcja pomocnicza: Sprawdzanie miejsca na stronie ---
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
    // Jeśli firma ma logo, wstawiamy w lewym górnym rogu
    doc.addImage(companyLogo, "PNG", margin, y, 40, 15);
  } else {
    // Zastępczy tekst, jeśli brak logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    // Tu możemy wrzucić nazwę firmy Tomka z profilu, jeśli jest dostępna
    doc.text("HVAC Premium Service", margin, y + 8);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...textColor);
  doc.text(t.title, pageWidth - margin, y + 8, { align: "right" });

  y += 20;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- SEKCJA: DANE ZLECENIA I KLIENTA ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(t.reportId + ": " + workOrder.id.split('-')[0].toUpperCase(), margin, y);
  
  y += 8;
  doc.setTextColor(...textColor);
  doc.text(t.customer, margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(workOrder.customer?.name || "-", margin, y);
  y += 5;
  const fullAddress = `${workOrder.customer?.address || ""}, ${workOrder.customer?.city || ""}`.replace(/^, | , $/g, '');
  doc.text(fullAddress || "-", margin, y);

  // --- SEKCJA: URZĄDZENIE I PARAMETRY TECHNICZNE ---
  let rightColX = pageWidth / 2 + 10;
  let rightColY = y - 10;
  
  doc.setFont("helvetica", "bold");
  doc.text(t.unit, rightColX, rightColY);
  doc.setFont("helvetica", "normal");
  rightColY += 5;
  doc.text(`${workOrder.unit?.brand || ""} ${workOrder.unit?.model || ""}`, rightColX, rightColY);
  rightColY += 5;
  doc.text(`S/N: ${workOrder.unit?.serial_number || "-"}`, rightColX, rightColY);

  // JSONB install_params - Renderowanie parametrów
  if (workOrder.unit?.install_params) {
    rightColY += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(t.techParams, rightColX, rightColY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    
    const params = workOrder.unit.install_params as Record<string, any>;
    for (const [key, value] of Object.entries(params)) {
      rightColY += 5;
      doc.text(`${key}: ${value}`, rightColX, rightColY);
    }
  }

  y = Math.max(y, rightColY) + 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- SEKCJA: SZCZEGÓŁY PRACY I GPS ---
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.text(t.workDetails, margin, y);
  doc.setFont("helvetica", "normal");
  
  y += 6;
  const typeKey = workOrder.type as keyof typeof t.types;
  doc.text(`${t.workType}: ${t.types[typeKey] || workOrder.type}`, margin, y);
  
  y += 6;
  doc.text(`${t.date}: ${workOrder.start_time ? formatDateShort(workOrder.start_time) : "-"}`, margin, y);
  
  y += 6;
  doc.text(`${t.duration}: ${calculateWorkDuration(workOrder)}`, margin, y);

  // Klickalny dowód GPS
  if ((workOrder as any).gps_coords) {
    y += 6;
    doc.text(`${t.gpsLocation}: `, margin, y);
    doc.setTextColor(...primaryColor);
    const gpsCoords = (workOrder as any).gps_coords;
    doc.textWithLink(gpsCoords, margin + 45, y, { url: `https://www.google.com/maps/search/?api=1&query=${gpsCoords}` });
    doc.setTextColor(...textColor);
  }

  y += 15;

  // --- SEKCJA: NOTATKI ---
  checkPageBreak(40);
  doc.setFont("helvetica", "bold");
  doc.text(t.notes, margin, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  
  if (workOrder.notes) {
    const splitNotes = doc.splitTextToSize(workOrder.notes, pageWidth - margin * 2);
    // Pętla do obsługi łamania stron dla bardzo długich notatek
    for (let line of splitNotes) {
      if (checkPageBreak(10)) {
        doc.setFont("helvetica", "normal"); // przywróć font po nowej stronie
      }
      doc.text(line, margin, y);
      y += 6;
    }
  } else {
    doc.setTextColor(...mutedColor);
    doc.text(t.noNotes, margin, y);
    doc.setTextColor(...textColor);
    y += 6;
  }

  y += 10;

  // --- SEKCJA: GALERIA ZDJĘĆ (2x2) ---
  if (photos && photos.length > 0) {
    // Wymuszamy nową stronę dla galerii, żeby wyglądała czysto i profesjonalnie
    doc.addPage();
    y = margin;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(t.photoGallery, margin, y);
    doc.setTextColor(...textColor);
    y += 15;

    const imgWidth = 80;
    const imgHeight = 60; // Proporcje 4:3
    const gapX = 10;
    const gapY = 15;
    
    photos.forEach((photo, index) => {
      // Obliczanie pozycji w siatce 2x2
      const isRightCol = index % 2 !== 0;
      const xPos = isRightCol ? margin + imgWidth + gapX : margin;
      
      // Jeśli to 3. lub 4. zdjęcie, przejdź do drugiego wiersza
      if (index === 2) y += imgHeight + gapY;
      
      // Dodaj zdjęcie (wymaga base64, np. data:image/jpeg;base64,...)
      try {
        doc.addImage(photo.dataUrl, "JPEG", xPos, y, imgWidth, imgHeight);
      } catch (e) {
        console.error("Błąd ładowania zdjęcia do PDF:", e);
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPos, y, imgWidth, imgHeight);
        doc.text("Błąd zdjęcia", xPos + 20, y + 30);
      }
      
      // Etykieta zdjęcia
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(photo.label, xPos, y + imgHeight + 5);
    });
  }

  // --- STOPKA (Dodawana na każdej stronie) ---
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(t.footer, pageWidth / 2, footerY, { align: "center" });
    // Paginacja
    doc.text(`${t.page || "Strona"} ${i} / ${pageCount}`, pageWidth - margin, footerY, { align: "right" });
  }

  return doc.output("blob");
}

// Funkcje pomocnicze
function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function calculateWorkDuration(workOrder: WorkOrderWithDetails): string {
  if (!workOrder.start_time) return "-";
  const start = new Date(workOrder.start_time);
  const end = workOrder.end_time ? new Date(workOrder.end_time) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
