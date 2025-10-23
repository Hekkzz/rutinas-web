import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQ1N1v5AafPQBktmO5nZBUPLLS7R909DE",
  authDomain: "rutinasfitweb.firebaseapp.com",
  projectId: "rutinasfitweb",
  storageBucket: "rutinasfitweb.appspot.com",
  messagingSenderId: "389419273195",
  appId: "1:389419273195:web:f5b3b95dcc3484abb267ae",
  measurementId: "G-QGGNBP9LDH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
