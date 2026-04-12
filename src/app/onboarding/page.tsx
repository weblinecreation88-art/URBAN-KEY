"use client";

import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh flex flex-col overflow-hidden relative">

      {/* Image plein écran */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-thomas-pellow.png"
          alt="Meknès"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dégradé sombre du bas — texte lisible */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(20,10,0,0.35) 0%, rgba(20,10,0,0.55) 40%, rgba(20,10,0,0.92) 75%, rgba(20,10,0,0.98) 100%)" }} />
      </div>

      {/* Logo en haut */}
      <header className="relative z-10 pt-14 px-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#8c4b00" }}>
          <Icon name="key" className="text-white" size={18} filled />
        </div>
        <span className="font-headline font-black text-2xl text-white tracking-tight">UrbanKey</span>
      </header>

      {/* Contenu centré en bas */}
      <main className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-10">

        {/* Badge */}
        <div className="mb-5">
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ background: "rgba(140,75,0,0.5)", color: "#f5d48e", border: "1px solid rgba(245,212,142,0.25)" }}>
            Expérience Immersive
          </span>
        </div>

        {/* Titre */}
        <h1 className="font-headline font-black text-white leading-tight mb-4"
          style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}>
          Explore la ville<br />
          <span style={{ color: "#f5c96a", fontStyle: "italic" }}>comme un jeu</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-xs">
          Découvrez les secrets cachés de Meknès à travers des quêtes urbaines inédites.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/discover"
            className="w-full py-4 rounded-2xl font-headline font-bold text-white text-center flex items-center justify-center gap-2 tap-scale"
            style={{ background: "linear-gradient(135deg, #8c4b00, #c97a00)", boxShadow: "0 4px 24px rgba(140,75,0,0.4)" }}>
            Découvrir sans compte
            <Icon name="arrow_forward" size={18} />
          </Link>

          <Link href="/login"
            className="w-full py-4 rounded-2xl font-headline font-semibold text-white text-center flex items-center justify-center tap-scale"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            Se connecter / S&apos;inscrire
          </Link>
        </div>

        {/* Footer link */}
        <div className="flex justify-center mt-6">
          <button className="text-white/50 text-xs font-medium flex items-center gap-1 tap-scale">
            En savoir plus
            <Icon name="info" size={14} />
          </button>
        </div>
      </main>
    </div>
  );
}
