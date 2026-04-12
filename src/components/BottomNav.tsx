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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center h-20 pb-4 px-4 backdrop-blur-xl rounded-t-2xl" style={{ background: "rgba(255,249,237,0.95)", borderTop: "1px solid rgba(140,122,90,0.2)", boxShadow: "0 -4px 24px rgba(44,26,0,0.1)" }}>
      {navItems.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 tap-scale px-3 py-1 rounded-xl transition-colors ${
              active
                ? "text-primary"
                : "text-on-surface-variant/60 hover:text-on-surface-variant"
            }`}
          >
            <Icon
              name={icon}
              filled={active}
              className={active ? "drop-shadow-[0_0_6px_rgba(140,75,0,0.4)]" : ""}
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
