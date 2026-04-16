"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Flashlight, FlashlightOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QRScannerClientProps {
  locale: "pl" | "en" | "de" | "ua";
  onScan?: (qrCode: string) => void;
}

type CameraState = "idle" | "requesting" | "active" | "denied" | "error";

export function QRScannerClient({ locale, onScan }: QRScannerClientProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleScanSuccess = useCallback(
    (qrCode: string) => {
      stopCamera();
      setCameraState("idle");
      setLastScanned(qrCode);
      onScan?.(qrCode);
      router.push(`/${locale}/units?qr=${encodeURIComponent(qrCode)}`);
    },
    [locale, onScan, router, stopCamera]
  );

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const { default: jsQR } = await import("jsqr");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code?.data) {
        handleScanSuccess(code.data);
        return;
      }
    }
    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [handleScanSuccess]);

  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setErrorMsg(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Video element not found");

      video.srcObject = stream;

      // iOS Safari critical: must set these before play()
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Video load error"));
        setTimeout(() => resolve(), 3000); // fallback timeout
      });

      await video.play();

      // Extra delay for iOS to actually start rendering frames
      await new Promise((r) => setTimeout(r, 300));

      setCameraState("active");
      animFrameRef.current = requestAnimationFrame(processFrame);

    } catch (err: any) {
      console.error("Camera error:", err?.name, err?.message);
      stopCamera();
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setCameraState("denied");
        setErrorMsg("Zezwól na dostęp do kamery w ustawieniach przeglądarki.");
      } else {
        setCameraState("error");
        setErrorMsg(`Nie można uruchomić kamery: ${err?.message || "nieznany błąd"}`);
      }
    }
  }, [processFrame, stopCamera]);

  const toggleFlash = useCallback(() => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track?.getCapabilities() as any;
    if (capabilities?.torch) {
      track.applyConstraints({ advanced: [{ torch: !flashEnabled } as any] });
      setFlashEnabled((prev) => !prev);
    }
  }, [flashEnabled]);

  const isActive = cameraState === "active";

  return (
    // Full screen container - iOS needs explicit height NOT from flex-1
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column" }}>

      {/* Camera area - takes all space above bottom panel */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "#000" }}>

        {/* VIDEO - iOS Safari needs explicit width/height, NOT object-cover on absolute */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          // iOS Safari: use inline style, not Tailwind classes
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: isActive ? "block" : "none",
            // Force GPU layer on iOS
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
          }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Idle */}
        {cameraState === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", padding: "24px" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Camera style={{ width: 40, height: 40, color: "#f97316" }} />
              </div>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>Skaner QR</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 8 }}>
                Naciśnij przycisk aby uruchomić kamerę
              </p>
            </div>
          </div>
        )}

        {/* Requesting */}
        {cameraState === "requesting" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, border: "3px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Uruchamianie kamery...</p>
            </div>
          </div>
        )}

        {/* Denied / Error */}
        {(cameraState === "denied" || cameraState === "error") && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Card style={{ width: "100%", maxWidth: 360 }}>
              <CardContent style={{ padding: 24, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Camera style={{ width: 32, height: 32, color: "#ef4444" }} />
                </div>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Brak dostępu do kamery</p>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16 }}>{errorMsg}</p>
                <Button onClick={startCamera} className="w-full">Spróbuj ponownie</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active overlay */}
        {isActive && (
          <>
            {/* Scan frame */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: 220, height: 220, position: "relative" }}>
                {[
                  { top: 0, left: 0, borderTop: "4px solid #f97316", borderLeft: "4px solid #f97316", borderRadius: "12px 0 0 0" },
                  { top: 0, right: 0, borderTop: "4px solid #f97316", borderRight: "4px solid #f97316", borderRadius: "0 12px 0 0" },
                  { bottom: 0, left: 0, borderBottom: "4px solid #f97316", borderLeft: "4px solid #f97316", borderRadius: "0 0 0 12px" },
                  { bottom: 0, right: 0, borderBottom: "4px solid #f97316", borderRight: "4px solid #f97316", borderRadius: "0 0 12px 0" },
                ].map((s, i) => (
                  <div key={i} style={{ position: "absolute", width: 32, height: 32, ...s }} />
                ))}
              </div>
            </div>
            <p style={{ position: "absolute", bottom: 90, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 14, fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              Skieruj kamerę na kod QR
            </p>

            {/* Controls */}
            <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => { stopCamera(); setCameraState("idle"); router.back(); }}
                style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
              <button
                onClick={toggleFlash}
                style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                {flashEnabled ? <Flashlight style={{ width: 24, height: 24 }} /> : <FlashlightOff style={{ width: 24, height: 24 }} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom panel */}
      <div style={{ background: "hsl(var(--background))", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {lastScanned && (
          <div style={{ padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 14, fontWeight: 500 }}>
            ✓ Zeskanowano: {lastScanned}
          </div>
        )}

        {!isActive && cameraState !== "requesting" && (
          <Button onClick={startCamera} size="lg" className="w-full">
            <Camera className="w-5 h-5 mr-2" />
            {cameraState === "idle" ? "Uruchom kamerę" : "Spróbuj ponownie"}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push(`/${locale}/units`)}
        >
          Przejdź do listy urządzeń
        </Button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
