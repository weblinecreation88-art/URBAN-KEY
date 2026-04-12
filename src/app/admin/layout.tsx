"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "@/components/Icon";

const NAV = [
  { href: "/admin", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/parcours", icon: "map", label: "Parcours" },
  { href: "/admin/villes", icon: "location_city", label: "Villes" },
  { href: "/admin/users", icon: "group", label: "Utilisateurs" },
  { href: "/admin/promos", icon: "local_offer", label: "Promos" },
  { href: "/admin/settings", icon: "settings", label: "Paramètres" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-dvh flex" style={{ background: "#f5ead6", fontFamily: "var(--font-body)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-200"
        style={{
          width: sidebarOpen ? 220 : 64,
          background: "#fff9ed",
          borderRight: "1px solid rgba(140,122,90,0.2)",
          minHeight: "100dvh",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5" style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#8c4b00" }}>
            <Icon name="key" className="text-white" size={16} />
          </div>
          {sidebarOpen && <span className="font-headline font-bold text-primary text-sm">UrbanKey Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? "rgba(140,75,0,0.12)" : "transparent",
                  color: active ? "#8c4b00" : "#5c3d1e",
                }}
              >
                <Icon name={icon} filled={active} size={18} className="shrink-0" />
                {sidebarOpen && <span className="text-xs font-medium">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-2 p-2 rounded-xl flex items-center justify-center"
          style={{ border: "1px solid rgba(140,122,90,0.2)" }}
        >
          <Icon name={sidebarOpen ? "chevron_left" : "chevron_right"} className="text-on-surface-variant" size={16} />
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
