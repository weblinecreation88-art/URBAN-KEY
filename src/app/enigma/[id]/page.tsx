"use client";

import { useState, useEffect, useRef, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { PARCOURS_MEKNES } from "@/data/parcours";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useAuth } from "@/context/AuthContext";

// Confettis — valeurs déterministes pour éviter toute erreur SSR
const CONFETTI_PIECES = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  color: ["#c9a96e", "#8c4b00", "#296767", "#f0be72", "#a2cfce", "#e8d5b0", "#d4a96a"][i % 7],
  left: (i * 1.43) % 100,
  delay: (i * 0.012) % 0.9,
  duration: 1.4 + (i % 6) * 0.18,
  size: 6 + (i % 5) * 2,
  isCircle: i % 3 === 0,
  rotate: (i * 47) % 360,
}));

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {CONFETTI_PIECES.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#c8b99a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5c3d1e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5ead6" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8d5b0" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4bc8e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a0c4cc" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#d8c8a8" }] },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function isCorrect(userAnswer: string, expected: string): boolean {
  const a = normalize(userAnswer);
  const b = normalize(expected);
  if (a === b) return true;
  const tolerance = b.length <= 6 ? 1 : 2;
  return levenshtein(a, b) <= tolerance;
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
  const { user, loading: authLoading, hasPurchased } = useAuth();

  const steps = PARCOURS_MEKNES.steps.filter((s) => !s.isBonus && Number.isInteger(s.order));
  const stepIndex = steps.findIndex((s) => s.id === id || s.order === Number(id));
  const step = steps[stepIndex] ?? steps[0];
  const totalSteps = steps.length;

  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    hasPurchased(PARCOURS_MEKNES.id).then((ok) => {
      if (!ok) router.replace(`/quest/${PARCOURS_MEKNES.id}`);
      else setAccessChecked(true);
    });
  }, [user, authLoading, hasPurchased, router]);

  const SAVE_KEY = `urbankey_progress_${PARCOURS_MEKNES.id}_${step.id}`;

  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}"); } catch { return {}; }
  }

  const saved = useMemo(() => loadSaved(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [wrongCount, setWrongCount] = useState<number>(saved.wrongCount ?? 0);
  const [score, setScore] = useState<number>(saved.score ?? step.scoreBase);
  const [success, setSuccess] = useState<boolean>(saved.success ?? false);
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState<"enigme" | "carte">("enigme");
  const [showSkipAnswer, setShowSkipAnswer] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const staticHints = step.indices ?? [];
  const [hintIndex, setHintIndex] = useState<number>(saved.hintIndex ?? 0);
  const [revealedHints, setRevealedHints] = useState<string[]>(saved.revealedHints ?? []);
  const [hintLoading, setHintLoading] = useState(false);

  // Sauvegarde étape active + état énigme
  useEffect(() => {
    try {
      localStorage.setItem(`urbankey_active_step_${PARCOURS_MEKNES.id}`, JSON.stringify(step.id));
      localStorage.setItem(SAVE_KEY, JSON.stringify({ score, wrongCount, hintIndex, revealedHints, success }));
    } catch { /* quota */ }
  }, [score, wrongCount, hintIndex, revealedHints, success, SAVE_KEY, step.id]);

  // Mini-carte
  const miniMapRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<google.maps.Map | null>(null);
  const miniUserMarkerRef = useRef<google.maps.Marker | null>(null);
  const miniWatchIdRef = useRef<number | null>(null);

  const timer = useTimer(!success);

  // Init mini-carte quand l'onglet devient actif
  useEffect(() => {
    if (activeTab !== "carte") return;
    if (miniMapInstanceRef.current) return; // déjà initialisé

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "AIzaSyDvm3X_xExGFimV8z7pkAXzYe7tVs8cv6o";
    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps").then(() => {
      if (!miniMapRef.current) return;

      const map = new google.maps.Map(miniMapRef.current, {
        center: { lat: step.coords.lat, lng: step.coords.lng },
        zoom: 18,
        disableDefaultUI: true,
        styles: MAP_STYLES,
        gestureHandling: "greedy",
      });
      miniMapInstanceRef.current = map;

      // Marker étape
      new google.maps.Marker({
        position: { lat: step.coords.lat, lng: step.coords.lng },
        map,
        title: step.title,
        label: { text: String(Math.floor(step.order)), color: "#fff", fontWeight: "bold", fontSize: "12px" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: "#8c4b00",
          fillOpacity: 1,
          strokeColor: "#fff9ed",
          strokeWeight: 3,
        },
        zIndex: 10,
      });

      // Cercle de zone (~20m)
      new google.maps.Circle({
        map,
        center: { lat: step.coords.lat, lng: step.coords.lng },
        radius: 20,
        strokeColor: "#8c4b00",
        strokeOpacity: 0.4,
        strokeWeight: 1,
        fillColor: "#8c4b00",
        fillOpacity: 0.08,
      });

      // Position utilisateur en temps réel
      if (navigator.geolocation) {
        miniWatchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (!miniUserMarkerRef.current) {
              miniUserMarkerRef.current = new google.maps.Marker({
                position: userPos,
                map,
                title: "Vous êtes ici",
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#296767",
                  fillOpacity: 1,
                  strokeColor: "#fff9ed",
                  strokeWeight: 3,
                },
                zIndex: 999,
              });
            } else {
              miniUserMarkerRef.current.setPosition(userPos);
            }
          },
          undefined,
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    }).catch(console.error);

    return () => {
      if (miniWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(miniWatchIdRef.current);
      }
    };
  }, [activeTab, step]);

  function triggerSuccess() {
    setConfettiActive(true);
    setSuccess(true);
    setTimeout(() => setConfettiActive(false), 3500);
  }

  function handleValidate() {
    if (!answer.trim()) return;
    if (!step.reponse) { triggerSuccess(); return; }
    if (isCorrect(answer, step.reponse)) {
      setWrong(false);
      triggerSuccess();
    } else {
      setWrong(true); setWrongCount((c) => c + 1);
      setTimeout(() => setWrong(false), 1500);
    }
  }

  function handleChoice(choice: string) {
    if (isCorrect(choice, step.reponse ?? "")) {
      triggerSuccess();
    } else {
      setWrong(true); setWrongCount((c) => c + 1);
      setTimeout(() => setWrong(false), 1200);
    }
  }

  function handleSkip() {
    // Montrer la réponse avant de passer (sauf si pas de réponse)
    if (step.reponse) {
      setShowSkipAnswer(true);
    } else {
      setScore(0);
      triggerSuccess();
    }
  }

  function confirmSkip() {
    setShowSkipAnswer(false);
    setScore(0);
    triggerSuccess();
  }

  async function showNextHint() {
    if (hintIndex < staticHints.length) {
      setScore((s) => Math.max(0, s - 30));
      setRevealedHints((prev) => [...prev, staticHints[hintIndex]]);
      setHintIndex((i) => i + 1);
    } else {
      setHintLoading(true);
      setScore((s) => Math.max(0, s - 50));
      try {
        const res = await fetch("/api/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enigmaTitle: step.title, enigmaText: step.enigme, stepNumber: step.order }),
        });
        const data = await res.json();
        setRevealedHints((prev) => [...prev, data.hint ?? "Cherche autour de toi, la réponse est gravée dans la pierre."]);
      } catch {
        setRevealedHints((prev) => [...prev, "Cherche autour de toi, la réponse est gravée dans la pierre."]);
      } finally {
        setHintLoading(false);
        setHintIndex((i) => i + 1);
      }
    }
  }

  const nextStep = steps[stepIndex + 1];
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const mapUrl = `/map?step=${step.id}`;

  // Écran succès
  if (success) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center gap-6">
        <Confetti active={confettiActive} />
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
          <button onClick={() => router.push(`/enigma/${nextStep.id}`)}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
          >
            Étape suivante : {nextStep.title}
            <Icon name="arrow_forward" size={18} />
          </button>
        ) : (
          <button onClick={() => router.push("/end")}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
          >
            <Icon name="emoji_events" size={18} />
            Voir mes résultats finaux
          </button>
        )}
        <button onClick={() => router.push(mapUrl)} className="text-primary text-sm font-medium tap-scale">
          Retour à la carte
        </button>
      </div>
    );
  }

  if (!accessChecked) {
    return (
      <div className="h-dvh bg-background flex items-center justify-center">
        <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="h-dvh bg-background text-on-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-4 z-50"
        style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="tap-scale w-8 h-8 flex items-center justify-center">
            <Icon name="arrow_back" className="text-primary" />
          </button>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Étape {step.order}/{totalSteps}</p>
            <h1 className="font-headline font-bold text-primary text-base leading-tight">
              {success ? step.title : "Mystère à élucider…"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high" style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
            <Icon name="timer" className="text-primary" size={14} />
            <span className="text-primary font-bold text-sm font-label">{timer}</span>
          </div>
          <button onClick={() => router.push("/discover")} className="tap-scale w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high" style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
            <Icon name="home" className="text-primary" size={18} />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0 h-1 w-full bg-surface-container-high">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Tab toggle Énigme | Carte */}
      <div className="shrink-0 flex" style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
        <button
          onClick={() => setActiveTab("enigme")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "enigme" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant/60"
          }`}
          style={{ background: activeTab === "enigme" ? "rgba(140,75,0,0.05)" : "transparent" }}
        >
          <Icon name="extension" size={14} filled={activeTab === "enigme"} />
          Énigme
        </button>
        <button
          onClick={() => setActiveTab("carte")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "carte" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant/60"
          }`}
          style={{ background: activeTab === "carte" ? "rgba(140,75,0,0.05)" : "transparent" }}
        >
          <Icon name="map" size={14} filled={activeTab === "carte"} />
          Carte
        </button>
      </div>

      {/* Onglet Carte — plein écran sous les tabs */}
      {activeTab === "carte" && (
        <div className="flex-1 relative">
          <div ref={miniMapRef} className="absolute inset-0 w-full h-full" />
          {/* Badge lieu */}
          <div className="absolute bottom-24 left-4 right-4 z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(140,122,90,0.25)" }}
            >
              <div className="w-3 h-3 rounded-full bg-primary/80 animate-pulse" />
              <span className="text-primary text-xs font-bold">{step.lieu}</span>
              <span className="text-on-surface-variant/60 text-[10px]">· Zone : ~20m</span>
            </div>
          </div>
          {/* Bouton recentrer */}
          <button
            onClick={() => miniMapInstanceRef.current?.panTo({ lat: step.coords.lat, lng: step.coords.lng })}
            className="absolute bottom-24 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center tap-scale"
            style={{ background: "rgba(255,249,237,0.95)", border: "1px solid rgba(140,122,90,0.3)", boxShadow: "0 2px 12px rgba(44,26,0,0.15)" }}
          >
            <Icon name="my_location" className="text-primary" size={18} />
          </button>
        </div>
      )}

      {/* Onglet Énigme — scrollable */}
      {activeTab === "enigme" && (
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-5 py-5 space-y-5">
            {/* Hero image */}
            <section className="relative rounded-2xl overflow-hidden shadow-md" style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
              <div className="aspect-[16/9]">
                <img src="/images/enigma-mosaique.png" alt={step.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full bg-amber-800/70 uppercase tracking-wider">Énigme active</span>
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
              <p className="text-on-surface leading-relaxed text-sm font-medium">{step.enigme}</p>
              {step.qrCodePosition && (
                <p className="text-on-surface-variant text-[10px] mt-3 italic">
                  <Icon name="qr_code" size={11} className="inline mr-1" />
                  QR Code : {step.qrCodePosition}
                </p>
              )}
              {(step.descriptionLongue || step.videoUrl) && (
                <button onClick={() => setShowMore(true)} className="mt-3 flex items-center gap-1.5 text-secondary text-xs font-bold tap-scale">
                  <Icon name="info" size={14} />
                  En savoir plus sur ce lieu
                </button>
              )}
            </section>

            {/* Réponse */}
            <section className="parchment-card rounded-2xl p-5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Votre réponse</p>
              {step.choices ? (
                <div className="space-y-2">
                  {step.choices.map((choice) => (
                    <button key={choice} onClick={() => handleChoice(choice)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm tap-scale transition-all ${wrong ? "ring-1 ring-red-400" : ""}`}
                      style={{ background: "rgba(140,75,0,0.06)", border: "1px solid rgba(140,122,90,0.25)", color: "#2c1a00" }}
                    >
                      {choice}
                    </button>
                  ))}
                  {wrong && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <Icon name="cancel" size={13} /> Ce n&apos;est pas la bonne réponse. Essaie encore !
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <input type="text" value={answer}
                      onChange={(e) => { setAnswer(e.target.value); setWrong(false); }}
                      onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                      placeholder="Entrez votre réponse…"
                      className={`flex-1 rounded-xl px-4 py-3 text-on-surface font-medium text-sm outline-none transition-all placeholder:text-on-surface-variant/50 ${wrong ? "ring-2 ring-red-500 bg-red-50" : "bg-surface-container-low focus:ring-2 focus:ring-primary/40"}`}
                    />
                    <button onClick={handleValidate}
                      className="px-5 py-3 rounded-xl cta-gradient font-headline font-bold text-white text-sm tap-scale shrink-0"
                    >
                      Valider
                    </button>
                  </div>
                  {wrong && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <Icon name="cancel" size={13} /> Ce n&apos;est pas la bonne réponse. Cherche encore !
                    </p>
                  )}
                </>
              )}
              {(wrongCount >= 2 || revealedHints.length >= staticHints.length + 1) && (
                <button onClick={handleSkip}
                  className="mt-4 w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tap-scale"
                  style={{ background: "rgba(140,75,0,0.08)", color: "#8c4b00", border: "1px solid rgba(140,75,0,0.2)" }}
                >
                  <Icon name="skip_next" size={15} /> Passer cette étape (0 point)
                </button>
              )}
            </section>

            {/* Indices */}
            <section className="parchment-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="lightbulb" className="text-primary" size={18} />
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Indices</p>
              </div>
              {revealedHints.map((hint, i) => (
                <div key={i} className="mb-3">
                  <p className="text-[10px] text-on-surface-variant/60 mb-1">Indice {i + 1}</p>
                  <p className="text-primary italic text-sm leading-relaxed">&ldquo;{hint}&rdquo;</p>
                </div>
              ))}
              {hintLoading && (
                <div className="flex items-center gap-2 text-primary text-sm mb-3">
                  <Icon name="progress_activity" size={16} className="animate-spin" />
                  <span>Gemini génère un indice…</span>
                </div>
              )}
              {!hintLoading && (
                <button onClick={showNextHint} className="w-full flex items-center justify-between tap-scale py-1">
                  <span className="text-primary font-bold text-xs uppercase tracking-widest">
                    {revealedHints.length === 0 ? "Révéler un indice" : hintIndex < staticHints.length ? `Indice ${revealedHints.length + 1}` : "Aide IA"}
                  </span>
                  <span className="text-on-surface-variant text-[10px] bg-surface-container px-2 py-0.5 rounded-full">
                    {hintIndex < staticHints.length ? "-30 pts" : "-50 pts"}
                  </span>
                </button>
              )}
              {revealedHints.length > 0 && (
                <p className="text-on-surface-variant/60 text-[10px] mt-2">Score actuel : {score} pts</p>
              )}
              {revealedHints.length > 0 && (
                <p className="text-on-surface-variant/50 text-[10px] mt-1 italic">
                  Toujours bloqué ? Le bouton <strong>Passer</strong> apparaît sous la zone de réponse.
                </p>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="shrink-0 flex justify-around items-center px-4 py-3 rounded-t-2xl"
        style={{ background: "rgba(255,249,237,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(140,122,90,0.2)" }}
      >
        <button onClick={() => router.push(mapUrl)} className="flex flex-col items-center text-on-surface-variant/60 tap-scale gap-0.5">
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

      {/* Modal réponse avant skip */}
      {showSkipAnswer && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowSkipAnswer(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-5"
            style={{ background: "#fff9ed", borderTop: "1px solid rgba(140,122,90,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "rgba(140,122,90,0.3)" }} />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(140,75,0,0.1)" }}>
                <Icon name="lightbulb" className="text-primary" size={20} filled />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Réponse correcte</p>
                <h3 className="font-headline font-bold text-on-surface text-base">{step.title}</h3>
              </div>
            </div>
            <div className="rounded-2xl px-5 py-4" style={{ background: "rgba(140,75,0,0.07)", border: "1px solid rgba(140,75,0,0.15)" }}>
              <p className="text-primary font-headline font-bold text-xl text-center tracking-wide">
                {step.reponse}
              </p>
            </div>
            <p className="text-on-surface-variant text-xs text-center">
              Tu te souviens pour la prochaine fois ? Cette étape ne rapporte pas de points.
            </p>
            <button
              onClick={confirmSkip}
              className="w-full py-3.5 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
            >
              <Icon name="skip_next" size={18} />
              J&apos;ai compris — passer (0 pt)
            </button>
          </div>
        </div>
      )}

      {/* Bottom sheet "En savoir plus" */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4 max-h-[80dvh] overflow-y-auto"
            style={{ background: "#fff9ed", borderTop: "1px solid rgba(140,122,90,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ background: "rgba(140,122,90,0.3)" }} />
            <h2 className="font-headline font-bold text-on-surface text-lg">{step.title}</h2>
            {step.descriptionLongue && (
              <p className="text-on-surface/80 text-sm leading-relaxed">{step.descriptionLongue}</p>
            )}
            {step.videoUrl && (
              <div className="rounded-xl overflow-hidden aspect-video">
                <iframe src={step.videoUrl} className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <button onClick={() => setShowMore(false)}
              className="w-full py-3 rounded-xl cta-gradient font-headline font-bold text-white tap-scale"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
