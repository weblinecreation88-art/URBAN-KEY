"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const navItems = [
  { href: "/discover", icon: "search", label: "Explorer" },
  { href: "/map", icon: "explore", label: "Carte" },
  { href: "/leaderboard", icon: "leaderboard", label: "Classement" },
  { href: "/profile", icon: "person", label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center h-20 pb-4 px-4 bg-background/80 backdrop-blur-xl border-t border-outline-variant/15 rounded-t-2xl shadow-[0_-4px_32px_rgba(8,20,34,0.4)]">
      {navItems.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 tap-scale px-3 py-1 rounded-xl transition-colors ${
              active
                ? "text-secondary"
                : "text-on-surface-variant/50 hover:text-on-surface-variant"
            }`}
          >
            <Icon
              name={icon}
              filled={active}
              className={active ? "drop-shadow-[0_0_6px_rgba(240,190,114,0.5)]" : ""}
            />
            <span className="font-label text-[10px] font-bold uppercase tracking-widest">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
