"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { PARCOURS_MEKNES, MAIN_STEPS, MAX_SCORE } from "@/data/parcours";
import Icon from "@/components/Icon";

function EndContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Read score from URL params (passed by enigma page on last step)
  const scoreParam = Number(searchParams.get("score") ?? 0);
  const hintsParam = Number(searchParams.get("hints") ?? 0);
  const timeParam = searchParams.get("time") ?? "—";
  const stepsParam = Number(searchParams.get("steps") ?? MAIN_STEPS.length);

  const [nps, setNps] = useState<number | null>(null);
  const [npsSubmitted, setNpsSubmitted] = useState(false);

  // Compute badges
  const badges = useMemo<{ name: string; icon: string; color: string; bg: string }[]>(() => {
    const result: { name: string; icon: string; color: string; bg: string }[] = [];
    if (hintsParam === 0) result.push({ name: "Sans Indices", icon: "lightbulb_off", color: "#8c4b00", bg: "rgba(140,75,0,0.1)" });
    if (stepsParam >= MAIN_STEPS.length) result.push({ name: "Parcours Complet", icon: "flag", color: "#296767", bg: "rgba(41,103,103,0.12)" });
    if (scoreParam >= MAX_SCORE * 0.8) result.push({ name: "Maître Explorateur", icon: "military_tech", color: "#c97a00", bg: "rgba(201,122,0,0.1)" });
    return result;
  }, [hintsParam, stepsParam, scoreParam]);

  // Save session result to Firestore on mount
  useEffect(() => {
    if (!user || !scoreParam) return;
    const questId = PARCOURS_MEKNES.id;
    // Save completed session
    addDoc(collection(db, "users", user.uid, "sessions"), {
      questId,
      questTitle: PARCOURS_MEKNES.title,
      score: scoreParam,
      hintsUsed: hintsParam,
      time: timeParam,
      stepsCompleted: stepsParam,
      badges: badges.map(b => b.name),
      completedAt: serverTimestamp(),
    }).catch(() => {}); // silent fail if offline

    // Update purchase status to "completed"
    updateDoc(doc(db, "users", user.uid, "purchases", questId), {
      status: "completed",
      completedAt: serverTimestamp(),
      score: scoreParam,
    }).catch(() => {});

    // Update profile XP
    updateDoc(doc(db, "users", user.uid), {
      xp: scoreParam,
      lastCompletedQuest: questId,
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function submitNps(score: number) {
    setNps(score);
    setNpsSubmitted(true);
    // Save NPS to Firestore
    try {
      await addDoc(collection(db, "npsResponses"), {
        score,
        questId: PARCOURS_MEKNES.id,
        userId: user?.uid ?? "anonymous",
        submittedAt: serverTimestamp(),
      });
    } catch {
      // silent fail
    }
  }

  async function shareResults() {
    const text = `J'ai terminé "${PARCOURS_MEKNES.title}" sur UrbanKey avec ${scoreParam} points en ${timeParam} ! 🗝️`;
    if (navigator.share) {
      await navigator.share({ title: "UrbanKey", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  const scorePercent = MAX_SCORE > 0 ? Math.round((scoreParam / MAX_SCORE) * 100) : 0;

  return (
    <div className="min-h-dvh bg-background pb-10 overflow-hidden">
      {/* Warm glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(140,75,0,0.06)" }} />
      <div className="fixed bottom-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
        style={{ background: "rgba(41,103,103,0.06)" }} />

      <main className="relative px-5 pt-14 space-y-6 max-w-lg mx-auto">

        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(140,75,0,0.15) 0%, rgba(140,75,0,0.03) 70%)" }}>
              <Icon name="emoji_events" filled className="text-primary" size={64} />
            </div>
            {/* Confetti */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="rounded-full opacity-80" style={{
                  width: 3, height: 10 + (i % 3) * 8,
                  background: i % 2 === 0 ? "#8c4b00" : "#296767",
                  transform: `rotate(${-20 + i * 8}deg)`,
                  marginTop: i % 2 === 0 ? 0 : 4,
                }} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondary mb-1">Parcours terminé !</p>
            <h1 className="font-headline font-black text-3xl text-on-surface tracking-tight">Mission Accomplie</h1>
            <p className="text-on-surface-variant text-sm mt-2">{PARCOURS_MEKNES.title} · {stepsParam} étapes</p>
          </div>

          {/* Score */}
          <div className="w-full parchment-card rounded-2xl p-6 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">Score total</p>
            <p className="font-headline font-black text-5xl text-primary">{scoreParam.toLocaleString()}</p>
            <p className="text-on-surface-variant text-xs mt-1">sur {MAX_SCORE} pts possibles</p>
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(140,122,90,0.2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${scorePercent}%`, background: "linear-gradient(90deg, #8c4b00, #c97a00)" }} />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">{scorePercent}% du score maximum</p>
          </div>
        </section>

        {/* Stats */}
        <section>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Résumé</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Temps total", value: timeParam, icon: "timer" },
              { label: "Indices utilisés", value: String(hintsParam), icon: "lightbulb" },
              { label: "Étapes réussies", value: `${stepsParam}/${MAIN_STEPS.length}`, icon: "flag" },
              { label: "Performance", value: `${scorePercent}%`, icon: "bar_chart" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="parchment-card rounded-xl p-4">
                <Icon name={icon} filled className="text-secondary" size={18} />
                <p className="font-headline font-bold text-xl text-on-surface mt-2">{value}</p>
                <p className="text-on-surface-variant text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Badges */}
        {badges.length > 0 && (
          <section>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Badges obtenus</p>
            <div className="flex gap-3 flex-wrap">
              {badges.map(({ name, icon, color, bg }) => (
                <div key={name} className="flex-1 parchment-card rounded-xl p-4 flex flex-col items-center gap-2 text-center min-w-[100px]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon name={icon} filled size={26} style={{ color }} />
                  </div>
                  <p className="text-on-surface font-headline font-bold text-xs leading-snug">{name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Share */}
        <button onClick={shareResults}
          className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-headline font-bold text-sm tap-scale parchment-card"
          style={{ border: "1px solid rgba(140,122,90,0.3)" }}>
          <Icon name="share" className="text-primary" size={18} />
          <span className="text-on-surface">Partager mes résultats</span>
        </button>

        {/* NPS */}
        <section className="parchment-card rounded-2xl p-5">
          {!npsSubmitted ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="thumb_up" filled className="text-secondary" size={16} />
                <h2 className="font-headline font-bold text-sm text-on-surface">Recommanderiez-vous UrbanKey ?</h2>
              </div>
              <p className="text-on-surface-variant text-[10px] mb-4">De 0 (pas du tout) à 10 (absolument !)</p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 11 }).map((_, i) => (
                  <button key={i} onClick={() => submitNps(i)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tap-scale transition-all"
                    style={{
                      background: nps === i ? "#8c4b00" : "rgba(140,122,90,0.12)",
                      color: nps === i ? "#fff" : "#5c3d1e",
                    }}>
                    {i}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <Icon name="check_circle" filled className="text-primary" size={32} />
              <p className="font-headline font-bold text-on-surface">Merci pour votre avis !</p>
              <p className="text-on-surface-variant text-xs">
                {nps !== null && nps >= 9 ? "Vous êtes un vrai Explorateur Urbain !" : nps !== null && nps >= 7 ? "Nous prenons note pour améliorer l'expérience." : "Votre retour nous aide à progresser."}
              </p>
            </div>
          )}
        </section>

        {/* App Store rating */}
        <div className="parchment-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,122,0,0.1)" }}>
            <Icon name="star" filled style={{ color: "#c97a00" }} size={22} />
          </div>
          <div className="flex-1">
            <p className="text-on-surface text-sm font-bold leading-tight">Laisser un avis</p>
            <p className="text-on-surface-variant text-[10px] mt-0.5">App Store · Google Play</p>
          </div>
          <Icon name="chevron_right" className="text-on-surface-variant" size={18} />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6">
          <button onClick={() => router.push("/profile")}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale">
            Voir le résumé complet
          </button>
          <button onClick={() => router.push("/discover")}
            className="w-full py-3.5 rounded-xl font-headline font-semibold text-on-surface tap-scale parchment-card"
            style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
            Retour aux parcours
          </button>
        </div>
      </main>
    </div>
  );
}

export default function EndPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
      </div>
    }>
      <EndContent />
    </Suspense>
  );
}
