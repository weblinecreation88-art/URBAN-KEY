"use client";

import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const quests = [
  {
    id: "vieux-quartier",
    title: "Vieux quartier — Meknès",
    difficulty: "Facile",
    duration: "1h15",
    price: "100 MAD",
    rating: 4.5,
    accessible: true,
    image: "/images/thomas-pellow.png",
    tag: "Patrimoine",
  },
  {
    id: "bab-mansour",
    title: "Porte de Bab Mansour",
    difficulty: "Moyen",
    duration: "2h30",
    price: "150 MAD",
    rating: 5,
    accessible: false,
    image: "/images/bab-mansour.jpg",
    tag: "Histoire",
  },
  {
    id: "secrets-souk",
    title: "Secrets du Souk",
    difficulty: "Difficile",
    duration: "3h15",
    price: "120 MAD",
    rating: 4,
    accessible: false,
    image: "/images/bab-mansour-antique.png",
    tag: "Gastronomie",
  },
];

const difficultyColor: Record<string, string> = {
  Facile: "text-primary",
  Moyen: "text-secondary",
  Difficile: "text-error",
};

const filters = ["Difficulté", "Ville", "Type", "À proximité"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-secondary">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={s}
          name={s <= Math.floor(rating) ? "star" : s - 0.5 === rating ? "star_half" : "star_outline"}
          filled={s <= Math.floor(rating)}
          size={14}
        />
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-between items-center px-6 h-16 bg-gradient-to-b from-surface-container-high to-background">
        <div className="flex items-center gap-2">
          <Icon name="explore" filled className="text-primary" size={22} />
          <h1 className="text-xl font-black text-primary tracking-tighter font-headline">
            UrbanKey
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-primary tap-scale p-1">
            <Icon name="search" size={22} />
          </button>
          <button className="text-primary tap-scale p-1">
            <Icon name="notifications" size={22} />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: "1px solid rgba(162,207,206,0.2)" }}>
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              <Icon name="person" className="text-primary" size={18} />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-4 px-6">
        {/* Hero headline */}
        <div className="mb-8">
          <h2 className="text-[3.2rem] leading-none font-headline font-extrabold tracking-tighter text-on-background mb-2">
            Dévoile les <span className="text-primary italic">Secrets</span>
          </h2>
          <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
            Découvrez les légendes urbaines cachées de Meknès.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6 mb-8">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`flex-none px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase tap-scale whitespace-nowrap ${
                i === 0
                  ? "bg-secondary-container text-on-secondary-container flex items-center gap-1.5"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
              style={i !== 0 ? { border: "1px solid rgba(64,72,72,0.15)" } : undefined}
            >
              {i === 0 && <Icon name="tune" size={14} />}
              {f}
            </button>
          ))}
        </div>

        {/* Quest cards */}
        <div className="grid grid-cols-1 gap-6">
          {quests.map((quest) => (
            <Link key={quest.id} href={`/enigma/${quest.id}`}>
              <article className="group relative overflow-hidden rounded-xl bg-surface-container-highest flex flex-col hover:-translate-y-0.5 transition-transform duration-300">
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={quest.image}
                    alt={quest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-80" />

                  {/* Difficulty badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md ${difficultyColor[quest.difficulty]}`}
                      style={{ background: "rgba(8,20,34,0.6)" }}
                    >
                      {quest.difficulty}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-headline font-bold text-on-background leading-tight mb-1">
                      {quest.title}
                    </h3>
                    <div className="flex items-center gap-3 text-primary-fixed-dim text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <Icon name="schedule" size={14} className="text-primary-fixed-dim" />
                        {quest.duration}
                      </span>
                      {quest.accessible && (
                        <span className="flex items-center gap-1">
                          <Icon name="accessible" size={14} className="text-primary-fixed-dim" />
                          Accessible
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 flex justify-between items-center bg-surface-container-high">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">
                      Tarif
                    </div>
                    <div className="text-lg font-headline font-extrabold text-on-background">
                      {quest.price}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StarRating rating={quest.rating} />
                    <button className="px-4 py-2 rounded-lg cta-gradient text-on-primary-fixed text-xs font-bold uppercase tracking-widest tap-scale">
                      Rejoindre
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
