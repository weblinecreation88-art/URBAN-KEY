"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { PARCOURS_MEKNES } from "@/data/parcours";

// Normalise une réponse pour comparaison souple
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function EnigmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Trouve l'étape par son id ou son ordre
  const steps = PARCOURS_MEKNES.steps.filter((s) => !s.isBonus && Number.isInteger(s.order));
  const stepIndex = steps.findIndex((s) => s.id === id || s.order === Number(id));
  const step = steps[stepIndex] ?? steps[0];
  const totalSteps = steps.length;

  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintText, setHintText] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [score, setScore] = useState(step.scoreBase);
  const [success, setSuccess] = useState(false);
  const timer = useTimer(!success);

  function handleValidate() {
    if (!answer.trim()) return;
    if (!step.reponse) {
      // Étapes sans réponse fixe (dimensions, galeries) — accepter toute réponse
      setSuccess(true);
      return;
    }
    if (normalize(answer) === normalize(step.reponse)) {
      setSuccess(true);
      setWrong(false);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1500);
    }
  }

  async function showHint() {
    if (hintVisible) return;
    setScore((s) => Math.max(0, s - 50));
    setHintVisible(true);
    setHintLoading(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enigmaTitle: step.title,
          enigmaText: step.enigme,
          stepNumber: step.order,
        }),
      });
      const data = await res.json();
      setHintText(data.hint ?? "Cherche autour de toi, la réponse est gravée dans la pierre.");
    } catch {
      setHintText("Cherche autour de toi, la réponse est gravée dans la pierre.");
    } finally {
      setHintLoading(false);
    }
  }

  const nextStep = steps[stepIndex + 1];
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  // Écran succès
  if (success) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center glow-primary" style={{ background: "rgba(140,75,0,0.12)" }}>
          <Icon name="check_circle" filled className="text-primary" size={56} />
        </div>
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-1">Bravo !</h2>
          <p className="text-on-surface-variant">Étape {step.order} résolue en {timer}</p>
        </div>
        <div className="parchment-card rounded-xl p-5 w-full text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Points gagnés</span>
            <span className="text-primary font-headline font-bold text-xl">+{score} pts</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Progression</span>
            <span className="text-primary font-bold text-sm">{stepIndex + 1} / {totalSteps}</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {nextStep ? (
          <button
            onClick={() => router.push(`/enigma/${nextStep.id}`)}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
          >
            Étape suivante : {nextStep.title}
            <Icon name="arrow_forward" size={18} />
          </button>
        ) : (
          <button
            onClick={() => router.push("/end")}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
          >
            <Icon name="emoji_events" size={18} />
            Voir mes résultats finaux
          </button>
        )}
        <button onClick={() => router.push("/map")} className="text-primary text-sm font-medium tap-scale">
          Retour à la carte
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="tap-scale w-8 h-8 flex items-center justify-center">
            <Icon name="arrow_back" className="text-primary" />
          </button>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Étape {step.order}/{totalSteps}</p>
            <h1 className="font-headline font-bold text-primary text-base leading-tight">{step.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high" style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
            <Icon name="timer" className="text-primary" size={14} />
            <span className="text-primary font-bold text-sm font-label">{timer}</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-surface-container-high">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <main className="px-5 py-5 space-y-5">
        {/* Hero image */}
        <section className="relative rounded-2xl overflow-hidden shadow-md" style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
          <div className="aspect-[16/9]">
            <img
              src="/images/enigma-mosaique.png"
              alt={step.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full bg-amber-800/70 uppercase tracking-wider">
              Énigme active
            </span>
            <span className="text-white/80 text-xs font-medium px-2 py-1 rounded-full bg-black/40">
              <Icon name="location_on" size={12} className="inline mr-0.5" />{step.lieu}
            </span>
          </div>
        </section>

        {/* Énigme */}
        <section className="parchment-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5">
            <Icon name="auto_stories" filled size={100} />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-3">Énigme</p>
          <p className="text-on-surface leading-relaxed text-sm font-medium">
            {step.enigme}
          </p>
          {step.qrCodePosition && (
            <p className="text-on-surface-variant text-[10px] mt-3 italic">
              <Icon name="qr_code" size={11} className="inline mr-1" />
              QR Code : {step.qrCodePosition}
            </p>
          )}
        </section>

        {/* Réponse */}
        <section className="parchment-card rounded-2xl p-5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Votre réponse</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setWrong(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              placeholder="Entrez votre réponse…"
              className={`flex-1 rounded-xl px-4 py-3 text-on-surface font-medium text-sm outline-none transition-all placeholder:text-on-surface-variant/50 ${
                wrong
                  ? "ring-2 ring-red-500 bg-red-50"
                  : "bg-surface-container-low focus:ring-2 focus:ring-primary/40"
              }`}
            />
            <button
              onClick={handleValidate}
              className="px-5 py-3 rounded-xl cta-gradient font-headline font-bold text-white text-sm tap-scale shrink-0"
            >
              Valider
            </button>
          </div>
          {wrong && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
              <Icon name="cancel" size={13} />
              Ce n&apos;est pas la bonne réponse. Cherche encore !
            </p>
          )}
        </section>

        {/* Indice IA */}
        <section className="parchment-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="lightbulb" className="text-primary" size={18} />
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Indice</p>
          </div>
          {hintVisible ? (
            hintLoading ? (
              <div className="flex items-center gap-2 text-primary text-sm">
                <Icon name="progress_activity" size={16} className="animate-spin" />
                <span>Gemini génère un indice…</span>
              </div>
            ) : (
              <>
                <p className="text-primary italic text-sm leading-relaxed">&ldquo;{hintText}&rdquo;</p>
                <p className="text-on-surface-variant/60 text-[10px] mt-2">Score actuel : {score} pts</p>
              </>
            )
          ) : (
            <button
              onClick={showHint}
              className="w-full flex items-center justify-between tap-scale py-1"
            >
              <span className="text-primary font-bold text-xs uppercase tracking-widest">Révéler un indice</span>
              <span className="text-on-surface-variant text-[10px] bg-surface-container px-2 py-0.5 rounded-full">-50 pts</span>
            </button>
          )}
        </section>

        {/* Mini carte — lien vers /map */}
        <button onClick={() => router.push("/map")} className="w-full rounded-xl overflow-hidden relative tap-scale"
          style={{ border: "1px solid rgba(140,122,90,0.2)" }}
        >
          <img src="/images/bab-mansour.jpg" alt="Carte" className="w-full h-24 object-cover opacity-70" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20">
            <Icon name="map" className="text-white" size={18} />
            <span className="text-white font-bold text-sm">Voir sur la carte</span>
          </div>
        </button>
      </main>

      {/* Bottom nav énigme */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center px-4 py-3 rounded-t-2xl"
        style={{ background: "rgba(255,249,237,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(140,122,90,0.2)" }}
      >
        <button onClick={() => router.push("/map")} className="flex flex-col items-center text-on-surface-variant/60 tap-scale gap-0.5">
          <Icon name="map" size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Carte</span>
        </button>
        <button className="flex flex-col items-center text-primary tap-scale gap-0.5">
          <Icon name="extension" filled size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Énigme</span>
        </button>
        <button onClick={() => router.push("/discover")} className="flex flex-col items-center text-on-surface-variant/60 tap-scale gap-0.5">
          <Icon name="history" size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Journal</span>
        </button>
      </nav>
    </div>
  );
}
