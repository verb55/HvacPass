"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  User,
  Globe,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useAppStore } from "@/stores";
import type { Locale } from "@/i18n/config";
import { localeNames } from "@/i18n/config";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/scan", icon: ScanLine, labelKey: "scan" },
  { href: "/orders", icon: ClipboardList, labelKey: "orders" },
  { href: "/profile", icon: User, labelKey: "profile" },
];

interface BottomNavProps {
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

export function BottomNav({ locale }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname?.includes(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-14 rounded-xl transition-all duration-150 tap-highlight-none",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[10px] mt-0.5 leading-tight", isActive && "font-medium")}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Header({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const profile = useAppStore((state) => state.profile);
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 font-semibold text-lg tap-highlight-none"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-base font-bold">HvacPass</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={locale}
              onChange={(e) => onLocaleChange?.(e.target.value as Locale)}
              className="appearance-none bg-transparent border border-border rounded-lg pl-2 pr-7 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors"
            >
              {Object.entries(localeNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
            <Globe className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Avatar */}
          {profile && (
            <Link
              href={`/${locale}/profile`}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm tap-highlight-none shrink-0"
            >
              {profile.full_name.charAt(0).toUpperCase()}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  children,
  locale,
  onLocaleChange,
}: {
  children: React.ReactNode;
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
}) {
  return (
    <div className="min-h-full bg-background">
      <Header locale={locale} onLocaleChange={onLocaleChange} />
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav locale={locale} onLocaleChange={onLocaleChange} />
    </div>
  );
}
