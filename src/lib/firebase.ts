import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDvm3X_xExGFimV8z7pkAXzYe7tVs8cv6o",
  authDomain: "urban-key2.firebaseapp.com",
  projectId: "urban-key2",
  storageBucket: "urban-key2.firebasestorage.app",
  messagingSenderId: "805705237369",
  appId: "1:805705237369:web:9e897641dd0da9568c65a8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
