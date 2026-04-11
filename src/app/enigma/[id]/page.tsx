"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function EnigmaPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [score, setScore] = useState(850);
  const [success, setSuccess] = useState(false);

  function handleValidate() {
    if (answer.trim().length > 0) setSuccess(true);
  }

  function showHint() {
    setScore((s) => Math.max(0, s - 50));
    setHintVisible(true);
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 glow-primary">
          <Icon name="check_circle" filled className="text-primary" size={56} />
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2">Bravo !</h2>
        <p className="text-on-surface-variant text-base mb-6">Tu as résolu cette étape.</p>
        <div className="bg-surface-container-high rounded-xl p-4 w-full mb-8">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Points gagnés</span>
            <span className="text-secondary font-headline font-bold text-xl">+{score}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-on-surface-variant text-sm">Progression</span>
            <span className="text-primary font-medium text-sm">Étape 4 / 6</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/map")}
          className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale"
        >
          Continuer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-on-background pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="tap-scale">
            <Icon name="arrow_back" className="text-primary" />
          </button>
          <h1 className="font-headline font-bold text-primary text-xl">Le Signal Silencieux</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary-container px-3 py-1 rounded-full">
            <Icon name="timer" className="text-secondary" size={16} />
            <span className="text-secondary font-bold text-sm font-label">08:24</span>
          </div>
          <button className="tap-scale p-1">
            <Icon name="more_vert" className="text-primary" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Hero image */}
        <section className="relative">
          <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1605106900803-34cd3b7b9571?w=600&q=80"
              alt="Énigme — Bab Mansour"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-6 left-6">
              <span
                className="text-secondary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md"
                style={{ background: "rgba(103,69,0,0.6)", border: "1px solid rgba(240,190,114,0.2)" }}
              >
                Énigme Active
              </span>
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-headline font-bold text-primary tracking-tight">Étape 3 sur 6</span>
            <span className="text-secondary font-medium text-sm text-glow-secondary">Bab Mansour</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full shadow-[0_0_8px_rgba(240,190,114,0.5)]"
              style={{ width: "50%" }}
            />
          </div>
        </section>

        {/* Narrative */}
        <section className="bg-surface-container-high p-6 rounded-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10">
            <Icon name="auto_stories" filled size={100} />
          </div>
          <h2 className="text-secondary font-headline font-bold text-xs uppercase tracking-[0.2em] mb-3">
            Narration
          </h2>
          <p className="text-primary leading-relaxed font-medium">
            &ldquo;Le secret de l&apos;architecte est caché en pleine vue. Cherche l&apos;alignement
            des trois étoiles sur la porte de Bab Mansour…&rdquo;
          </p>
        </section>

        {/* Objective + Answer */}
        <section className="bg-surface-container-highest p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="target" className="text-secondary" />
            <h2 className="text-on-surface-variant font-headline font-bold text-xs uppercase tracking-[0.2em]">
              Objectif
            </h2>
          </div>
          <p className="text-on-surface text-sm leading-relaxed mb-5">
            Trouve le symbole caché et entre le code à 4 chiffres situé sous l&apos;arche.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Code à 4 chiffres…"
              maxLength={4}
              className="flex-1 bg-surface-container-low rounded-lg px-4 py-3 text-on-surface font-medium text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/50"
            />
            <button
              onClick={handleValidate}
              className="px-5 py-3 rounded-lg cta-gradient font-headline font-bold text-on-primary-fixed text-sm tap-scale"
            >
              Valider
            </button>
          </div>
        </section>

        {/* Hint */}
        <section className="bg-surface-container-low p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="lightbulb" className="text-primary" />
            <h2 className="text-on-surface-variant font-headline font-bold text-xs uppercase tracking-[0.2em]">
              Indice disponible
            </h2>
          </div>
          {hintVisible ? (
            <p className="text-primary italic text-sm leading-relaxed">
              &ldquo;Observe les ombres à midi pile. La direction des rayons révèle le chemin.&rdquo;
            </p>
          ) : (
            <button
              onClick={showHint}
              className="w-full flex items-center justify-between text-secondary font-bold text-xs uppercase tracking-widest tap-scale"
            >
              <span>Révéler l&apos;indice (- 50 pts)</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          )}
          {hintVisible && (
            <p className="text-on-surface-variant/50 text-[10px] mt-2">
              Score actuel : {score} pts
            </p>
          )}
        </section>

        {/* Mini map */}
        <section
          className="p-1 rounded-xl overflow-hidden"
          style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(16px)" }}
        >
          <div className="h-28 w-full rounded-lg overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=600&q=80"
              alt="Carte Meknès"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-secondary p-2 rounded-full shadow-[0_0_15px_rgba(240,190,114,0.6)]">
                <Icon name="location_on" filled className="text-background" size={18} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom nav for enigma screen */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 rounded-t-xl bg-background/80 backdrop-blur-xl flex justify-around items-center px-4 py-3 pb-safe shadow-[0_-4px_32px_rgba(8,20,34,0.15)]">
        <button
          onClick={() => router.push("/map")}
          className="flex flex-col items-center text-on-surface-variant/60 tap-scale gap-0.5"
        >
          <Icon name="map" size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest font-label">Carte</span>
        </button>
        <button className="flex flex-col items-center text-secondary bg-secondary-container/20 rounded-xl px-4 py-1 tap-scale gap-0.5">
          <Icon name="extension" filled size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest font-label">Énigme</span>
        </button>
        <button className="flex flex-col items-center text-on-surface-variant/60 tap-scale gap-0.5">
          <Icon name="history" size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest font-label">Journal</span>
        </button>
      </nav>
    </div>
  );
}
