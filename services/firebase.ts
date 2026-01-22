
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Specific Firebase configuration for sjaiebook project provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyD5cF8Mald_oHA-WHY9zA6vo-ZIXkuOhpg",
  authDomain: "sjaiebook.firebaseapp.com",
  projectId: "sjaiebook",
  storageBucket: "sjaiebook.firebasestorage.app",
  messagingSenderId: "444367832824",
  appId: "1:444367832824:web:7e7bdd0d2d0599d0c0dd0d"
};

// Initialize Firebase only once
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
