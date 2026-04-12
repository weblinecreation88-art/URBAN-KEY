"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cgu, setCgu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email || !password) { setError("Email et mot de passe requis."); return; }
    if (mode === "register" && (!firstName || !lastName)) { setError("Prénom et nom requis."); return; }
    if (mode === "register" && !cgu) { setError("Veuillez accepter les CGU."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
      router.push("/discover");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Email ou mot de passe incorrect.");
      } else if (code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé.");
      } else if (code === "auth/weak-password") {
        setError("Mot de passe trop court (6 caractères min).");
      } else {
        setError("Une erreur est survenue. Réessaye.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col justify-center px-6 py-12 relative">
      {/* Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Back */}
      <button onClick={() => router.back()} className="absolute top-12 left-6 tap-scale text-primary flex items-center gap-1">
        <Icon name="arrow_back" size={20} />
        <span className="text-sm font-medium">Retour</span>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 mt-8">
        <Icon name="explore" filled className="text-primary" size={28} />
        <h1 className="font-headline font-black text-2xl text-primary tracking-tighter">UrbanKey</h1>
      </div>

      {/* Tab toggle */}
      <div className="flex p-1 bg-surface-container-low rounded-xl mb-8 gap-1">
        <button
          onClick={() => { setMode("login"); setError(""); }}
          className={`flex-1 py-3 rounded-lg font-headline font-bold text-sm tap-scale transition-all ${
            mode === "login" ? "bg-surface-container-highest text-secondary" : "text-on-surface-variant"
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => { setMode("register"); setError(""); }}
          className={`flex-1 py-3 rounded-lg font-headline font-bold text-sm tap-scale transition-all ${
            mode === "register" ? "bg-surface-container-highest text-secondary" : "text-on-surface-variant"
          }`}
        >
          Inscription
        </button>
      </div>

      <div className="space-y-4">
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 block">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Yasmine"
                className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 block">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Alaoui"
                className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 block">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-surface-container-low rounded-lg px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40"
          />
        </div>

        {mode === "login" && (
          <div className="flex justify-end">
            <button className="text-secondary text-xs font-medium tap-scale">Mot de passe oublié ?</button>
          </div>
        )}

        {mode === "register" && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cgu}
              onChange={() => setCgu(!cgu)}
              className="mt-0.5 accent-secondary"
            />
            <span className="text-on-surface-variant text-xs leading-relaxed">
              J&apos;accepte les{" "}
              <span className="text-secondary underline">CGU</span> et la{" "}
              <span className="text-secondary underline">politique de confidentialité</span>
            </span>
          </label>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 rounded-lg px-4 py-3">
            <Icon name="error" className="text-error shrink-0" size={16} />
            <p className="text-error text-xs">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Icon name="progress_activity" size={18} className="animate-spin" />}
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="text-on-surface-variant/50 text-xs">ou</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        <Link href="/discover" className="w-full py-4 rounded-xl flex items-center justify-center font-headline font-semibold text-on-surface tap-scale"
          style={{ background: "rgba(236,224,202,0.8)", border: "1px solid rgba(140,122,90,0.2)" }}
        >
          Continuer sans compte
        </Link>
      </div>
    </div>
  );
}
