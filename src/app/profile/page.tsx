"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot, updateDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";

interface UserProfile {
  displayName: string;
  email: string;
  xp: number;
  level: number;
  avatarUrl?: string;
  lang?: string;
  tts?: boolean;
  contrast?: boolean;
  fontSize?: number;
}

interface Purchase {
  questId: string;
  questTitle: string;
  amount: number;
  status: string;
  purchasedAt?: { seconds: number };
  score?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [lang, setLang] = useState("FR");
  const [tts, setTts] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontSize, setFontSize] = useState(50);
  const [uploading, setUploading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Real-time Firestore profile
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        // Sync preferences
        if (data.lang) setLang(data.lang);
        if (data.tts !== undefined) setTts(data.tts);
        if (data.contrast !== undefined) setContrast(data.contrast);
        if (data.fontSize !== undefined) setFontSize(data.fontSize);
      } else {
        setProfile({
          displayName: user.displayName ?? user.email ?? "Joueur",
          email: user.email ?? "",
          xp: 0,
          level: 1,
        });
      }
    });
    return unsub;
  }, [user]);

  // Load purchases sub-collection
  useEffect(() => {
    if (!user) return;
    async function loadPurchases() {
      const q = query(collection(db, "users", user!.uid, "purchases"), orderBy("purchasedAt", "desc"));
      const snap = await getDocs(q).catch(() => null);
      if (snap) setPurchases(snap.docs.map(d => ({ questId: d.id, ...d.data() } as Purchase)));
    }
    loadPurchases();
  }, [user]);

  // Apply contrast to DOM
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [contrast]);

  // Apply font size to root
  useEffect(() => {
    const size = 14 + Math.round((fontSize / 100) * 6); // 14px → 20px
    document.documentElement.style.fontSize = `${size}px`;
  }, [fontSize]);

  async function savePrefs(updates: Partial<UserProfile>) {
    if (!user) return;
    setSavingPrefs(true);
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleLang(l: string) {
    setLang(l);
    await savePrefs({ lang: l });
  }

  async function handleTts(val: boolean) {
    setTts(val);
    await savePrefs({ tts: val });
    if (val) {
      // Test TTS
      if ("speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance("Lecture audio activée pour UrbanKey.");
        utt.lang = lang === "AR" ? "ar-MA" : lang === "EN" ? "en-US" : "fr-FR";
        speechRef.current = utt;
        window.speechSynthesis.speak(utt);
      }
    } else {
      window.speechSynthesis?.cancel();
    }
  }

  async function handleContrast(val: boolean) {
    setContrast(val);
    await savePrefs({ contrast: val });
  }

  async function handleFontSize(val: number) {
    setFontSize(val);
    await savePrefs({ fontSize: val });
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), { avatarUrl: url });
    } catch (err) {
      console.error("Upload avatar:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.error("Reset password:", err);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/onboarding");
  }

  const displayName = profile?.displayName ?? user?.displayName ?? user?.email ?? "Joueur";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpToNext = level * 2000;
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));

  const formatDate = (p: Purchase) => {
    if (!p.purchasedAt?.seconds) return "—";
    return new Date(p.purchasedAt.seconds * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusColor: Record<string, { bg: string; color: string }> = {
    completed: { bg: "rgba(41,103,103,0.12)", color: "#296767" },
    active:    { bg: "rgba(140,75,0,0.1)",    color: "#8c4b00" },
    pending:   { bg: "rgba(201,122,0,0.1)",   color: "#c97a00" },
  };

  const statusLabel: Record<string, string> = {
    completed: "Terminé", active: "En cours", pending: "Non démarré",
  };

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
        <h1 className="font-headline font-bold text-xl text-primary">Mon Profil</h1>
        {savingPrefs && <Icon name="progress_activity" className="text-secondary animate-spin" size={18} />}
      </header>

      <main className="px-5 space-y-5 pt-4">

        {/* Carte profil */}
        <section className="parchment-card rounded-2xl p-5 flex items-center gap-4">
          <div className="relative">
            <button onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden relative group"
              style={{ background: "rgba(140,75,0,0.1)", border: "2px solid rgba(140,75,0,0.3)" }}>
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <Icon name="person" filled className="text-primary" size={32} />}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.4)" }}>
                {uploading
                  ? <Icon name="progress_activity" className="text-white animate-spin" size={20} />
                  : <Icon name="photo_camera" className="text-white" size={20} />}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline font-bold text-lg text-on-surface truncate">{displayName}</h2>
            <p className="text-on-surface-variant text-xs truncate">{user?.email ?? ""}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{ background: "rgba(140,75,0,0.1)", color: "#8c4b00" }}>
                Niveau {level}
              </span>
              <span className="text-[10px] text-on-surface-variant">{xp.toLocaleString()} XP</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(140,122,90,0.15)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${xpPercent}%`, background: "linear-gradient(90deg,#8c4b00,#c97a00)" }} />
            </div>
          </div>
        </section>

        {/* Mes parcours */}
        <section>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Mes parcours</p>
          {purchases.length === 0 ? (
            <div className="parchment-card rounded-2xl p-8 text-center">
              <Icon name="explore_off" className="text-on-surface-variant mx-auto mb-2" size={32} />
              <p className="text-on-surface-variant text-sm">Aucun parcours acheté.</p>
              <button onClick={() => router.push("/discover")}
                className="mt-3 px-4 py-2 rounded-xl cta-gradient text-white text-xs font-bold tap-scale">
                Découvrir les parcours
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => {
                const s = statusColor[p.status] ?? statusColor.pending;
                return (
                  <div key={p.questId} className="parchment-card rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-sm truncate">{p.questTitle}</p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">
                        {formatDate(p)}{p.score ? ` · ${p.score} pts` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.color }}>
                        {statusLabel[p.status] ?? p.status}
                      </span>
                      {p.amount > 0 && <span className="text-[10px] text-on-surface-variant">{p.amount} MAD</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Préférences */}
        <section>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Préférences</p>
          <div className="parchment-card rounded-2xl overflow-hidden divide-y" style={{ "--tw-divide-color": "rgba(140,122,90,0.1)" } as React.CSSProperties}>

            {/* Langue */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="language" className="text-primary" size={20} />
                <span className="text-on-surface text-sm font-medium">Langue</span>
              </div>
              <div className="flex gap-1.5">
                {["FR", "EN", "AR"].map((l) => (
                  <button key={l} onClick={() => handleLang(l)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold tap-scale"
                    style={{
                      background: lang === l ? "#8c4b00" : "rgba(140,122,90,0.1)",
                      color: lang === l ? "#fff" : "#5c3d1e",
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* TTS */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="record_voice_over" className="text-primary" size={20} />
                <div>
                  <p className="text-on-surface text-sm font-medium">Lecture audio (TTS)</p>
                  <p className="text-on-surface-variant text-[10px]">Énigmes lues à voix haute</p>
                </div>
              </div>
              <button onClick={() => handleTts(!tts)}
                className="w-12 h-6 rounded-full relative transition-all"
                style={{ background: tts ? "#8c4b00" : "rgba(140,122,90,0.2)" }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: tts ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>

            {/* Contraste */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="contrast" className="text-primary" size={20} />
                <div>
                  <p className="text-on-surface text-sm font-medium">Contraste élevé</p>
                  <p className="text-on-surface-variant text-[10px]">Accessibilité visuelle</p>
                </div>
              </div>
              <button onClick={() => handleContrast(!contrast)}
                className="w-12 h-6 rounded-full relative transition-all"
                style={{ background: contrast ? "#8c4b00" : "rgba(140,122,90,0.2)" }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: contrast ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>

            {/* Taille police */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="text_fields" className="text-primary" size={20} />
                <p className="text-on-surface text-sm font-medium">Taille de police</p>
                <span className="ml-auto text-xs font-bold text-secondary">
                  {fontSize < 33 ? "Petite" : fontSize < 66 ? "Moyenne" : "Grande"}
                </span>
              </div>
              <input type="range" min={0} max={100} value={fontSize}
                onChange={(e) => handleFontSize(Number(e.target.value))}
                className="w-full" style={{ accentColor: "#8c4b00" }} />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                <span>A</span><span className="text-sm">A</span><span className="text-base font-bold">A</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sécurité & Support */}
        <section>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Compte & Support</p>
          <div className="parchment-card rounded-2xl overflow-hidden divide-y" style={{ "--tw-divide-color": "rgba(140,122,90,0.1)" } as React.CSSProperties}>

            {/* Reset password */}
            {user && (
              <button onClick={handlePasswordReset}
                className="w-full p-4 flex items-center gap-3 tap-scale text-left">
                <Icon name="lock_reset" className="text-primary" size={20} />
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-medium">Changer le mot de passe</p>
                  {resetSent && <p className="text-secondary text-[11px] mt-0.5">Email envoyé à {user.email}</p>}
                </div>
                <Icon name="chevron_right" className="text-on-surface-variant" size={18} />
              </button>
            )}

            {/* Support */}
            <button onClick={() => router.push("/support")}
              className="w-full p-4 flex items-center gap-3 tap-scale">
              <Icon name="help" className="text-primary" size={20} />
              <span className="text-on-surface text-sm font-medium flex-1">Support & FAQ</span>
              <Icon name="chevron_right" className="text-on-surface-variant" size={18} />
            </button>

            {/* CGU */}
            <button className="w-full p-4 flex items-center gap-3 tap-scale">
              <Icon name="gavel" className="text-primary" size={20} />
              <span className="text-on-surface text-sm font-medium flex-1">CGU & Confidentialité</span>
              <Icon name="chevron_right" className="text-on-surface-variant" size={18} />
            </button>

            {/* Déconnexion / Connexion */}
            {user ? (
              <button onClick={handleLogout}
                className="w-full p-4 flex items-center gap-3 tap-scale">
                <Icon name="logout" className="text-error" size={20} />
                <span className="text-error text-sm font-medium">Se déconnecter</span>
              </button>
            ) : (
              <button onClick={() => router.push("/login")}
                className="w-full p-4 flex items-center gap-3 tap-scale">
                <Icon name="login" className="text-primary" size={20} />
                <span className="text-on-surface text-sm font-medium">Se connecter</span>
              </button>
            )}
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}
