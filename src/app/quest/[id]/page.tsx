"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";

const quest = {
  id: "vieux-quartier",
  title: "Vieux Quartier — Meknès",
  subtitle: "Médina historique",
  city: "Meknès",
  duration: "90 min",
  difficulty: "Moyen",
  difficultyColor: "text-secondary bg-secondary-container",
  price: "100 MAD",
  priceNote: "Achat unique · Valide 30 jours",
  rating: 4.8,
  reviews: 124,
  description:
    "Plonge au cœur de la médina de Meknès, ville impériale et patrimoine de l'UNESCO. Résous 6 énigmes cachées dans les ruelles, souks et monuments historiques. De Bab Mansour aux jardins de l'Agdal, chaque indice te rapproche du secret final.",
  highlights: [
    "6 étapes + finale à 3 clés",
    "Patrimoine UNESCO valorisé",
    "Compatible PMR (parcours A)",
    "Disponible en FR / EN / AR",
  ],
  steps: [
    { order: 1, title: "Bab Mansour", type: "Énigme textuelle", ar: false },
    { order: 2, title: "Place El-Hedim", type: "QCM + Géofencing", ar: false },
    { order: 3, title: "Mausolée Moulay Ismail", type: "AR Marker", ar: true },
    { order: 4, title: "Souk Nejjarine", type: "Énigme visuelle", ar: false },
    { order: 5, title: "Bou Inania Médersa", type: "AR Surface", ar: true },
    { order: 6, title: "Bassin de l'Agdal", type: "Finale 3 clés", ar: false },
  ],
  reviews_list: [
    { author: "VOID_WALKER", rating: 5, text: "Expérience incroyable, immersion totale dans la médina." },
    { author: "NEON_GHOST", rating: 5, text: "Parfait pour découvrir Meknès autrement. Les énigmes sont bien dosées." },
    { author: "ECHO_REBEL", rating: 4, text: "Très bon parcours, quelques indices un peu flous sur l'étape 4." },
  ],
};

export default function QuestDetailPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-background text-on-background pb-28">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="/images/bab-mansour.jpg"
          alt={quest.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,20,34,0.5) 0%, rgba(8,20,34,0.95) 100%)" }} />

        <button
          onClick={() => router.back()}
          className="absolute top-12 left-5 w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(12px)" }}
        >
          <Icon name="arrow_back" className="text-primary" />
        </button>

        <button
          className="absolute top-12 right-5 w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(12px)" }}
        >
          <Icon name="bookmark_border" className="text-primary" />
        </button>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${quest.difficultyColor}`}>
              {quest.difficulty}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-primary bg-primary-container">
              {quest.duration}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-on-surface-variant bg-surface-container-high">
              PMR ✓
            </span>
          </div>
          <h1 className="font-headline font-black text-2xl text-on-surface tracking-tight leading-tight">{quest.title}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Icon name="location_on" className="text-primary" size={14} />
            <span className="text-primary text-xs font-medium">{quest.city}</span>
            <span className="text-on-surface-variant/50 text-xs mx-1">·</span>
            <Icon name="star" filled className="text-secondary" size={14} />
            <span className="text-secondary text-xs font-bold">{quest.rating}</span>
            <span className="text-on-surface-variant/50 text-xs">({quest.reviews} avis)</span>
          </div>
        </div>
      </div>

      <main className="px-5 space-y-6 mt-6">
        {/* Price + CTA */}
        <div className="flex items-center justify-between bg-surface-container-high rounded-xl p-4">
          <div>
            <p className="font-headline font-black text-2xl text-secondary">{quest.price}</p>
            <p className="text-on-surface-variant text-[10px] mt-0.5">{quest.priceNote}</p>
          </div>
          <Link
            href={`/checkout?quest=${quest.id}`}
            className="px-6 py-3 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale text-sm"
          >
            Acheter
          </Link>
        </div>

        {/* Description */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Description</h2>
          <p className="text-on-surface text-sm leading-relaxed">{quest.description}</p>
        </section>

        {/* Highlights */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Points clés</h2>
          <div className="grid grid-cols-2 gap-2">
            {quest.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2 bg-surface-container-high rounded-lg p-3">
                <Icon name="check_circle" filled className="text-primary mt-0.5" size={14} />
                <span className="text-on-surface text-xs leading-snug">{h}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Map preview */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Circuit</h2>
          <div className="relative rounded-xl overflow-hidden h-44">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=60"
              alt="Carte du circuit"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0" style={{ background: "rgba(8,20,34,0.4)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => router.push("/map")}
                className="flex items-center gap-2 px-4 py-2 rounded-full tap-scale"
                style={{ background: "rgba(32,43,58,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(162,207,206,0.2)" }}
              >
                <Icon name="open_in_full" className="text-primary" size={16} />
                <span className="text-on-surface text-xs font-bold">Agrandir la carte</span>
              </button>
            </div>
            {/* Step dots */}
            {[
              { left: "20%", top: "30%" },
              { left: "38%", top: "55%" },
              { left: "55%", top: "35%" },
              { left: "65%", top: "60%" },
              { left: "78%", top: "40%" },
              { left: "85%", top: "65%" },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black"
                style={{
                  left: pos.left,
                  top: pos.top,
                  background: i === 0 ? "#f0be72" : "rgba(32,43,58,0.85)",
                  border: "1px solid rgba(162,207,206,0.4)",
                  color: i === 0 ? "#081422" : "#a2cfce",
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Étapes du parcours</h2>
          <div className="space-y-2">
            {quest.steps.map((step) => (
              <div key={step.order} className="flex items-center gap-4 bg-surface-container-high rounded-xl p-3.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-headline shrink-0"
                  style={{ background: "rgba(162,207,206,0.1)", color: "#a2cfce" }}
                >
                  {step.order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface font-medium text-sm leading-tight truncate">{step.title}</p>
                  <p className="text-on-surface-variant text-[10px] mt-0.5">{step.type}</p>
                </div>
                {step.ar && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-tertiary bg-tertiary-container">
                    AR
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Avis joueurs</h2>
            <div className="flex items-center gap-1">
              <Icon name="star" filled className="text-secondary" size={14} />
              <span className="text-secondary font-bold text-sm">{quest.rating}</span>
              <span className="text-on-surface-variant text-xs">/5</span>
            </div>
          </div>
          <div className="space-y-3">
            {quest.reviews_list.map((r) => (
              <div key={r.author} className="bg-surface-container-high rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-headline font-bold text-xs text-on-surface tracking-tight">{r.author}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon
                        key={i}
                        name="star"
                        filled={i < r.rating}
                        className={i < r.rating ? "text-secondary" : "text-on-surface-variant/30"}
                        size={12}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, rgba(8,20,34,1) 60%, transparent)" }}
      >
        <Link
          href={`/checkout?quest=${quest.id}`}
          className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale flex items-center justify-center gap-2"
        >
          <Icon name="shopping_cart" size={20} />
          Acheter ce parcours — {quest.price}
        </Link>
      </div>
    </div>
  );
}
