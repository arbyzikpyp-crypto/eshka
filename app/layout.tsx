import type { Metadata } from "next";
import "./globals.css";
import "./demo.css";

export const metadata: Metadata = {
  title: "Ешь!ка — кафе быстрого питания в Таганроге",
  description: "Выберите еду и оформите заказ в кафе «Ешь!ка» в Таганроге.",
  alternates: { canonical: "/" },
  openGraph: { title: "Ешь!ка — кафе быстрого питания в Таганроге", description: "Выберите еду и оформите заказ." },
};
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body className={isDemo ? "demo-mode" : undefined}>{children}</body></html>;
}
