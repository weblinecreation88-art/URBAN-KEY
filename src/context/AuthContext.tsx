"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string, firstName: string, lastName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const displayName = `${firstName} ${lastName}`.trim();
    await updateProfile(cred.user, { displayName });
    // Create Firestore user document
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email,
      firstName,
      lastName,
      displayName,
      xp: 0,
      level: 1,
      createdAt: serverTimestamp(),
    });
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const nameParts = (cred.user.displayName ?? "").split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") ?? "";
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        firstName,
        lastName,
        displayName: cred.user.displayName ?? "",
        avatarUrl: cred.user.photoURL ?? "",
        xp: 0,
        level: 1,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
