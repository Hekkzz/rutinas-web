// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAQ1N1v5AafPQBktmO5nZBUPLLS7R909DE",
  authDomain: "rutinasfitweb.firebaseapp.com",
  projectId: "rutinasfitweb",
  storageBucket: "rutinasfitweb.appspot.com", // ✅ Corregido
  messagingSenderId: "389419273195",
  appId: "1:389419273195:web:f5b3b95dcc3484abb267ae",
  measurementId: "G-QGGNBP9LDH"
};

// Inicialización única
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Exportamos para uso global
export { app, auth, db };
