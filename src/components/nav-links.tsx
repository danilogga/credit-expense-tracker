"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  CreditCard,
  UploadSimple,
  Storefront,
  Tag,
} from "@phosphor-icons/react";

const links = [
  { href: "/", label: "Monitoramento", Icon: House },
  { href: "/billing", label: "Config. Fatura", Icon: CreditCard },
  { href: "/import", label: "Importar CSV", Icon: UploadSimple },
  { href: "/merchants", label: "Estabelecimentos", Icon: Storefront },
  { href: "/categories", label: "Categorias", Icon: Tag },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="side-nav">
      {links.map(({ href, label, Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`side-nav-link${isActive ? " side-nav-link-active" : ""}`}
          >
            <Icon size={18} weight={isActive ? "fill" : "regular"} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
