"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Camera,
  X,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { compressImage, validateImageFile } from "@/lib/utils/image";
import { getCurrentPosition } from "@/lib/utils/gps";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";
import type { PhotoType } from "@/types";

interface PhotoUploadClientProps {
  workOrderId: string;
  photoType: PhotoType;
  locale: Locale;
  onUploadComplete?: () => void;
}

type UploadStatus = "idle" | "capturing" | "preview" | "uploading" | "success" | "error";

export function PhotoUploadClient({
  workOrderId,
  photoType,
  locale,
  onUploadComplete,
}: PhotoUploadClientProps) {
  const t = useTranslations("work_order");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const photoLabels: Record<PhotoType, string> = {
    protection: t("photo_labels.protection"),
    technical: t("photo_labels.technical"),
    final: t("photo_labels.final"),
    cleaning: t("photo_labels.cleaning"),
  };

  const photoDescriptions: Record<PhotoType, string> = {
    protection: "Zabezpiecz miejsce pracy przed zabrudzeniem",
    technical: "Uchwyć newralgiczne punkty instalacji",
    final: "Pokaż efekt końcowy pracy",
    cleaning: "Z dokumentuj posprzątane miejsce",
  };

  // Get GPS on mount
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setGpsCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      })
      .catch(() => {
        // GPS not available, continue without
      });
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setStatus("preview");

    // Compress in background
    try {
      const compressed = await compressImage(file);
      setCompressedFile(compressed);
    } catch (err) {
      console.error("Compression failed:", err);
      setCompressedFile(file);
    }
  }, []);

  const handleRetake = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setCompressedFile(null);
    setStatus("idle");
    fileInputRef.current?.click();
  }, [preview]);

  const handleUpload = useCallback(async () => {
    if (!compressedFile) return;

    setStatus("uploading");
    setUploadProgress(0);

    try {
      // Zostawiamy animację paska postępu dla lepszego UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 90));
      }, 200);

      // --- PRAWDZIWE WYSYŁANIE DO SUPABASE ---
      const supabase = createClient();
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${photoType}_${Date.now()}.${fileExt}`;
      const filePath = `${workOrderId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hvac_photos')
        .upload(filePath, compressedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;
      // --- KONIEC WYSYŁANIA ---

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Prawdziwe zdjęcie wysłane:", {
        workOrderId,
        photoType,
        file: fileName,
        gps: gpsCoords,
      });

      setStatus("success");

      // Przekierowanie po sukcesie
      setTimeout(() => {
        onUploadComplete?.();
        router.push(`/${locale}/work-orders/${workOrderId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Błąd przesyłania. Sprawdź połączenie.");
    }
  }, [compressedFile, workOrderId, photoType, gpsCoords, locale, router, onUploadComplete]);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-accent"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <p className="font-semibold">{t(`photo_types.${photoType}`)}</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{photoLabels[photoType]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{photoDescriptions[photoType]}</p>
          </CardContent>
        </Card>

        {/* GPS Status */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin
            className={`w-4 h-4 ${gpsCoords ? "text-success" : "text-muted-foreground"}`}
          />
          <span className={gpsCoords ? "text-success" : "text-muted-foreground"}>
            {gpsCoords
              ? `GPS: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}`
              : "GPS niedostępny"}
          </span>
        </div>

        {/* Camera/Preview Area */}
        <Card className="overflow-hidden">
          <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
            {status === "idle" && (
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted-foreground/20 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Kliknij, aby zrobić zdjęcie</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zdjęcie zostanie skompresowane przed wysyłką
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Otwórz kamerę
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {status === "preview" && preview && (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <Button
                  onClick={handleRetake}
                  variant="secondary"
                  className="absolute bottom-4 right-4"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Zrób ponownie
                </Button>
              </>
            )}

            {status === "uploading" && (
              <div className="text-center space-y-4 p-8 w-full px-6">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <div>
                  <p className="font-medium">Przesyłanie zdjęcia...</p>
                  <Progress value={uploadProgress} className="mt-3" />
                  {compressedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Rozmiar: {(compressedFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <p className="font-medium text-success">Zdjęcie przesłane!</p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-destructive">{error}</p>
                  <Button onClick={handleRetake} variant="outline" className="mt-3">
                    Spróbuj ponownie
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Upload Button */}
        {status === "preview" && (
          <Button onClick={handleUpload} size="xl" className="w-full">
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Prześlij zdjęcie
          </Button>
        )}
      </div>
    </div>
  );
}
