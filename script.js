const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

// Cerrar el menú al hacer clic en un enlace
menu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("active");
    menuToggle.classList.remove("active");
  });
});

function redirigirLogin() {
  window.location.href = "login.html";
}

document.getElementById("startBtn").addEventListener("click", redirigirLogin);
