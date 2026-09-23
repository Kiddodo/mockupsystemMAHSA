import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Values come from .env.local (see the Firebase console → Project settings → Your apps).
// Defaults point to the active Firebase project (internship-ac115 in asia-southeast1).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBW0YIm_7JCbDunfToYn76wvcyVtEpW3D4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'internship-ac115.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://internship-ac115-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'internship-ac115',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'internship-ac115.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '867152866574',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:867152866574:web:6fd3bcaf7cb67518b3bb5f',
};

// If no database URL is set, the app falls back to the local mock data.
export const isFirebaseEnabled = Boolean(firebaseConfig.databaseURL);

const app = isFirebaseEnabled ? initializeApp(firebaseConfig) : null;
export const db = isFirebaseEnabled ? getDatabase(app) : null;
// Storage needs its own bucket config; only initialize it if one was provided.
export const storage = isFirebaseEnabled && firebaseConfig.storageBucket ? getStorage(app) : null;
