"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

const earnedBadges = [
  { name: "Explorateur Nocturne", icon: "dark_mode", color: "text-secondary bg-secondary-container" },
  { name: "Sans Indices", icon: "lightbulb_off", color: "text-primary bg-primary-container" },
];

const stats = [
  { label: "Score final", value: "8 450", icon: "stars", highlight: true },
  { label: "Temps total", value: "1h 22m", icon: "timer", highlight: false },
  { label: "Indices utilisés", value: "2", icon: "lightbulb", highlight: false },
  { label: "Étapes réussies", value: "6/6", icon: "flag", highlight: false },
];

export default function EndPage() {
  const router = useRouter();
  const [nps, setNps] = useState<number | null>(null);
  const [npsSubmitted, setNpsSubmitted] = useState(false);

  function submitNps(score: number) {
    setNps(score);
    setNpsSubmitted(true);
  }

  return (
    <div className="min-h-dvh bg-background text-on-background pb-10 overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />

      <main className="relative px-5 pt-14 space-y-8">
        {/* Celebration hero */}
        <section className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full flex items-center justify-center glow-secondary"
              style={{ background: "radial-gradient(circle, rgba(240,190,114,0.2) 0%, rgba(240,190,114,0.05) 70%)" }}
            >
              <Icon name="emoji_events" filled className="text-secondary" size={64} />
            </div>
            {/* Confetti bars */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full opacity-80"
                  style={{
                    width: "3px",
                    height: `${10 + (i % 3) * 8}px`,
                    background: i % 2 === 0 ? "#f0be72" : "#a2cfce",
                    transform: `rotate(${-20 + i * 8}deg)`,
                    marginTop: `${i % 2 === 0 ? 0 : 4}px`,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondary mb-1">Parcours terminé !</p>
            <h1 className="font-headline font-black text-3xl text-on-surface tracking-tight leading-tight">
              Mission Accomplie
            </h1>
            <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
              Vieux Quartier — Meknès · 6 étapes
            </p>
          </div>

          {/* Score spotlight */}
          <div
            className="w-full rounded-2xl p-6 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(240,190,114,0.15) 0%, rgba(162,207,206,0.08) 100%)", border: "1px solid rgba(240,190,114,0.2)" }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Score total</p>
            <p className="font-headline font-black text-5xl text-secondary text-glow-secondary">8 450</p>
            <p className="text-on-surface-variant text-xs mt-1">XP gagnés</p>
          </div>
        </section>

        {/* Stats grid */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Résumé</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon, highlight }) => (
              <div
                key={label}
                className="bg-surface-container-high rounded-xl p-4"
                style={highlight ? { border: "1px solid rgba(240,190,114,0.2)" } : {}}
              >
                <Icon name={icon} filled className={highlight ? "text-secondary" : "text-primary"} size={18} />
                <p className={`font-headline font-bold text-xl mt-2 ${highlight ? "text-secondary" : "text-on-surface"}`}>{value}</p>
                <p className="text-on-surface-variant text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Badges obtenus</h2>
          <div className="flex gap-3">
            {earnedBadges.map(({ name, icon, color }) => (
              <div key={name} className="flex-1 bg-surface-container-high rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon name={icon} filled size={26} />
                </div>
                <p className="text-on-surface font-headline font-bold text-xs leading-snug">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Share */}
        <section>
          <button
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-headline font-bold text-sm tap-scale"
            style={{ background: "rgba(236,224,202,1)", border: "1px solid rgba(140,122,90,0.3)" }}
          >
            <Icon name="share" className="text-primary" size={18} />
            <span className="text-on-surface">Partager mes résultats</span>
          </button>
        </section>

        {/* NPS */}
        <section className="bg-surface-container-high rounded-2xl p-5">
          {!npsSubmitted ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="thumb_up" filled className="text-secondary" size={16} />
                <h2 className="font-headline font-bold text-sm text-on-surface">Recommanderiez-vous UrbanKey ?</h2>
              </div>
              <p className="text-on-surface-variant text-[10px] mb-4">Note de 0 (pas du tout) à 10 (absolument !)</p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 11 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => submitNps(i)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tap-scale transition-all ${
                      nps === i
                        ? "bg-secondary text-on-secondary"
                        : "bg-surface-container-highest text-on-surface-variant hover:bg-secondary/20"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Icon name="check_circle" filled className="text-primary" size={32} />
              <p className="font-headline font-bold text-on-surface">Merci pour votre avis !</p>
              <p className="text-on-surface-variant text-xs text-center">
                {nps !== null && nps >= 9
                  ? "Vous êtes un vrai Explorateur Urbain 🔑"
                  : nps !== null && nps >= 7
                  ? "Nous prenons note pour améliorer encore l'expérience."
                  : "Votre retour nous aide à progresser."}
              </p>
            </div>
          )}
        </section>

        {/* Store rating CTA */}
        <section>
          <div className="bg-surface-container-high rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
              <Icon name="star" filled className="text-secondary" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-on-surface text-sm font-bold leading-tight">Laisser un avis</p>
              <p className="text-on-surface-variant text-[10px] mt-0.5">App Store · Google Play</p>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant" size={18} />
          </div>
        </section>

        {/* Bottom actions */}
        <section className="flex flex-col gap-3 pb-6">
          <button
            onClick={() => router.push("/profile")}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale"
          >
            Voir le résumé complet
          </button>
          <button
            onClick={() => router.push("/discover")}
            className="w-full py-3.5 rounded-xl font-headline font-semibold text-on-surface tap-scale"
            style={{ background: "rgba(236,224,202,0.8)", border: "1px solid rgba(140,122,90,0.2)" }}
          >
            Retour à mes parcours
          </button>
        </section>
      </main>
    </div>
  );
}
