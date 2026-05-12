import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "hidayah-my.firebaseapp.com",
  projectId: "hidayah-my",
  storageBucket: "hidayah-my.firebasestorage.app",
  messagingSenderId: "390488281686",
  appId: "1:390488281686:web:bdc5f2b80f5ae72d7821f7",
  measurementId: "G-6HETTDBBKL",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
