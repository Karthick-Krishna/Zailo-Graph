import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyCFhUPxs5Akkg-2OQgWMcjJrKFLlPgt_Dg",
  authDomain: "zailograph.firebaseapp.com",
  projectId: "zailograph",
  storageBucket: "zailograph.firebasestorage.app",
  messagingSenderId: "137959145864",
  appId: "1:137959145864:web:2994360a1d4e4b642bba3d",
  measurementId: "G-TXEYD5NJJZ"
};

// Initialize Firebase App singleton safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firebase Analytics safely (only when supported in browser environment)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Non-blocking in environments where IndexedDB is unavailable
  });
}

