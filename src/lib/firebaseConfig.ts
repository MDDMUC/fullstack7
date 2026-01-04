// Firebase Configuration for Push Notifications
// This file initializes Firebase and exports the messaging instance

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Firebase project configuration
// These values come from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// VAPID key for Web Push (from Firebase Console > Project Settings > Cloud Messaging)
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

// Initialize Firebase app (singleton pattern)
let firebaseApp: FirebaseApp;

export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseApp) {
    // Check if Firebase is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }
  return firebaseApp;
};

// Get Firebase Messaging instance (client-side only)
let messagingInstance: Messaging | null = null;

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if messaging is supported
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser');
    return null;
  }

  // Return existing instance or create new one
  if (!messagingInstance) {
    const app = getFirebaseApp();
    messagingInstance = getMessaging(app);
  }

  return messagingInstance;
};

// Validate configuration
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    VAPID_KEY
  );
};
