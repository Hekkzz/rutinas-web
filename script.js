// 🔹 Toggle del menú en móviles
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  // 🔹 Cierra el menú al hacer clic en un enlace
  navLinks.querySelectorAll("button, a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
    });
  });
}

function redirigirLogin() {
  window.location.href = "login.html";
}

document.getElementById("startBtn").addEventListener("click", redirigirLogin);
