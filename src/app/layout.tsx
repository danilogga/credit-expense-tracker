import type { Metadata } from "next";
import Link from "next/link";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controle de Despesas",
  description: "Controle de despesas de cartão de crédito com importação CSV",
};

const links = [
  { href: "/", label: "Monitoramento" },
  { href: "/billing", label: "Config. Fatura" },
  { href: "/import", label: "Importar CSV" },
  { href: "/merchants", label: "Estabelecimentos" },
  { href: "/categories", label: "Categorias" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <span className="brand-mark">CF</span>
              <div>
                <strong>Meu Planner Financeiro</strong>
                <p>Cartão de crédito</p>
              </div>
            </div>

            <nav className="side-nav">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="content">
            <header className="topbar">
              <h1>Controle de Despesas</h1>
              <p>Painel mensal com categorias, orçamento e fatura</p>
            </header>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
