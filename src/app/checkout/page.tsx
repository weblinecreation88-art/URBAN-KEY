"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PARCOURS_MEKNES } from "@/data/parcours";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ----- Stripe payment form -----
function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Erreur de paiement.");
      setLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="parchment-card rounded-2xl p-5">
        <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-4">Informations de paiement</p>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Icon name="error" className="text-error shrink-0" size={16} />
          <p className="text-error text-xs">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Icon name="progress_activity" size={18} className="animate-spin" />}
        {loading ? "Paiement en cours…" : "Confirmer le paiement"}
      </button>
    </form>
  );
}

// ----- Main checkout page -----
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questId = searchParams.get("quest") ?? PARCOURS_MEKNES.id;

  const [step, setStep] = useState<"recap" | "payment" | "success">("recap");
  const [clientSecret, setClientSecret] = useState("");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const quest = PARCOURS_MEKNES;
  const basePrice = quest.price;
  const discount = promoApplied ? Math.round(basePrice * 0.1) : 0;
  const total = basePrice - discount;

  async function initPayment() {
    setLoadingIntent(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, questTitle: quest.title, amount: total, currency: "mad" }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep("payment");
      } else {
        // Stripe non configuré — mode démo
        setStep("payment");
      }
    } catch {
      setStep("payment"); // démo si pas de Stripe
    } finally {
      setLoadingIntent(false);
    }
  }

  function applyPromo() {
    if (promoCode.toUpperCase() === "MEKNES10") setPromoApplied(true);
  }

  if (step === "success") {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center glow-primary" style={{ background: "rgba(140,75,0,0.1)" }}>
          <Icon name="check_circle" filled className="text-primary" size={56} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Paiement réussi</p>
          <h2 className="font-headline font-bold text-2xl text-on-surface">Parcours débloqué !</h2>
          <p className="text-on-surface-variant text-sm mt-2">{quest.title}</p>
        </div>
        <button
          onClick={() => router.push(`/enigma/${PARCOURS_MEKNES.steps.find(s => !s.isBonus)?.id ?? "bab-mansour"}`)}
          className="w-full max-w-sm py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
        >
          <Icon name="explore" size={18} />
          Démarrer maintenant
        </button>
        <button onClick={() => router.push("/profile")} className="text-primary text-sm font-medium tap-scale">
          Voir mes parcours
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 px-5 py-4"
        style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.15)" }}
      >
        <button onClick={() => step === "payment" ? setStep("recap") : router.back()} className="tap-scale w-8 h-8 flex items-center justify-center">
          <Icon name="arrow_back" className="text-primary" />
        </button>
        <div>
          <h1 className="font-headline font-bold text-primary text-base leading-tight">Paiement</h1>
          <p className="text-on-surface-variant text-[10px]">Étape {step === "recap" ? "1" : "2"} / 2</p>
        </div>
      </header>

      {/* Progress steps */}
      <div className="flex items-center px-5 py-3 gap-2">
        {["Récapitulatif", "Paiement"].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              (step === "recap" && i === 0) || (step === "payment" && i <= 1)
                ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
            }`}>{i + 1}</div>
            <span className={`text-xs font-medium ${(step === "recap" && i === 0) || (step === "payment" && i <= 1) ? "text-primary" : "text-on-surface-variant"}`}>{s}</span>
            {i < 1 && <div className="flex-1 h-px bg-outline-variant/30" />}
          </div>
        ))}
      </div>

      <main className="px-5 space-y-5 mt-2">
        {/* Récap commande */}
        {step === "recap" && (
          <>
            <section className="parchment-card rounded-2xl overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <img src="/images/bab-mansour.jpg" alt={quest.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                <div className="absolute bottom-3 left-4">
                  <p className="text-white font-headline font-bold text-base leading-tight drop-shadow">{quest.title}</p>
                  <p className="text-white/70 text-[11px]">{quest.city} · {quest.duration} · {quest.difficulty}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">Prix</span>
                  <span className="text-on-surface font-bold">{basePrice} MAD</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between items-center">
                    <span className="text-secondary text-sm">Promo MEKNES10 (-10%)</span>
                    <span className="text-secondary font-bold">-{discount} MAD</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid rgba(140,122,90,0.2)" }}>
                  <span className="text-on-surface font-headline font-bold">Total</span>
                  <span className="text-primary font-headline font-black text-xl">{total} MAD</span>
                </div>
              </div>
            </section>

            {/* Code promo */}
            <section className="parchment-card rounded-2xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Code promo</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ex : MEKNES10"
                  className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40"
                />
                <button
                  onClick={applyPromo}
                  disabled={promoApplied}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm tap-scale disabled:opacity-50"
                >
                  {promoApplied ? "✓" : "Appliquer"}
                </button>
              </div>
              {promoApplied && <p className="text-secondary text-xs mt-2 font-medium">Code appliqué — -10% sur votre commande !</p>}
            </section>

            {/* Modes de paiement */}
            <section className="parchment-card rounded-2xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Mode de paiement</p>
              <div className="flex gap-2 flex-wrap">
                {["Carte bancaire", "Apple Pay", "Google Pay"].map((m) => (
                  <div key={m} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container text-on-surface text-xs font-medium" style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
                    <Icon name={m === "Carte bancaire" ? "credit_card" : m === "Apple Pay" ? "smartphone" : "payments"} size={13} className="text-primary" />
                    {m}
                  </div>
                ))}
              </div>
            </section>

            {/* Garanties */}
            <section className="flex flex-col gap-2">
              {[
                { icon: "lock", text: "Paiement sécurisé — 3D Secure" },
                { icon: "calendar_today", text: "Valide 30 jours après achat" },
                { icon: "support_agent", text: "Support disponible 7j/7" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon name={icon} className="text-secondary" size={16} />
                  <span className="text-on-surface-variant text-xs">{text}</span>
                </div>
              ))}
            </section>

            <button
              onClick={initPayment}
              disabled={loadingIntent}
              className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingIntent && <Icon name="progress_activity" size={18} className="animate-spin" />}
              Procéder au paiement — {total} MAD
            </button>
          </>
        )}

        {/* Stripe payment */}
        {step === "payment" && (
          <>
            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "flat", variables: { colorPrimary: "#8c4b00", colorBackground: "#fff9ed", colorText: "#2c1a00", borderRadius: "12px" } } }}>
                <PaymentForm onSuccess={() => setStep("success")} />
              </Elements>
            ) : (
              // Mode démo si Stripe non configuré
              <div className="space-y-5">
                <div className="parchment-card rounded-2xl p-5 text-center">
                  <Icon name="credit_card" className="text-primary mb-3" size={32} />
                  <p className="font-headline font-bold text-on-surface mb-1">Mode démonstration</p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Configurez <code className="bg-surface-container-high px-1 rounded">STRIPE_SECRET_KEY</code> dans <code className="bg-surface-container-high px-1 rounded">.env.local</code> pour activer le paiement réel.
                  </p>
                </div>
                <button
                  onClick={() => setStep("success")}
                  className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale"
                >
                  Simuler un paiement réussi
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
