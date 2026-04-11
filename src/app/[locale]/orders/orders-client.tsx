"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { WorkOrderWithDetails } from "@/types";

const STATUS_TABS = ["all", "in_progress", "completed", "cancelled"] as const;

export function OrdersClient({
  locale,
  orders,
}: {
  locale: Locale;
  orders: WorkOrderWithDetails[];
}) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("all");

  const filtered =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">{t("navigation.orders")}</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-xl p-1 overflow-x-auto hide-scrollbar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap tap-highlight-none ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "all"
              ? `Wszystkie (${orders.length})`
              : t(`work_order.status.${tab}`)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Brak zleceń</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === "all"
              ? "Zeskanuj kod QR urządzenia aby rozpocząć"
              : "Brak zleceń w tej kategorii"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const statusVariant =
              order.status === "completed"
                ? "success"
                : order.status === "in_progress"
                ? "warning"
                : "secondary";

            return (
              <Link key={order.id} href={`/${locale}/work-orders/${order.id}`}>
                <Card className="hover:bg-accent/50 active:scale-[0.99] transition-all tap-highlight-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={statusVariant as any} className="text-xs shrink-0">
                          {t(`work_order.status.${order.status}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{order.order_number}
                        </span>
                      </div>
                      <p className="font-medium truncate">
                        {order.unit.customer.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.unit.brand} {order.unit.model}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(order.created_at, locale)}
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
