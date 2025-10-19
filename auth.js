import { auth } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');
const message = document.getElementById('message');

showLogin.addEventListener('click', () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

showRegister.addEventListener('click', () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
});

document.getElementById('btnRegister').addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    message.textContent = "✅ Usuario registrado correctamente.";
    message.style.color = "limegreen";
  } catch (error) {
    message.textContent = "❌ " + error.message;
    message.style.color = "red";
  }
});

document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    message.textContent = "❌ " + error.message;
    message.style.color = "red";
  }
});
