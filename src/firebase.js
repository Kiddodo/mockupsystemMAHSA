import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Values come from .env.local (see the Firebase console → Project settings → Your apps).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// If no database URL is set, the app falls back to the local mock data.
export const isFirebaseEnabled = Boolean(firebaseConfig.databaseURL);

const app = isFirebaseEnabled ? initializeApp(firebaseConfig) : null;
export const db = isFirebaseEnabled ? getDatabase(app) : null;
// Storage needs its own bucket config; only initialize it if one was provided.
export const storage = isFirebaseEnabled && firebaseConfig.storageBucket ? getStorage(app) : null;
