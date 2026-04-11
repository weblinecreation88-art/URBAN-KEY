"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

const steps = [
  "Vérification du réseau…",
  "Vérification du GPS…",
  "Chargement des parcours…",
  "Prêt !",
];

export default function SplashPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setStepIndex(i), i * 900));
    });
    timers.push(setTimeout(() => router.push("/onboarding"), steps.length * 900 + 300));
    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div className="urban-bg h-dvh w-full flex flex-col items-center justify-between overflow-hidden relative">
      {/* Ambient glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo + loader */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] rotate-12 blur-xl" />
            <div
              className="relative flex items-center justify-center bg-surface-container-high w-full h-full rounded-[2rem]"
              style={{ border: "1px solid rgba(64,72,72,0.15)" }}
            >
              <Icon name="explore" filled className="text-primary" size={48} />
            </div>
          </div>
          <h1 className="font-headline font-extrabold text-5xl tracking-tighter text-primary">
            UrbanKey
          </h1>
          <p className="font-label text-on-surface-variant/60 text-xs uppercase tracking-[0.3em] mt-3">
            Unlock the City
          </p>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="loader-ring" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-on-surface text-sm font-medium tracking-wide">
              {steps[stepIndex]}
            </span>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-500 ${
                    i <= stepIndex ? "w-4 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-primary/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Offline button */}
      <div className="pb-12 px-6 w-full relative z-10">
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full py-4 bg-surface-container-low/50 backdrop-blur-xl rounded-xl flex items-center justify-center gap-3 tap-scale hover:bg-surface-container-high transition-all"
          style={{ border: "1px solid rgba(64,72,72,0.15)" }}
        >
          <Icon name="cloud_off" className="text-secondary" size={20} />
          <span className="text-secondary font-headline font-bold text-sm tracking-wide">
            Continuer hors-ligne
          </span>
        </button>
        <p className="text-center text-[10px] text-on-surface-variant/40 font-label uppercase tracking-widest mt-5">
          v1.0.0 · Connexion sécurisée
        </p>
      </div>
    </div>
  );
}
