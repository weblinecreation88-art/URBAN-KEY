"use client";

import Link from "next/link";
import Icon from "@/components/Icon";

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh flex flex-col overflow-hidden bg-background relative">
      {/* Ambient glows */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="pt-12 px-8 flex flex-col items-center z-10">
        <div className="flex items-center gap-2">
          <Icon name="explore" filled className="text-primary text-4xl" size={36} />
          <h1 className="font-headline font-black text-4xl text-primary tracking-tighter">
            UrbanKey
          </h1>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center relative w-full px-6">
        {/* Background city image */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-60"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80')",
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>

        {/* Content card */}
        <div className="relative z-10 w-full max-w-md mt-auto mb-12 flex flex-col items-center text-center">
          <div
            className="inline-block px-4 py-1 mb-6 rounded-full backdrop-blur-md"
            style={{
              background: "rgba(103,69,0,0.3)",
              border: "1px solid rgba(240,190,114,0.2)",
            }}
          >
            <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">
              Expérience Immersive
            </span>
          </div>

          <h2 className="font-headline text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-4">
            Explore la ville <br />
            <span className="text-primary italic">comme un jeu</span>
          </h2>

          <p className="text-on-surface-variant text-base max-w-[280px] mb-12 leading-relaxed">
            Découvrez les secrets cachés de Meknès à travers des quêtes urbaines inédites.
          </p>

          {/* CTAs */}
          <div className="w-full space-y-4">
            <Link
              href="/discover"
              className="cta-gradient w-full py-5 rounded-xl font-headline font-bold text-on-primary-fixed shadow-2xl flex items-center justify-center gap-2 tap-scale"
            >
              Découvrir sans compte
              <Icon name="arrow_forward" className="text-lg" size={20} />
            </Link>

            <Link
              href="/login"
              className="w-full py-5 rounded-xl font-headline font-semibold text-on-surface tap-scale flex items-center justify-center"
              style={{
                background: "rgba(42,53,69,0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(64,72,72,0.15)",
              }}
            >
              Se connecter / S&apos;inscrire
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-10 pt-4 px-8 flex justify-center z-10">
        <button className="text-secondary font-label text-sm font-medium flex items-center gap-1 tap-scale">
          En savoir plus
          <Icon name="info" size={16} />
        </button>
      </footer>
    </div>
  );
}
