"use client";

import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const badges = [
  { name: "Explorateur Nocturne", desc: "Terminer un parcours après 21h", icon: "dark_mode", earned: true, color: "text-secondary bg-secondary-container" },
  { name: "Sans Indices", desc: "Résoudre une étape sans aide", icon: "lightbulb_off", earned: true, color: "text-primary bg-primary-container" },
  { name: "Vitesse Éclair", desc: "Terminer en moins de 45 min", icon: "bolt", earned: false, color: "text-tertiary bg-tertiary-container" },
  { name: "Maître du QR", desc: "Scanner 10 markers AR", icon: "qr_code", earned: false, color: "text-on-surface-variant bg-surface-container-high" },
  { name: "Cartographe", desc: "Visiter toutes les villes", icon: "map", earned: false, color: "text-on-surface-variant bg-surface-container-high" },
  { name: "Légende Locale", desc: "Atteindre le top 10 à Meknès", icon: "military_tech", earned: false, color: "text-on-surface-variant bg-surface-container-high" },
];

const stats = [
  { label: "Parcours terminés", value: "3", icon: "flag" },
  { label: "Énigmes résolues", value: "18", icon: "extension" },
  { label: "Score total", value: "42 850", icon: "stars" },
  { label: "Temps total", value: "7h 24m", icon: "timer" },
];

export default function RewardsPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="tap-scale text-primary p-1">
            <Icon name="arrow_back" />
          </button>
          <h1 className="font-headline font-bold text-primary text-xl">Récompenses</h1>
        </div>
        <Icon name="military_tech" filled className="text-secondary" size={24} />
      </header>

      <main className="pt-20 px-5 space-y-8">
        {/* XP Progress */}
        <section className="bg-surface-container-high rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-10">
            <Icon name="emoji_events" filled size={120} />
          </div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Niveau actuel</p>
              <p className="font-headline font-black text-4xl text-secondary">24</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Prochain niveau</p>
              <p className="text-primary font-bold">7 150 XP restants</p>
            </div>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full shadow-[0_0_8px_rgba(240,190,114,0.5)]" style={{ width: "68%" }} />
          </div>
          <p className="text-on-surface-variant text-xs mt-2">42 850 / 50 000 XP</p>
        </section>

        {/* Stats grid */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-4">Statistiques</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon }) => (
              <div key={label} className="bg-surface-container-high rounded-xl p-4">
                <Icon name={icon} filled className="text-primary mb-2" size={20} />
                <p className="font-headline font-bold text-xl text-on-surface">{value}</p>
                <p className="text-on-surface-variant text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Badges */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Badges</h2>
            <span className="text-secondary text-xs font-bold">2 / {badges.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {badges.map(({ name, desc, icon, earned, color }) => (
              <div
                key={name}
                className={`bg-surface-container-high rounded-xl p-4 flex flex-col gap-3 transition-opacity ${!earned ? "opacity-40" : ""}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon name={icon} filled={earned} size={22} />
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface text-sm leading-tight">{name}</p>
                  <p className="text-on-surface-variant text-[10px] mt-1 leading-relaxed">{desc}</p>
                </div>
                {!earned && (
                  <div className="flex items-center gap-1">
                    <Icon name="lock" className="text-on-surface-variant/50" size={12} />
                    <span className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider">Verrouillé</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
