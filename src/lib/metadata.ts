export function generateMetadata({
  title = "HvacPass",
  description = "Profesjonalna aplikacja FSM dla branży HVAC",
  locale = "pl",
}: {
  title?: string;
  description?: string;
  locale?: string;
} = {}) {
  return {
    title: `${title} | HVAC Field Service Management`,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: {
      title: `${title} | HvacPass`,
      description,
      locale,
      type: "website",
    },
    manifest: "/manifest.json",
    themeColor: "#0F172A",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent" as const,
      title: "HvacPass",
    },
  };
}

export const APP_NAME = "HvacPass";
export const APP_DESCRIPTION = "Profesjonalna aplikacja FSM dla branży HVAC";
