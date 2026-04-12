"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

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
    image: "/images/bab-mansour.jpg",
    tag: "Histoire",
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
    tag: "Aventure",
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
    tag: "Patrimoine",
  },
];

const difficultyStyle: Record<string, string> = {
  Facile: "bg-emerald-700/80 text-white",
  Moyen: "bg-amber-700/80 text-white",
  Difficile: "bg-red-800/80 text-white",
};

const filters = ["Tous", "Histoire", "Aventure", "Patrimoine", "Famille"];

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

  const filtered = activeFilter === "Tous"
    ? quests
    : quests.filter((q) => q.tag === activeFilter);

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
          <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
            Parcours immersifs dans la Cité Impériale de Meknès.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-none px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase tap-scale whitespace-nowrap transition-all ${
                activeFilter === f
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
              style={activeFilter !== f ? { border: "1px solid rgba(140,122,90,0.25)" } : undefined}
            >
              {f}
            </button>
          ))}
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
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">{quest.subtitle}</p>
                    <h3 className="text-white font-headline font-bold text-lg leading-tight mb-2 drop-shadow-sm">
                      {quest.title}
                    </h3>
                    <StarRating rating={quest.rating} />
                  </div>
                </div>

                {/* Footer — fond parchemin clair */}
                <div className="px-4 py-3 flex justify-between items-center bg-surface-container-low">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Tarif</p>
                    <p className="text-lg font-headline font-extrabold text-primary">{quest.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {quest.accessible && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-surface-container text-secondary" style={{ border: "1px solid rgba(41,103,103,0.3)" }}>
                        PMR ✓
                      </span>
                    )}
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
