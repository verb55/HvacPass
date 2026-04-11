import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "HvacPass | HVAC Field Service Management",
  description: "Profesjonalna aplikacja FSM dla branży HVAC",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HvacPass",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
