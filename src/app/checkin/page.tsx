"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { PARCOURS_MEKNES } from "@/data/parcours";
import Icon from "@/components/Icon";

// Supported token format: `uk-{questId}-{userId?}` or just `uk-{questId}`
// OTA deep link: /checkin?token=uk-meknes-imperial&source=airbnb
function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const token = searchParams.get("token") ?? "";
  const source = searchParams.get("source") ?? "direct";

  const [status, setStatus] = useState<"scanning" | "validating" | "success" | "error">("scanning");
  const [errorMsg, setErrorMsg] = useState("");
  const [questTitle, setQuestTitle] = useState("");

  useEffect(() => {
    if (!token) return;
    validate(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function validate(tok: string) {
    setStatus("validating");
    try {
      // Token format: uk-{questId} or uk-{questId}-{userId}
      const parts = tok.replace(/^uk-/, "").split("-");
      const questId = parts.slice(0, -1).join("-") || parts[0];

      // Find quest in static data first
      const quest = PARCOURS_MEKNES.id === questId ? PARCOURS_MEKNES : null;
      if (!quest) {
        setErrorMsg("QR code invalide ou parcours introuvable.");
        setStatus("error");
        return;
      }
      setQuestTitle(quest.title);

      // If user is logged in, mark purchase as active in Firestore
      if (user) {
        const purchaseRef = doc(db, "users", user.uid, "purchases", questId);
        const snap = await getDoc(purchaseRef);
        if (!snap.exists()) {
          // Auto-grant for OTA check-in (trust token from platform)
          await updateDoc(purchaseRef, {
            status: "active",
            startedAt: serverTimestamp(),
            checkInSource: source,
          }).catch(async () => {
            // doc doesn't exist — set it
            const { setDoc } = await import("firebase/firestore");
            await setDoc(purchaseRef, {
              questId,
              questTitle: quest.title,
              status: "active",
              purchasedAt: serverTimestamp(),
              startedAt: serverTimestamp(),
              checkInSource: source,
              amount: quest.price,
            });
          });
        } else {
          await updateDoc(purchaseRef, {
            lastCheckin: serverTimestamp(),
            checkInSource: source,
          });
        }
      }

      setStatus("success");
    } catch {
      setErrorMsg("Erreur lors de la validation. Réessayez.");
      setStatus("error");
    }
  }

  if (status === "scanning" && !token) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(140,75,0,0.1)" }}>
          <Icon name="qr_code_scanner" className="text-primary" size={40} />
        </div>
        <div className="text-center">
          <h1 className="font-headline font-bold text-2xl text-primary mb-2">Scan Check-in</h1>
          <p className="text-on-surface-variant text-sm">Scannez le QR code fourni par votre opérateur (Airbnb / GetYourGuide) pour démarrer votre parcours.</p>
        </div>
        <div className="parchment-card rounded-2xl p-5 w-full max-w-sm text-center">
          <p className="text-on-surface-variant text-xs">Aucun token détecté dans l&apos;URL.</p>
          <p className="text-on-surface-variant text-xs mt-1">Format attendu : <code className="bg-surface-container-high px-1 rounded">?token=uk-meknes-imperial</code></p>
        </div>
        <button onClick={() => router.push("/discover")}
          className="text-primary text-sm font-medium tap-scale">
          Voir les parcours disponibles
        </button>
      </div>
    );
  }

  if (status === "validating") {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-4">
        <Icon name="progress_activity" className="text-primary animate-spin" size={40} />
        <p className="text-on-surface font-medium">Validation en cours…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(186,26,26,0.08)" }}>
          <Icon name="error" className="text-error" size={40} />
        </div>
        <div>
          <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Échec de la validation</h2>
          <p className="text-on-surface-variant text-sm">{errorMsg}</p>
        </div>
        <button onClick={() => router.push("/discover")}
          className="px-6 py-3 rounded-xl cta-gradient font-bold text-white tap-scale">
          Voir les parcours
        </button>
      </div>
    );
  }

  // Success
  const firstStep = PARCOURS_MEKNES.steps.find(s => !s.isBonus && s.order === 1);
  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 gap-6 text-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center glow-primary" style={{ background: "rgba(140,75,0,0.1)" }}>
        <Icon name="check_circle" filled className="text-primary" size={56} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Check-in validé</p>
        <h2 className="font-headline font-bold text-2xl text-on-surface">Bienvenue !</h2>
        <p className="text-on-surface-variant text-sm mt-2">{questTitle}</p>
        {source !== "direct" && (
          <p className="text-[11px] text-on-surface-variant mt-1 capitalize">Via {source}</p>
        )}
      </div>

      {!user && (
        <div className="parchment-card rounded-2xl p-4 w-full max-w-sm text-left">
          <p className="text-on-surface font-bold text-sm mb-1">Créez un compte pour sauvegarder votre progression</p>
          <p className="text-on-surface-variant text-xs">Vous pouvez aussi jouer sans compte, mais votre score ne sera pas enregistré.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => router.push(`/enigma/${firstStep?.id ?? "bab-mansour"}`)}
          className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
        >
          <Icon name="explore" size={18} />
          Démarrer le parcours
        </button>
        {!user && (
          <button onClick={() => router.push("/login")}
            className="w-full py-3 rounded-xl font-bold text-primary text-sm tap-scale"
            style={{ background: "rgba(140,75,0,0.08)" }}>
            Créer un compte
          </button>
        )}
        <button onClick={() => router.push("/map")}
          className="text-secondary text-sm font-medium tap-scale">
          Voir la carte du parcours
        </button>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
      </div>
    }>
      <CheckInContent />
    </Suspense>
  );
}
