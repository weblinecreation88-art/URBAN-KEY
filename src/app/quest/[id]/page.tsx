"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/Icon";
import { PARCOURS_MEKNES, MAIN_STEPS } from "@/data/parcours";
import { useAuth } from "@/context/AuthContext";

const HERO_IMAGE = "https://res.cloudinary.com/db2ljqpdt/image/upload/v1776024577/e2df93b4-1115-4922-b854-4870a826e92a_kdc11h.png";

const REVIEWS = [
  { author: "Ahmed B.", rating: 5, text: "Expérience incroyable ! Les énigmes sont bien dosées et les lieux choisis magnifiques.", date: "Mars 2026" },
  { author: "Sara L.", rating: 5, text: "Parfait pour découvrir Meknès autrement. On a adoré le défi au Mausolée.", date: "Fév. 2026" },
  { author: "Karim M.", rating: 4, text: "Super concept, quelques QR codes difficiles à trouver mais très immersif.", date: "Jan. 2026" },
];

export default function QuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params); // id used in future multi-quest lookup
  const router = useRouter();
  const { user, hasPurchased } = useAuth();
  const [activeTab, setActiveTab] = useState<"desc" | "steps" | "avis">("desc");
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    if (user) hasPurchased(PARCOURS_MEKNES.id).then(setPurchased);
    else setPurchased(false);
  }, [user, hasPurchased]);

  // Use real data if ID matches, otherwise show Meknès by default
  const quest = PARCOURS_MEKNES;
  const mainSteps = MAIN_STEPS;

  const difficultyColor = {
    Facile: { bg: "rgba(41,103,103,0.12)", color: "#296767" },
    Moyen: { bg: "rgba(140,75,0,0.1)", color: "#8c4b00" },
    Difficile: { bg: "rgba(186,26,26,0.08)", color: "#ba1a1a" },
  }[quest.difficulty] ?? { bg: "rgba(140,75,0,0.1)", color: "#8c4b00" };

  return (
    <div className="min-h-dvh bg-background pb-32">
      {/* Hero */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image src={HERO_IMAGE} alt={quest.title} fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(44,26,0,0.3) 0%, rgba(44,26,0,0.85) 100%)" }} />

        {/* Back button */}
        <button onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(255,249,237,0.15)", backdropFilter: "blur(8px)" }}>
          <Icon name="arrow_back" className="text-white" size={20} />
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
              style={{ background: difficultyColor.bg, color: difficultyColor.color, backdropFilter: "blur(4px)" }}>
              {quest.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wide"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              <Icon name="schedule" size={10} className="inline mr-1" />{quest.duration}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wide"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              <Icon name="route" size={10} className="inline mr-1" />{mainSteps.length} étapes
            </span>
          </div>
          <h1 className="font-headline font-black text-2xl text-white leading-tight">{quest.title}</h1>
          <p className="text-white/70 text-sm mt-1">
            <Icon name="location_on" size={12} className="inline mr-1" />{quest.city}
          </p>
        </div>
      </div>

      {/* Price + rating bar */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
        <div>
          <p className="font-headline font-black text-2xl text-primary">{quest.price} <span className="text-base font-bold">{quest.currency}</span></p>
          <p className="text-on-surface-variant text-[10px]">Achat unique · Valide 30 jours</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="star" filled style={{ color: "#c97a00" }} size={18} />
          <span className="font-headline font-bold text-on-surface text-base">4.8</span>
          <span className="text-on-surface-variant text-xs">({REVIEWS.length} avis)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 pt-4 gap-1 mb-1">
        {(["desc", "steps", "avis"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all tap-scale"
            style={{
              background: activeTab === t ? "#8c4b00" : "rgba(140,122,90,0.1)",
              color: activeTab === t ? "#fff" : "#5c3d1e",
            }}>
            {{ desc: "Description", steps: "Étapes", avis: "Avis" }[t]}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Description tab */}
        {activeTab === "desc" && (
          <>
            <div className="parchment-card rounded-2xl p-5">
              <p className="text-on-surface text-sm leading-relaxed">
                Plonge au cœur de la Cité Impériale de Meknès, inscrite au patrimoine mondial de l&apos;UNESCO.
                Résous {mainSteps.length} énigmes cachées dans les monuments historiques les plus emblématiques.
                De Bab Mansour au Mausolée de Moulay Ismaïl, chaque indice révèle un fragment du passé impérial.
              </p>
            </div>

            <div className="parchment-card rounded-2xl p-5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Points clés</p>
              {[
                { icon: "route", text: `${mainSteps.length} étapes principales + bonus` },
                { icon: "history_edu", text: "Patrimoine UNESCO valorisé" },
                { icon: "accessible", text: "Compatible PMR (parcours A)" },
                { icon: "language", text: "Disponible en FR / EN / AR" },
                { icon: "qr_code", text: "QR codes physiques + géofencing auto" },
                { icon: "timer", text: `Durée estimée : ${quest.duration}` },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(140,122,90,0.08)" }}>
                  <Icon name={icon} className="text-secondary shrink-0" size={16} />
                  <span className="text-on-surface text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Mini carte Google Maps Static */}
            <div className="parchment-card rounded-2xl overflow-hidden">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Circuit</p>
                <button onClick={() => router.push("/map")}
                  className="text-xs font-bold text-secondary flex items-center gap-1 tap-scale">
                  Agrandir <Icon name="open_in_full" size={12} />
                </button>
              </div>
              <div className="mx-5 mb-5 rounded-xl overflow-hidden relative" style={{ height: 180 }}>
                <img
                  src="https://res.cloudinary.com/dzntnjtkc/image/upload/v1776030377/Capture_d_%C3%A9cran_2026-04-12_224452_bareb0.png"
                  alt="Circuit parcours"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => router.push("/map")}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tap-scale"
                  style={{ background: "rgba(255,249,237,0.95)", color: "#8c4b00", backdropFilter: "blur(8px)" }}>
                  <Icon name="open_in_full" size={13} />
                  Carte interactive
                </button>
              </div>
            </div>
          </>
        )}

        {/* Steps tab */}
        {activeTab === "steps" && (
          <div className="space-y-2">
            {mainSteps.map((step, i) => (
              <div key={step.id} className="parchment-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: "#8c4b00" }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{step.title}</p>
                  <p className="text-on-surface-variant text-[10px] truncate">{step.lieu} · {step.type}</p>
                </div>
                <span className="text-[10px] font-bold text-secondary shrink-0">{step.scoreBase} pts</span>
              </div>
            ))}
            <div className="parchment-card rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ opacity: 0.6 }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(140,122,90,0.2)" }}>
                <Icon name="emoji_events" className="text-on-surface-variant" size={16} />
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Finale — Collecte des clés</p>
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "avis" && (
          <div className="space-y-3">
            {/* Global rating */}
            <div className="parchment-card rounded-2xl p-5 flex items-center gap-5">
              <div className="text-center">
                <p className="font-headline font-black text-4xl text-primary">4.8</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[1,2,3,4,5].map(i => (
                    <Icon key={i} name="star" filled size={14} style={{ color: "#c97a00" }} />
                  ))}
                </div>
                <p className="text-on-surface-variant text-[10px] mt-1">{REVIEWS.length} avis</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-[10px] text-on-surface-variant w-2">{s}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(140,122,90,0.15)" }}>
                      <div className="h-full rounded-full" style={{
                        width: s === 5 ? "75%" : s === 4 ? "20%" : "5%",
                        background: s >= 4 ? "#8c4b00" : "rgba(140,122,90,0.4)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {REVIEWS.map(r => (
              <div key={r.author} className="parchment-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: "#8c4b00" }}>
                      {r.author.slice(0, 1)}
                    </div>
                    <p className="font-bold text-on-surface text-sm">{r.author}</p>
                  </div>
                  <p className="text-on-surface-variant text-[10px]">{r.date}</p>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(r.rating)].map((_, i) => (
                    <Icon key={i} name="star" filled size={12} style={{ color: "#c97a00" }} />
                  ))}
                </div>
                <p className="text-on-surface text-sm leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 max-w-lg mx-auto"
        style={{ background: "rgba(255,249,237,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(140,122,90,0.2)" }}>
        {!user ? (
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2">
            <Icon name="login" size={18} />
            Se connecter pour jouer
          </button>
        ) : purchased ? (
          <button
            onClick={() => router.push(`/enigma/${PARCOURS_MEKNES.steps.find(s => !s.isBonus)?.id ?? "bab-mansour"}`)}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2">
            <Icon name="explore" size={18} />
            Démarrer le parcours
          </button>
        ) : (
          <button
            onClick={() => router.push(`/checkout?quest=${quest.id}`)}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2">
            <Icon name="shopping_cart" size={18} />
            Acheter — {quest.price} {quest.currency}
          </button>
        )}
        <p className="text-center text-on-surface-variant text-[10px] mt-2">
          {purchased ? "Parcours débloqué · Bonne aventure !" : "Achat unique · Valide 30 jours · Satisfait ou remboursé"}
        </p>
      </div>
    </div>
  );
}
