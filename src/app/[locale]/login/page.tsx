import { LoginClient } from "./login-client";

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <LoginClient locale={locale as "pl" | "en" | "de" | "ua"} />;
}
