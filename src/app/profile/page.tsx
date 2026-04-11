"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface UserProfile {
  displayName: string;
  email: string;
  xp: number;
  level: number;
  avatarUrl?: string;
}

interface Purchase {
  date: string;
  name: string;
  amount: string;
  status: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore profile
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        // Fallback from Firebase Auth
        setProfile({
          displayName: user.displayName ?? user.email ?? "Joueur",
          email: user.email ?? "",
          xp: 0,
          level: 1,
        });
      }
    });

    // Load purchases sub-collection
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPurchases(data.purchases ?? []);
      }
    });

    return unsub;
  }, [user]);

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

  async function handleLogout() {
    await logout();
    router.push("/onboarding");
  }

  const displayName = profile?.displayName ?? user?.displayName ?? user?.email ?? "Joueur";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpToNext = level * 2000;
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      <header className="sticky top-0 z-50 bg-background flex items-center justify-between px-6 h-16">
        <h1 className="font-headline font-bold text-xl text-primary">Mon Profil</h1>
        <button className="tap-scale text-primary p-1">
          <Icon name="settings" size={22} />
        </button>
      </header>

      <main className="px-5 space-y-6">
        {/* Profile card */}
        <section className="bg-surface-container-high rounded-xl p-6 flex items-center gap-5">
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center ring-2 ring-secondary/40 overflow-hidden relative group"
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Icon name="person" filled className="text-secondary" size={32} />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {uploading
                  ? <Icon name="progress_activity" className="text-white animate-spin" size={20} />
                  : <Icon name="photo_camera" className="text-white" size={20} />
                }
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline font-bold text-xl text-on-surface truncate">{displayName}</h2>
            <p className="text-on-surface-variant text-sm truncate">{user?.email ?? ""}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold uppercase tracking-tighter">
                Niveau {level}
              </span>
              <span className="text-[10px] text-on-surface-variant">{xp.toLocaleString()} XP</span>
            </div>
            {/* XP bar */}
            <div className="mt-2 h-1 w-full rounded-full bg-surface-container-highest overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </section>

        {/* Parcours achetés */}
        <section>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Mes parcours</h3>
          {purchases.length === 0 ? (
            <div className="bg-surface-container-high rounded-xl p-6 text-center">
              <Icon name="explore_off" className="text-on-surface-variant/40 mb-2" size={32} />
              <p className="text-on-surface-variant text-sm">Aucun parcours acheté pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.name} className="bg-surface-container-high rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-on-surface text-sm leading-tight">{p.name}</p>
                    <p className="text-on-surface-variant text-xs mt-1">{p.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.status === "Terminé" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      {p.status}
                    </span>
                    <span className="text-on-surface-variant text-xs">{p.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Préférences */}
        <section>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Préférences</h3>
          <div className="bg-surface-container-high rounded-xl overflow-hidden divide-y divide-outline-variant/10">
            {/* Langue */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="language" className="text-primary" size={20} />
                <span className="text-on-surface text-sm font-medium">Langue</span>
              </div>
              <div className="flex gap-1.5">
                {["FR", "EN", "AR"].map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-bold tap-scale ${
                      lang === l ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>
            {/* TTS */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="record_voice_over" className="text-primary" size={20} />
                <div>
                  <p className="text-on-surface text-sm font-medium">Lecture audio (TTS)</p>
                  <p className="text-on-surface-variant text-[10px]">Textes lus à voix haute</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={tts} onChange={() => setTts(!tts)} />
                <span className="slider" />
              </label>
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
              <label className="toggle-switch">
                <input type="checkbox" checked={contrast} onChange={() => setContrast(!contrast)} />
                <span className="slider" />
              </label>
            </div>
            {/* Font size */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="text_fields" className="text-primary" size={20} />
                <p className="text-on-surface text-sm font-medium">Taille de police</p>
              </div>
              <input type="range" min={0} max={100} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full" style={{ accentColor: "#f0be72" }}
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                <span>Petite</span><span>Moyenne</span><span>Grande</span>
              </div>
            </div>
          </div>
        </section>

        {/* Support + déconnexion */}
        <section>
          <div className="bg-surface-container-high rounded-xl overflow-hidden divide-y divide-outline-variant/10">
            <button className="w-full p-4 flex items-center gap-3 tap-scale hover:bg-surface-container-highest transition-colors">
              <Icon name="help" className="text-primary" size={20} />
              <span className="text-on-surface text-sm font-medium">Support & FAQ</span>
              <Icon name="chevron_right" className="text-on-surface-variant ml-auto" size={18} />
            </button>
            {user ? (
              <button onClick={handleLogout}
                className="w-full p-4 flex items-center gap-3 tap-scale hover:bg-error-container/20 transition-colors"
              >
                <Icon name="logout" className="text-error" size={20} />
                <span className="text-error text-sm font-medium">Se déconnecter</span>
              </button>
            ) : (
              <button onClick={() => router.push("/login")}
                className="w-full p-4 flex items-center gap-3 tap-scale"
              >
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
