"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera, X, Flashlight, FlashlightOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import jsQR from "jsqr";

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

  const startCamera = useCallback(async () => {
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
        await videoRef.current.play();
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
      setError("Nie można uzyskać dostępu do kamery");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const toggleFlash = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (capabilities?.torch) {
        track.applyConstraints({ advanced: [{ torch: !flashEnabled } as any] });
        setFlashEnabled(!flashEnabled);
      }
    }
  }, [flashEnabled]);

  const animFrameRef = useRef<number | null>(null);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        handleScanSuccess(code.data);
        return; // Stop loop after successful scan
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isScanning) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [isScanning, processFrame]);

  const handleManualEntry = () => {
    // For demo purposes, simulate QR scan
    const mockQR = `HVAC-${Date.now().toString(36).toUpperCase()}`;
    handleScanSuccess(mockQR);
  };

  const handleScanSuccess = (qrCode: string) => {
    setLastScanned(qrCode);
    setIsScanning(false);
    stopCamera();

    // Parse QR code (format: hvacpass://unit/{qr_code_id})
    if (qrCode.startsWith("HVAC-")) {
      onScan?.(qrCode);
      router.push(`/${locale}/units?qr=${qrCode}`);
    } else {
      setError(t("invalid_qr"));
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col">
      {/* Camera View */}
      <div className="relative flex-1 bg-black">
        {hasPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Uruchamianie kamery...</p>
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
                <div>
                  <p className="font-semibold">Brak dostępu do kamery</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aby skanować kody QR, zezwól na dostęp do kamery w ustawieniach przeglądarki.
                  </p>
                </div>
                <Button onClick={startCamera} className="w-full">
                  Spróbuj ponownie
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {hasPermission && isScanning && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scan frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <p className="text-white text-lg font-medium drop-shadow-lg">
                  {t("qr_instructions")}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Controls */}
        {hasPermission && isScanning && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-full bg-black/50 text-white tap-highlight-none"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={toggleFlash}
                className="p-3 rounded-full bg-black/50 text-white tap-highlight-none"
              >
                {flashEnabled ? (
                  <Flashlight className="w-6 h-6" />
                ) : (
                  <FlashlightOff className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="p-4 space-y-4 bg-background">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {lastScanned && (
          <Badge variant="success" className="w-full py-3 text-base">
            Zeskanowano: {lastScanned}
          </Badge>
        )}

        {/* Manual Entry for Demo */}
        <div className="space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Lub użyj przycisku poniżej do testów
          </p>
          <Button onClick={handleManualEntry} variant="outline" className="w-full" size="lg">
            <RotateCcw className="w-5 h-5 mr-2" />
            Symuluj skan (Demo)
          </Button>
        </div>

        {!isScanning && hasPermission !== false && (
          <Button onClick={startCamera} size="lg" className="w-full">
            <Camera className="w-5 h-5 mr-2" />
            Otwórz kamerę
          </Button>
        )}
      </div>
    </div>
  );
}
