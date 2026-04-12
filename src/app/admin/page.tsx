"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Icon from "@/components/Icon";

interface KpiCard {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "purchase" | "session" | "review";
  user: string;
  detail: string;
  time: string;
}

const STATIC_KPIS: KpiCard[] = [
  { label: "Réservations", value: "—", icon: "shopping_cart", color: "#8c4b00" },
  { label: "Revenus (MAD)", value: "—", icon: "payments", color: "#296767" },
  { label: "Sessions actives", value: "—", icon: "directions_walk", color: "#8b2a00" },
  { label: "Note moyenne", value: "—", icon: "star", color: "#c97a00" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities] = useState<RecentActivity[]>([
    { id: "1", type: "purchase", user: "Ahmed B.", detail: "Secrets de la Cité Impériale — 100 MAD", time: "Il y a 3 min" },
    { id: "2", type: "session", user: "Sara L.", detail: "Étape 4/7 · Hri Souani", time: "Il y a 12 min" },
    { id: "3", type: "review", user: "Karim M.", detail: "Note 5/5 — «Expérience incroyable !»", time: "Il y a 1h" },
    { id: "4", type: "purchase", user: "Fatima A.", detail: "Secrets de la Cité Impériale — 90 MAD (promo)", time: "Il y a 2h" },
    { id: "5", type: "session", user: "Youssef T.", detail: "Terminé en 1h58 · Score 820 pts", time: "Il y a 3h" },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, "users"));
        setUserCount(snap.size);
      } catch {
        setUserCount(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis: KpiCard[] = [
    { label: "Utilisateurs", value: loading ? "…" : String(userCount ?? 0), delta: "+12% ce mois", positive: true, icon: "people", color: "#8c4b00" },
    { label: "Parcours actifs", value: "1", delta: "Meknès pilote", icon: "map", color: "#296767" },
    { label: "Revenus (MAD)", value: "—", delta: "Stripe requis", icon: "payments", color: "#8b2a00" },
    { label: "Note moyenne", value: "—", delta: "Avis à venir", icon: "star", color: "#c97a00" },
  ];

  const activityIcon: Record<string, string> = { purchase: "shopping_cart", session: "directions_walk", review: "star" };
  const activityColor: Record<string, string> = { purchase: "#296767", session: "#8c4b00", review: "#c97a00" };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Back-office</p>
        <h1 className="font-headline font-bold text-2xl text-primary">Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Vue d&apos;ensemble — UrbanKey Meknès</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="parchment-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{k.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${k.color}18` }}>
                <Icon name={k.icon} size={16} style={{ color: k.color }} />
              </div>
            </div>
            <p className="font-headline font-black text-2xl text-on-surface mb-1">{k.value}</p>
            {k.delta && (
              <p className={`text-[11px] font-medium ${k.positive ? "text-secondary" : "text-on-surface-variant"}`}>
                {k.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        <button
          onClick={() => router.push("/admin/parcours")}
          className="parchment-card rounded-2xl p-5 text-left tap-scale flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(140,75,0,0.12)" }}>
            <Icon name="map" className="text-primary" size={24} />
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-sm">Gérer les parcours</p>
            <p className="text-on-surface-variant text-[11px]">Éditer étapes, énigmes, GPS</p>
          </div>
          <Icon name="chevron_right" className="text-on-surface-variant ml-auto" size={18} />
        </button>

        <button
          onClick={() => router.push("/admin/villes")}
          className="parchment-card rounded-2xl p-5 text-left tap-scale flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(41,103,103,0.12)" }}>
            <Icon name="location_city" className="text-secondary" size={24} />
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-sm">Gérer les villes</p>
            <p className="text-on-surface-variant text-[11px]">Ajouter une nouvelle ville</p>
          </div>
          <Icon name="chevron_right" className="text-on-surface-variant ml-auto" size={18} />
        </button>

        <button
          onClick={() => router.push("/admin/promos")}
          className="parchment-card rounded-2xl p-5 text-left tap-scale flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,42,0,0.1)" }}>
            <Icon name="local_offer" style={{ color: "#8b2a00" }} size={24} />
          </div>
          <div>
            <p className="font-headline font-bold text-on-surface text-sm">Codes promo</p>
            <p className="text-on-surface-variant text-[11px]">Créer et gérer les remises</p>
          </div>
          <Icon name="chevron_right" className="text-on-surface-variant ml-auto" size={18} />
        </button>
      </div>

      {/* Recent activity */}
      <div className="parchment-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Activité récente</p>
        </div>
        <div className="divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${activityColor[a.type]}18` }}>
                <Icon name={activityIcon[a.type]} size={14} style={{ color: activityColor[a.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-sm font-medium truncate">{a.user}</p>
                <p className="text-on-surface-variant text-[11px] truncate">{a.detail}</p>
              </div>
              <span className="text-on-surface-variant text-[10px] shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
