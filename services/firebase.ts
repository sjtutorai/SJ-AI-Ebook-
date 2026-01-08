import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Helper to get env var or fallback, handling the "undefined" string case from Vite's define
const getEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value || value === "undefined" || value === "null" || value === "") return fallback;
  return value;
};

// Specific Firebase configuration for sjaiebook project
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyD5cF8Mald_oHA-WHY9zA6vo-ZIXkuOhpg"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "sjaiebook.firebaseapp.com"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "sjaiebook"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "sjaiebook.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "444367832824"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:444367832824:web:7e7bdd0d2d0599d0c0dd0d")
};

// Initialize Firebase only once
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth: Auth = getAuth(app);
export default app;