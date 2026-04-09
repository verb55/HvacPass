"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Camera,
  Pause,
  Play,
  Square,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores";
import { formatDuration, getCurrentPosition } from "@/lib/utils";
import { REQUIRED_PHOTO_TYPES, photoTypeSchema } from "@/lib/validators";
import type { Locale } from "@/i18n/config";
import type { WorkOrderWithDetails, PhotoType, Photo } from "@/types";

interface WorkOrderDetailClientProps {
  workOrder: WorkOrderWithDetails;
  locale: Locale;
}

export function WorkOrderDetailClient({
  workOrder,
  locale,
}: WorkOrderDetailClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasGps, setHasGps] = useState(false);
  const [notes, setNotes] = useState(workOrder.notes || "");

  const timerStart = useAppStore((state) => state.timerStart);
  const isPausedTimer = useAppStore((state) => state.isPaused);
  const startTimer = useAppStore((state) => state.startTimer);
  const pauseTimer = useAppStore((state) => state.pauseTimer);
  const resumeTimer = useAppStore((state) => state.resumeTimer);
  const stopTimer = useAppStore((state) => state.stopTimer);
  const updateActiveWorkOrder = useAppStore((state) => state.updateActiveWorkOrder);
  const setActiveWorkOrder = useAppStore((state) => state.setActiveWorkOrder);

  const photos = workOrder.photos || [];
  const photoProgress = photos.length;
  const allPhotosRequired = photos.filter((p) =>
    REQUIRED_PHOTO_TYPES.includes(p.type as PhotoType)
  );
  const canComplete = allPhotosRequired.length === 4 && workOrder.status !== "completed";

  // Timer effect
  useEffect(() => {
    if (!timerStart || isPausedTimer) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - timerStart);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStart, isPausedTimer]);

  // Check GPS
  useEffect(() => {
    if ("geolocation" in navigator) {
      getCurrentPosition()
        .then(() => setHasGps(true))
        .catch(() => setHasGps(false));
    }
  }, []);

  const handleStart = async () => {
    try {
      const position = await getCurrentPosition();
      // In real app, would call API to start work order with GPS
      startTimer();
      setIsPaused(false);
    } catch {
      // Start without GPS
      startTimer();
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    pauseTimer();
    setIsPaused(true);
  };

  const handleResume = () => {
    resumeTimer();
    setIsPaused(false);
  };

  const handleStop = async () => {
    const { duration, pausedTime } = stopTimer();
    // In real app, would call API to stop work order
    router.push(`/${locale}/work-orders/${workOrder.id}/review`);
  };

  const handleComplete = () => {
    router.push(`/${locale}/work-orders/${workOrder.id}/review`);
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Unit Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <Badge
                variant={
                  workOrder.status === "completed"
                    ? "success"
                    : workOrder.status === "in_progress"
                      ? "warning"
                      : "secondary"
                }
              >
                {t(`work_order.status.${workOrder.status}`)}
              </Badge>
              <CardTitle className="mt-2 text-xl">
                {workOrder.unit.customer.name}
              </CardTitle>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>#{workOrder.order_number}</p>
              <p>{t(`pdf.types.${workOrder.type}`)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t("unit.brand")}</p>
              <p className="font-medium">{workOrder.unit.brand}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("unit.model")}</p>
              <p className="font-medium">{workOrder.unit.model}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("unit.serial_number")}</p>
              <p className="font-medium">{workOrder.unit.serial_number || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("customer.city")}</p>
              <p className="font-medium">{workOrder.unit.customer.city || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Card */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>{t("work_order.duration")}</span>
            </div>

            <div className="text-5xl font-mono font-bold tracking-wider">
              {formatDuration(elapsed)}
            </div>

            {workOrder.status === "in_progress" ? (
              <div className="flex gap-3 justify-center">
                {isPaused ? (
                  <Button onClick={handleResume} size="lg" variant="success">
                    <Play className="w-5 h-5 mr-2" />
                    {t("work_order.resume")}
                  </Button>
                ) : (
                  <Button onClick={handlePause} size="lg" variant="secondary">
                    <Pause className="w-5 h-5 mr-2" />
                    {t("work_order.pause")}
                  </Button>
                )}
                <Button onClick={handleStop} size="lg" variant="destructive">
                  <Square className="w-5 h-5 mr-2" />
                  {t("work_order.stop")}
                </Button>
              </div>
            ) : (
              <Button onClick={handleStart} size="xl" className="w-full">
                <Play className="w-6 h-6 mr-2" />
                {t("work_order.start")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GPS Status */}
      <div className="flex items-center gap-2 text-sm">
        <MapPin
          className={`w-4 h-4 ${hasGps ? "text-success" : "text-muted-foreground"}`}
        />
        <span className={hasGps ? "text-success" : "text-muted-foreground"}>
          {hasGps ? "GPS aktywny" : "GPS niedostępny"}
        </span>
      </div>

      {/* Required Photos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("work_order.photos_required")}</CardTitle>
            <Badge variant={allPhotosRequired.length === 4 ? "success" : "secondary"}>
              {t("work_order.photos_uploaded", { count: allPhotosRequired.length })}
            </Badge>
          </div>
          <Progress value={(photoProgress / 4) * 100} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {REQUIRED_PHOTO_TYPES.map((type) => {
            const photo = photos.find((p) => p.type === type);
            const isUploaded = !!photo;

            return (
              <div
                key={type}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isUploaded ? "bg-success/10" : "bg-muted"
                  }`}
                >
                  {isUploaded ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {t(`work_order.photo_types.${type}`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(`work_order.photo_labels.${type}`)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isUploaded ? "outline" : "default"}
                  onClick={() => router.push(`/${locale}/work-orders/${workOrder.id}/photo/${type}`)}
                >
                  {isUploaded ? "Zamień" : "Dodaj"}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("work_order.notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("work_order.notes_placeholder")}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Complete Button */}
      {workOrder.status !== "completed" && (
        <Button
          onClick={handleComplete}
          size="xl"
          className="w-full"
          disabled={!canComplete}
        >
          {canComplete ? (
            <>
              <CheckCircle2 className="w-6 h-6 mr-2" />
              {t("work_order.complete")}
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 mr-2" />
              {t("work_order.validation.all_photos_required")}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
