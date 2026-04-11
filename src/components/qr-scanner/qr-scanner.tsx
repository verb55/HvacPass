"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera, X, Flashlight, FlashlightOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QRScannerClientProps {
  locale: "pl" | "en" | "de" | "ua";
  onScan?: (qrCode: string) => void;
}

export function QRScannerClient({ locale, onScan }: QRScannerClientProps) {
  const t = useTranslations("unit");
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Kluczowe dla iOS: playsInline i oczekiwanie na metadane
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Autoplay blocked", e));
          setHasPermission(true);
          setIsScanning(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setError("Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia w przeglądarce.");
    }
  }, []);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      try {
        // Dynamiczny import jsQR aby uniknąć problemów z SSR
        const { default: jsQR } = await import("jsqr");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleScanSuccess(code.data);
          return; // Zatrzymujemy pętlę po sukcesie
        }
      } catch (e) {
        console.error("QR processing error", e);
      }
    }

    if (isScanning) {
      requestAnimationFrame(processFrame);
    }
  }, [isScanning]);

  useEffect(() => {
    if (isScanning) {
      processFrame();
    }
    return () => stopCamera();
  }, [isScanning, processFrame, stopCamera]);

  const handleScanSuccess = (qrCode: string) => {
    setLastScanned(qrCode);
    setIsScanning(false);
    stopCamera();

    // Sprawdzenie formatu kodu
    if (qrCode.startsWith("HVAC-") || qrCode.length > 3) {
      onScan?.(qrCode);
      router.push(`/${locale}/units?qr=${encodeURIComponent(qrCode)}`);
    } else {
      setError("Nieprawidłowy kod QR");
      setIsScanning(true); // Wznawiamy skanowanie
      startCamera();
    }
  };

  const handleManualEntry = () => {
    const mockQR = `HVAC-${Date.now().toString(36).toUpperCase()}`;
    handleScanSuccess(mockQR);
  };

  const toggleFlash = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities() as any;
      if (capabilities?.torch) {
        track.applyConstraints({ advanced: [{ torch: !flashEnabled } as any] });
        setFlashEnabled(!flashEnabled);
      }
    }
  }, [flashEnabled]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Podgląd kamery */}
      <div className="relative flex-1 bg-black">
        {hasPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Oczekiwanie na uruchomienie...</p>
            </div>
          </div>
        )}

        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="m-4 max-w-sm">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-destructive" />
                </div>
                <p className="font-semibold">{error || "Brak dostępu do kamery"}</p>
                <Button onClick={startCamera} className="w-full">Spróbuj ponownie</Button>
              </CardContent>
            </Card>
          </div>
        )}

        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {/* Ramka skanowania */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/30 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            </div>
          </div>
        )}

        {/* Przyciski sterujące na górze */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-3 rounded-full bg-black/50 text-white shadow-lg">
            <X className="w-6 h-6" />
          </button>
          <button onClick={toggleFlash} className="p-3 rounded-full bg-black/50 text-white shadow-lg">
            {flashEnabled ? <Flashlight className="w-6 h-6" /> : <FlashlightOff className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* DOLNY PANEL - Zastosowano pb-nav dla poprawki responsywności */}
      <div className="p-6 space-y-4 bg-background border-t border-border pb-nav">
        {lastScanned && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-center text-sm font-medium">
            Zeskanowano: {lastScanned}
          </div>
        )}

        {!isScanning ? (
          <Button onClick={startCamera} size="lg" className="w-full h-14 text-lg">
            <Camera className="w-6 h-6 mr-2" />
            Uruchom kamerę
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="outline" size="lg" className="w-full h-14">
            Zatrzymaj
          </Button>
        )}

        <div className="pt-2">
          <p className="text-xs text-center text-muted-foreground mb-3">
            Problemy z kamerą? Użyj symulacji do testów:
          </p>
          <Button onClick={handleManualEntry} variant="secondary" className="w-full h-12">
            <RotateCcw className="w-5 h-5 mr-2" />
            Symuluj skan (Demo)
          </Button>
        </div>
      </div>
    </div>
  );
}