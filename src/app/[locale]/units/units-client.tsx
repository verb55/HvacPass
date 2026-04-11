"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Cpu, ChevronRight, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";

interface Unit {
  id: string;
  brand: string;
  model: string;
  serial_number?: string;
  qr_code_id: string;
  customer: { name: string; city?: string } | null;
}

export function UnitsClient({
  locale,
  units,
  scannedQr,
}: {
  locale: Locale;
  units: Unit[];
  scannedQr?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState<string | null>(null);

  const filtered = units.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.brand.toLowerCase().includes(q) ||
      u.model.toLowerCase().includes(q) ||
      u.customer?.name.toLowerCase().includes(q) ||
      u.serial_number?.toLowerCase().includes(q)
    );
  });

  const handleStartOrder = async (unitId: string) => {
    setCreating(unitId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const orderNumber = `WO-${Date.now().toString(36).toUpperCase()}`;
      const { data: order, error } = await supabase
        .from("work_orders")
        .insert({
          unit_id: unitId,
          installer_id: user.id,
          status: "in_progress",
          type: "service",
          order_number: orderNumber,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (order && !error) {
        router.push(`/${locale}/work-orders/${order.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Urządzenia</h1>
        <Link href={`/${locale}/scan`}>
          <Button variant="outline" size="sm" className="gap-2">
            <QrCode className="w-4 h-4" />
            Skanuj QR
          </Button>
        </Link>
      </div>

      {scannedQr && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
          <p className="font-medium text-primary">Zeskanowano: {scannedQr}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            Nie znaleziono urządzenia z tym kodem. Wybierz ręcznie lub dodaj nowe urządzenie.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj urządzenia lub klienta..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Cpu className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium">
            {query ? "Brak wyników" : "Brak urządzeń"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {query
              ? "Spróbuj zmienić wyszukiwaną frazę"
              : "Urządzenia pojawią się po synchronizacji z bazą"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((unit) => (
            <Card
              key={unit.id}
              className="active:scale-[0.99] transition-all tap-highlight-none"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {unit.brand} {unit.model}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {unit.customer?.name}
                    {unit.customer?.city ? ` · ${unit.customer.city}` : ""}
                  </p>
                  {unit.serial_number && (
                    <p className="text-xs text-muted-foreground">
                      S/N: {unit.serial_number}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="shrink-0"
                  disabled={creating === unit.id}
                  onClick={() => handleStartOrder(unit.id)}
                >
                  {creating === unit.id ? "..." : "Start"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
