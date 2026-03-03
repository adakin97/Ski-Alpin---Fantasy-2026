import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMlaFn8hmIsWpgbce4Vlf08NtJm1Enj6c",
  authDomain: "fantasyski-416ab.firebaseapp.com",
  projectId: "fantasyski-416ab",
  storageBucket: "fantasyski-416ab.firebasestorage.app",
  messagingSenderId: "553435629303",
  appId: "1:553435629303:web:3b6c1fc677ff9ed277b5f2",
  measurementId: "G-J5P79TS3WB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
