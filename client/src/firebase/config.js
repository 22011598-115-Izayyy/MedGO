import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use your Firebase config (values from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCYUsUoAe4ZYPBHXUPJv6A9I4scqKfRKFM",
  authDomain: "medgo-20b02.firebaseapp.com",
  projectId: "medgo-20b02",
  storageBucket: "medgo-20b02.firebasestorage.app",
  messagingSenderId: "523937627613",
  appId: "1:523937627613:web:95ccb4f96368b96c0d8a34"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);