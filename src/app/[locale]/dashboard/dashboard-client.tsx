"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  ScanLine,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores";
import { formatDate, formatRelativeTime, formatDuration } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { WorkOrderWithDetails } from "@/types";
import { useState, useEffect } from "react";

interface DashboardClientProps {
  locale: Locale;
  activeOrders: WorkOrderWithDetails[];
  recentOrders: WorkOrderWithDetails[];
  stats: {
    activeOrders: number;
    completedThisMonth: number;
  };
}

export function DashboardClient({
  locale,
  activeOrders,
  recentOrders,
  stats,
}: DashboardClientProps) {
  const t = useTranslations();
  const profile = useAppStore((state) => state.profile);

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          {t("dashboard.welcome", { name: profile?.full_name.split(" ")[0] || "User" })}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.today")} {formatDate(new Date(), "PPPP", locale)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-tight">
                  {t("dashboard.active_orders")}
                </p>
                <p className="text-2xl font-bold mt-1">{stats.activeOrders}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-tight">
                  {t("dashboard.completed_this_month")}
                </p>
                <p className="text-2xl font-bold mt-1">{stats.completedThisMonth}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Work Order Card */}
      {activeOrders.length > 0 ? (
        <ActiveWorkOrderCard order={activeOrders[0]} locale={locale} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <ScanLine className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{t("dashboard.no_active_orders")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("unit.scan_qr")} lub wybierz urządzenie z listy
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button asChild size="lg" className="w-full">
                <Link href={`/${locale}/scan`}>
                  <ScanLine className="w-5 h-5 mr-2" />
                  {t("unit.scan_qr")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href={`/${locale}/units`}>
                  <Plus className="w-5 h-5 mr-2" />
                  {t("unit.select")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href={`/${locale}/units`}>
            <ScanLine className="w-5 h-5" />
            <span>{t("unit.select")}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
          <Link href={`/${locale}/orders`}>
            <TrendingUp className="w-5 h-5" />
            <span>{t("dashboard.view_all")}</span>
          </Link>
        </Button>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("dashboard.recent_orders")}</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${locale}/orders`}>
                {t("dashboard.view_all")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((order) => (
              <WorkOrderCard key={order.id} order={order} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ActiveWorkOrderCard({
  order,
  locale,
}: {
  order: WorkOrderWithDetails;
  locale: Locale;
}) {
  const t = useTranslations();
  const timerStart = useAppStore((state) => state.timerStart);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!timerStart) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - timerStart);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStart]);

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="warning" className="mb-2">
              {t("work_order.status.in_progress")}
            </Badge>
            <h3 className="font-semibold text-lg">
              {order.unit.customer.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {order.unit.brand} {order.unit.model}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-primary">
              {formatDuration(elapsed)}
            </p>
            <p className="text-xs text-muted-foreground">{t("work_order.duration")}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1" size="lg">
            <Link href={`/${locale}/work-orders/${order.id}`}>
              {t("work_order.details")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkOrderCard({
  order,
  locale,
}: {
  order: WorkOrderWithDetails;
  locale: Locale;
}) {
  const t = useTranslations();

  const statusVariant =
    order.status === "completed"
      ? "success"
      : order.status === "in_progress"
        ? "warning"
        : "secondary";

  return (
    <Link href={`/${locale}/work-orders/${order.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={statusVariant} className="text-xs">
                {t(`work_order.status.${order.status}`)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                #{order.order_number}
              </span>
            </div>
            <p className="font-medium truncate">{order.unit.customer.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {order.unit.brand} {order.unit.model}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {formatRelativeTime(order.created_at, locale)}
            </p>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
