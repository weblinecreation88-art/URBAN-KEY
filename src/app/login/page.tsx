"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();
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

        <button
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              await loginWithGoogle();
              router.push("/discover");
            } catch {
              setError("Connexion Google annulée ou impossible.");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-headline font-semibold text-on-surface tap-scale disabled:opacity-60"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
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
