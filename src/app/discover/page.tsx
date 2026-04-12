"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

type Mode = "Solo" | "Famille" | "Groupe" | "Corporate";

const quests = [
  {
    id: "meknes-imperial",
    title: "Secrets de la Cité Impériale",
    subtitle: "Meknès · 8 étapes",
    difficulty: "Moyen",
    duration: "2h30",
    price: "100 MAD",
    rating: 4.8,
    accessible: true,
    image: "https://res.cloudinary.com/db2ljqpdt/image/upload/v1776024577/e2df93b4-1115-4922-b854-4870a826e92a_kdc11h.png",
    modes: ["Solo", "Famille", "Groupe"] as Mode[],
  },
  {
    id: "thomas-pellow",
    title: "Sur les traces de Thomas Pellow",
    subtitle: "Meknès · 6 étapes",
    difficulty: "Difficile",
    duration: "3h00",
    price: "120 MAD",
    rating: 4.9,
    accessible: false,
    image: "/images/hero-thomas-pellow.png",
    modes: ["Solo", "Groupe"] as Mode[],
  },
  {
    id: "mausolee",
    title: "Le Mystère du Mausolée",
    subtitle: "Meknès · 5 étapes",
    difficulty: "Facile",
    duration: "1h30",
    price: "80 MAD",
    rating: 4.6,
    accessible: true,
    image: "/images/bab-mansour-antique.png",
    modes: ["Solo", "Famille"] as Mode[],
  },
];

const difficultyStyle: Record<string, string> = {
  Facile: "bg-emerald-700/80 text-white",
  Moyen: "bg-amber-700/80 text-white",
  Difficile: "bg-red-800/80 text-white",
};

const modeConfig: Record<Mode, { icon: string; color: string; bg: string }> = {
  Solo:      { icon: "person",         color: "#8c4b00", bg: "rgba(140,75,0,0.12)" },
  Famille:   { icon: "family_restroom", color: "#296767", bg: "rgba(41,103,103,0.12)" },
  Groupe:    { icon: "group",           color: "#c97a00", bg: "rgba(201,122,0,0.12)" },
  Corporate: { icon: "business_center", color: "#8b2a00", bg: "rgba(139,42,0,0.1)" },
};

const filters: { label: string; value: string }[] = [
  { label: "Tous", value: "Tous" },
  { label: "Solo", value: "Solo" },
  { label: "Famille", value: "Famille" },
  { label: "Groupe", value: "Groupe" },
  { label: "Corporate", value: "Corporate" },
  { label: "PMR", value: "PMR" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name={s <= Math.floor(rating) ? "star" : "star_outline"}
          filled={s <= Math.floor(rating)}
          size={13}
          className="text-amber-500"
        />
      ))}
      <span className="text-xs text-white/80 ml-1 font-bold">{rating}</span>
    </div>
  );
}

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filtered = activeFilter === "Tous" ? quests
    : activeFilter === "PMR" ? quests.filter(q => q.accessible)
    : quests.filter(q => q.modes.includes(activeFilter as Mode));

  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-between items-center px-6 h-16"
        style={{ background: "rgba(255,249,237,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <Icon name="explore" filled className="text-primary" size={22} />
          <h1 className="text-xl font-black text-primary tracking-tighter font-headline">UrbanKey</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-primary tap-scale p-1"><Icon name="search" size={22} /></button>
          <button className="text-primary tap-scale p-1"><Icon name="notifications" size={22} /></button>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center" style={{ border: "1px solid rgba(140,122,90,0.3)" }}>
              <Icon name="person" className="text-primary" size={18} />
            </div>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-4 px-5">
        {/* Hero headline */}
        <div className="mb-6 pt-2">
          <h2 className="text-[2.8rem] leading-none font-headline font-bold text-on-background mb-2">
            Dévoile les <span className="text-primary italic">Secrets</span>
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Parcours immersifs dans la Cité Impériale de Meknès.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5 mb-6">
          {filters.map((f) => {
            const cfg = f.value !== "Tous" && f.value !== "PMR" ? modeConfig[f.value as Mode] : null;
            const active = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className="flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide tap-scale whitespace-nowrap transition-all"
                style={{
                  background: active ? "#8c4b00" : cfg ? cfg.bg : "rgba(140,122,90,0.1)",
                  color: active ? "#fff" : cfg ? cfg.color : "#5c3d1e",
                  border: active ? "none" : "1px solid rgba(140,122,90,0.2)",
                }}
              >
                {cfg && <Icon name={cfg.icon} size={13} />}
                {f.value === "PMR" && <Icon name="accessible" size={13} />}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Quest cards */}
        <div className="flex flex-col gap-5">
          {filtered.map((quest) => (
            <Link key={quest.id} href={`/quest/${quest.id}`}>
              <article className="group relative overflow-hidden rounded-2xl shadow-md hover:-translate-y-0.5 transition-transform duration-300"
                style={{ border: "1px solid rgba(140,122,90,0.2)" }}
              >
                {/* Image zone */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={quest.image}
                    alt={quest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Dark overlay — assez opaque pour le texte blanc */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)" }} />

                  {/* Difficulty badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${difficultyStyle[quest.difficulty]}`}>
                      {quest.difficulty}
                    </span>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/50 text-white/90 flex items-center gap-1">
                      <Icon name="schedule" size={11} />
                      {quest.duration}
                    </span>
                  </div>

                  {/* Title + rating on image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest mb-0.5">{quest.subtitle}</p>
                    <h3 className="text-white font-headline font-bold text-lg leading-tight mb-2 drop-shadow-sm">
                      {quest.title}
                    </h3>
                    <StarRating rating={quest.rating} />
                  </div>
                </div>

                {/* Footer — fond parchemin clair */}
                <div className="px-4 pt-3 pb-3 bg-surface-container-low">
                  {/* Modes badges */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {quest.modes.map(m => (
                      <span key={m} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: modeConfig[m].bg, color: modeConfig[m].color }}>
                        <Icon name={modeConfig[m].icon} size={10} />
                        {m}
                      </span>
                    ))}
                    {quest.accessible && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: "rgba(41,103,103,0.1)", color: "#296767" }}>
                        <Icon name="accessible" size={10} />
                        PMR
                      </span>
                    )}
                  </div>
                  {/* Prix + CTA */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Tarif</p>
                      <p className="text-lg font-headline font-extrabold text-primary">{quest.price}</p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl cta-gradient text-white text-xs font-black uppercase tracking-wide tap-scale shadow-sm">
                      Démarrer
                    </button>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
