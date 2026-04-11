"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User, Mail, Phone, Shield, Award,
  LogOut, ChevronRight, CheckCircle2, ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores";
import type { Locale } from "@/i18n/config";
import type { Profile } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  installer: "Instalator",
  dispatcher: "Dyspozytor",
  admin: "Administrator",
};

export function ProfileClient({
  locale,
  profile,
  email,
  stats,
}: {
  locale: Locale;
  profile: Profile | null;
  email: string;
  stats: { total: number; completed: number };
}) {
  const router = useRouter();
  const reset = useAppStore((state) => state.reset);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    reset();
    router.push(`/${locale}/login`);
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Avatar + name */}
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">
              {profile?.full_name || "Użytkownik"}
            </h1>
            <Badge variant="secondary" className="mt-1">
              {ROLE_LABELS[profile?.role || ""] || profile?.role || "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <ClipboardList className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Wszystkich zleceń</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ukończonych</p>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Dane konta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {[
            { icon: Mail, label: "E-mail", value: email },
            { icon: Phone, label: "Telefon", value: profile?.phone || "—" },
            { icon: Award, label: "Numer uprawnień", value: profile?.license_number || "—" },
            { icon: Shield, label: "Język aplikacji", value: profile?.preferred_lang?.toUpperCase() || "PL" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0"
            >
              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button
        variant="destructive"
        className="w-full"
        size="lg"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Wyloguj się
      </Button>

      <p className="text-center text-xs text-muted-foreground pb-2">
        HvacPass v0.1 · Beta
      </p>
    </div>
  );
}
