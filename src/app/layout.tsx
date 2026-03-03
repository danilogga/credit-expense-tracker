import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Wallet } from "@phosphor-icons/react/dist/ssr";
import { NavLinks } from "@/components/nav-links";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Controle de Despesas",
  description: "Controle de despesas de cartão de crédito com importação CSV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={figtree.variable}>
      <body suppressHydrationWarning>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brand-mark">
                <Wallet size={20} weight="fill" />
              </div>
              <div>
                <strong>Planner</strong>
                <p>Cartão de crédito</p>
              </div>
            </div>
            <NavLinks />
          </aside>

          <main className="content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
