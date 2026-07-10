import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDn1VGmr0SqVxJWaUHj1krKvZTmyS5uYC4",
  authDomain: "trading-journal-45af7.firebaseapp.com",
  projectId: "trading-journal-45af7",
  storageBucket: "trading-journal-45af7.firebasestorage.app",
  messagingSenderId: "178008096103",
  appId: "1:178008096103:web:2748b1d345e8505be943c2",
  measurementId: "G-MFM3N4C7X2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };