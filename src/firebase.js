import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOeZwu5Qd-B6Cpuii2FOUrtECP22b6gB4",
  authDomain: "webiot-be585.firebaseapp.com",
  projectId: "webiot-be585",
  storageBucket: "webiot-be585.firebasestorage.app",
  messagingSenderId: "471694946621",
  appId: "1:471694946621:web:88e4c602d5835e7ad7d554",
  measurementId: "G-LL8J2N92HW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);
