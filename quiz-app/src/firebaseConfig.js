// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import getFirestore

const firebaseConfig = {
  apiKey: "AIzaSyDEOZjPTjneq_QaV35SUX2PS-I_6ySErZs",
  authDomain: "quiz-f3a77.firebaseapp.com",
  projectId: "quiz-f3a77",
  storageBucket: "quiz-f3a77.appspot.com",
  messagingSenderId: "514556997957",
  appId: "1:514556997957:web:9a0c1e76268857f43a0e2c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Initialize Firestore

export default app;
