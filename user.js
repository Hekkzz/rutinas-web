import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Elementos del DOM
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const rutinaContainer = document.getElementById("rutinaContainer");
const crearRutinaBtn = document.getElementById("crearRutinaBtn");
const userDataContainer = document.getElementById("userDataContainer");

// 🔹 Tabs funcionales
document.querySelectorAll(".nav-btn[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

// ===========================================================
// 🔐 SESIÓN DEL USUARIO
// ===========================================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userName.textContent = user.displayName || "Usuario";
        userEmail.textContent = user.email;

        await cargarDatosUsuario(user.uid);

        // Si ya existe documento de rutina, ocultamos el botón de crear (porque la rutina se maneja desde su preview/estado).
        try {
            const rutRef = doc(db, "rutinas", user.uid);
            const rutSnap = await getDoc(rutRef);
            if (rutSnap.exists()) {
                // Oculta el botón principal de crear rutina, la interfaz de rutina usa preview/comenzar.
                if (crearRutinaBtn) crearRutinaBtn.style.display = "none";
            } else {
                if (crearRutinaBtn) crearRutinaBtn.style.display = ""; // visible si no hay rutina
            }
        } catch (err) {
            console.error("Error al comprobar rutina:", err);
        }

        // Mostrar la rutina del día (si la rutina ya fue iniciada mostrará el día actual,
        // si está creada pero no iniciada mostrará la vista previa con botones).
        await mostrarRutinaDiaActual(user.uid);
        await mostrarCalendario(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

// 🔹 Cerrar sesión
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});

// ===========================================================
// 🧍 DATOS PERSONALES DEL USUARIO
// ===========================================================
async function cargarDatosUsuario(uid) {
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        mostrarDatosGuardados(docSnap.data());
    } else {
        mostrarBotonGuardarDatos();
    }
}

// 🔹 Mostrar botón inicial
function mostrarBotonGuardarDatos() {
    userDataContainer.innerHTML = `
    <div class="user-summary">
      <h3>Bienvenido 👋</h3>
      <p>No has guardado tus datos personales aún.</p>
      <button id="btnAbrirFormulario" class="btn">Guardar mis datos</button>
    </div>
  `;

    const abrirFormBtn = document.getElementById("btnAbrirFormulario");
    if (abrirFormBtn) {
        abrirFormBtn.addEventListener("click", mostrarFormularioDatos);
    }
}

// 🔹 Mostrar formulario
function mostrarFormularioDatos(datos = null) {
    userDataContainer.innerHTML = `
    <div class="user-form">
      <h3>${datos ? "Editar tus datos ✏️" : "Completa tus datos personales 📝"}</h3>
      <form id="userDataForm">
        <label>Peso (kg):</label>
        <input type="number" id="peso" value="${datos?.peso || ""}" required>

        <label>Estatura (cm):</label>
        <input type="number" id="estatura" value="${datos?.estatura || ""}" required>

        <label>Edad:</label>
        <input type="number" id="edad" value="${datos?.edad || ""}" required>

        <label>Género:</label>
        <select id="genero" required>
          <option value="">Selecciona tu género</option>
          <option value="Masculino" ${datos?.genero === "Masculino" ? "selected" : ""}>Masculino</option>
          <option value="Femenino" ${datos?.genero === "Femenino" ? "selected" : ""}>Femenino</option>
          <option value="Otro" ${datos?.genero === "Otro" ? "selected" : ""}>Otro</option>
        </select>

        <label>Nivel de actividad:</label>
        <select id="nivel" required>
          <option value="">Selecciona tu nivel</option>
          <option value="Principiante" ${datos?.nivel === "Principiante" ? "selected" : ""}>Principiante</option>
          <option value="Intermedio" ${datos?.nivel === "Intermedio" ? "selected" : ""}>Intermedio</option>
          <option value="Avanzado" ${datos?.nivel === "Avanzado" ? "selected" : ""}>Avanzado</option>
        </select>

        <label>Objetivo:</label>
        <select id="objetivo" required>
          <option value="">Selecciona tu objetivo</option>
          <option value="Fuerza" ${datos?.objetivo === "Fuerza" ? "selected" : ""}>Fuerza</option>
          <option value="Definición" ${datos?.objetivo === "Definición" ? "selected" : ""}>Definición</option>
          <option value="Resistencia" ${datos?.objetivo === "Resistencia" ? "selected" : ""}>Resistencia</option>
          <option value="Pérdida de peso" ${datos?.objetivo === "Pérdida de peso" ? "selected" : ""}>Pérdida de peso</option>
        </select>

        <button type="submit" class="btn">${datos ? "Guardar cambios" : "Guardar datos"}</button>
      </form>
    </div>
  `;

    document.getElementById("userDataForm").addEventListener("submit", guardarDatosUsuario);
}

// 🔹 Guardar datos
async function guardarDatosUsuario(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const datos = {
        peso: parseFloat(document.getElementById("peso").value),
        estatura: parseFloat(document.getElementById("estatura").value),
        edad: parseInt(document.getElementById("edad").value),
        genero: document.getElementById("genero").value,
        nivel: document.getElementById("nivel").value,
        objetivo: document.getElementById("objetivo").value,
        rutinasCompletadas: 0,
        uid: user.uid,
        email: user.email,
    };

    await setDoc(doc(db, "usuarios", user.uid), datos);
    alert("✅ Datos guardados correctamente");
    mostrarDatosGuardados(datos);
}


// 🔹 Mostrar datos guardados
function mostrarDatosGuardados(datos) {
    userDataContainer.innerHTML = `
    <div class="user-summary">
      <h3>Tus datos personales</h3>
      <ul>
        <li><strong>Peso:</strong> ${datos.peso} kg</li>
        <li><strong>Estatura:</strong> ${datos.estatura} cm</li>
        <li><strong>Edad:</strong> ${datos.edad} años</li>
        <li><strong>Género:</strong> ${datos.genero}</li>
        <li><strong>Nivel:</strong> ${datos.nivel || "No especificado"}</li>
        <li><strong>Objetivo:</strong> ${datos.objetivo}</li>
      </ul>
      <button id="editarDatosBtn" class="btn">Editar datos</button>
    </div>
  `;

    const editarBtn = document.getElementById("editarDatosBtn");
    if (editarBtn) {
        editarBtn.addEventListener("click", () => mostrarFormularioDatos(datos));
    }
}

// ===========================================================
// 💪 RUTINA PERSONALIZADA
// ===========================================================
crearRutinaBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    // 📌 Obtenemos los datos personales del usuario
    const docRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(docRef);

    if (!userSnap.exists()) {
        alert("⚠️ Primero guarda tus datos en la pestaña Inicio.");
        return;
    }

    const datos = userSnap.data();

    // 📋 Plantillas base según objetivo y nivel
    const ejerciciosBase = {
        Fuerza: {
            Principiante: [
                {
                    nombre: "Sentadillas",
                    rep: "3x12",
                    descanso: "60s",
                    desc: "Fortalece piernas y glúteos. Ponte de pie con los pies al ancho de los hombros, baja lentamente flexionando las rodillas sin que pasen la punta de los pies, y sube controlando el movimiento.",
                    img: "img/sentadilla.jpg"
                },
                {
                    nombre: "Flexiones",
                    rep: "3x10",
                    descanso: "60s",
                    desc: "Trabaja pecho y tríceps. Colócate en plancha, baja el pecho hasta casi tocar el suelo y empuja hacia arriba manteniendo el abdomen firme.",
                    img: "img/flexiones.webp"
                },
                {
                    nombre: "Plancha",
                    rep: "3x30s",
                    descanso: "45s",
                    desc: "Activa el core. Apoya antebrazos y puntas de los pies, mantén el cuerpo recto y el abdomen contraído sin dejar caer la cadera.",
                    img: "img/plancha.jpg"
                },
            ],
            Intermedio: [
                {
                    nombre: "Pull-up",
                    rep: "4x8",
                    descanso: "90s",
                    desc: "Ejercicio clave para desarrollar la espalda y los brazos. Usa un agarre pronado (palmas hacia adelante) y controla tanto la subida como la bajada. Si no puedes completar todas las repeticiones, utiliza una banda elástica para asistencia.",
                    img: "img/pull-up.jpg"
                },
                {
                    nombre: "Prensa de piernas",
                    rep: "4x10",
                    descanso: "90s",
                    desc: "Fortalece cuádriceps, glúteos y femorales. Coloca los pies al ancho de los hombros y no bloquees las rodillas al extender. Mantén la espalda apoyada durante todo el movimiento.",
                    img: "img/prensa.jpg"
                },
                {
                    nombre: "Press plano",
                    rep: "4x8",
                    descanso: "90s",
                    desc: "Excelente para el desarrollo del pecho, tríceps y deltoides frontales. Baja la barra o mancuernas de forma controlada hasta rozar el pecho y empuja sin perder la técnica. Mantén los pies firmes en el suelo.",
                    img: "img/press_plano.jpg"
                },
                {
                    nombre: "Curl de bíceps parado",
                    rep: "3x12",
                    descanso: "60s",
                    desc: "Aísla el trabajo del bíceps. Mantén los codos pegados al cuerpo y evita balancear el torso. Sube lentamente y controla el descenso para una mejor contracción muscular.",
                    img: "img/curl_biceps.jpg"
                }

            ],
            Avanzado: [
                {
                    nombre: "Sentadilla con peso",
                    rep: "5x5",
                    descanso: "120s",
                    desc: "Fuerza pura en piernas. Mantén la espalda recta y el abdomen activo al bajar con el peso controlado.",
                    img: "img/sentadilla_peso.jpg"
                },
                {
                    nombre: "Peso muerto",
                    rep: "5x5",
                    descanso: "120s",
                    desc: "Ejercicio completo. Mantén postura firme y activa glúteos y espalda baja al subir.",
                    img: "img/peso_muerto.webp"
                },
                {
                    nombre: "Press militar",
                    rep: "4x6",
                    descanso: "90s",
                    desc: "Fuerza en hombros. Empuja la barra sobre la cabeza sin arquear la espalda.",
                    img: "img/press_militar.jpg"
                },
            ]
        },

        "Pérdida de peso": {
            Principiante: [
                {
                    nombre: "Cardio ligero",
                    rep: "20 min",
                    descanso: "-",
                    desc: "Caminata o bicicleta suave. Mantén ritmo constante y postura relajada para activar el metabolismo.",
                    img: "img/cardio.jpg"
                },
                {
                    nombre: "Abdominales",
                    rep: "3x15",
                    descanso: "45s",
                    desc: "Tonifica el abdomen. Eleva el torso controladamente sin jalar el cuello y mantén el abdomen firme.",
                    img: "img/abdominales.jpg"
                },
            ],
            Intermedio: [
                {
                    nombre: "Burpees",
                    rep: "3x12",
                    descanso: "60s",
                    desc: "Ejercicio completo que eleva el ritmo cardíaco. Realiza flexión, salto y regreso al suelo sin pausa.",
                    img: "img/burpees.avif"
                },
                {
                    nombre: "Saltar cuerda",
                    rep: "5x1min",
                    descanso: "30s",
                    desc: "Cardio intenso. Mantén el abdomen contraído y un ritmo fluido durante los saltos.",
                    img: "img/saltar_cuerda.jpeg"
                },
            ],
            Avanzado: [
                {
                    nombre: "HIIT",
                    rep: "20 min",
                    descanso: "-",
                    desc: "Intervalos de alta intensidad. Alterna 30s de esfuerzo máximo y 30s de descanso activo.",
                    img: "img/hiit.jpg"
                },
                {
                    nombre: "Mountain climbers",
                    rep: "4x30s",
                    descanso: "30s",
                    desc: "Activa core y cardio. Desde plancha, lleva las rodillas al pecho alternadamente sin perder ritmo.",
                    img: "img/mountain_climbers.webp"
                },
            ]
        },

        Resistencia: {
            Principiante: [
                {
                    nombre: "Marcha rápida",
                    rep: "25 min",
                    descanso: "-",
                    desc: "Camina a ritmo acelerado para mejorar la capacidad cardiovascular sin impacto.",
                    img: "img/marcha.webp"
                },
                {
                    nombre: "Bicicleta estática",
                    rep: "20 min",
                    descanso: "-",
                    desc: "Mantén cadencia media y respiración constante, enfocándote en la resistencia del pedaleo.",
                    img: "img/bicicleta.webp"
                },
            ],
            Intermedio: [
                {
                    nombre: "Correr moderado",
                    rep: "30 min",
                    descanso: "-",
                    desc: "Corre a ritmo estable, enfocado en mantener respiración controlada y zancada regular.",
                    img: "img/correr.webp"
                },
                {
                    nombre: "Escaladores",
                    rep: "4x30s",
                    descanso: "45s",
                    desc: "Combina cardio y core. Mantén el abdomen firme y los movimientos rápidos y precisos.",
                    img: "img/escaladores.webp"
                },
            ],
            Avanzado: [
                {
                    nombre: "Carrera continua",
                    rep: "40 min",
                    descanso: "-",
                    desc: "Corre en terreno variado, ajustando el ritmo para mantener resistencia constante.",
                    img: "img/carrera.webp"
                },
                {
                    nombre: "Burpees con salto alto",
                    rep: "4x15",
                    descanso: "60s",
                    desc: "Aumenta la intensidad saltando explosivamente al final de cada burpee.",
                    img: "img/burpee_salto.webp"
                },
            ]
        },

        Definición: {
            Principiante: [
                {
                    nombre: "Plancha con elevación",
                    rep: "3x30s",
                    descanso: "45s",
                    desc: "Mantén posición de plancha y alterna levantando una pierna para trabajar abdomen y glúteos.",
                    img: "img/plancha_elevacion.jpg"
                },
                {
                    nombre: "Zancadas",
                    rep: "3x10 por pierna",
                    descanso: "60s",
                    desc: "Da un paso largo al frente y baja controlando el movimiento. Refuerza piernas y estabilidad. Agrega peso para mas dificultad",
                    img: "img/zancadas.webp"
                },
            ],
            Intermedio: [
                {
                    nombre: "Peso muerto rumano",
                    rep: "4x10",
                    descanso: "75s",
                    desc: "Trabaja femorales y glúteos con control. Mantén ligera flexión en rodillas y espalda recta.",
                    img: "img/peso_muerto_rumano.jpeg"
                },
                {
                    nombre: "Flexiones con palmada",
                    rep: "4x10",
                    descanso: "60s",
                    desc: "Incrementa potencia muscular. Realiza una flexión y empuja fuerte para dar una palmada.",
                    img: "img/flexion_palmada.webp"
                },
            ],
            Avanzado: [
                {
                    nombre: "Circuito cuerpo completo",
                    rep: "3 rondas",
                    descanso: "90s",
                    desc: "Incluye burpees, saltos, flexiones y planchas. Enfocado en tono y definición muscular.",
                    img: "img/circuito.jpeg"
                },
                {
                    nombre: "Elevaciones de pierna",
                    rep: "4x12",
                    descanso: "45s",
                    desc: "Acuéstate y eleva las piernas rectas hasta 90°. Fortalece el abdomen inferior.",
                    img: "img/elevaciones_pierna.webp"
                },
            ]
        }
    };


    // 🧠 Selección de rutina según datos
    const ejerciciosSeleccionados =
        ejerciciosBase[datos.objetivo]?.[datos.nivel] ||
        ejerciciosBase["Fuerza"]["Principiante"];

    // 🗓️ Estructura semanal
    const rutinaGenerada = {
        lunes: ejerciciosSeleccionados,
        martes: ejerciciosSeleccionados,
        miércoles: [{ nombre: "Descanso activo", rep: "-", descanso: "-", desc: "Caminata ligera o estiramientos.", img: "img/descanso.avif" }],
        jueves: ejerciciosSeleccionados,
        viernes: ejerciciosSeleccionados,
    };

    await setDoc(doc(db, "rutinas", user.uid), {
        uid: user.uid,
        email: user.email,
        fechaCreacion: new Date(),
        rutina: rutinaGenerada,
        progreso: [] // se usará para el calendario
    });

    // Ocultamos el botón principal ya que ahora la rutina existe y la UI usará preview/comenzar
    if (crearRutinaBtn) crearRutinaBtn.style.display = "none";

    mostrarRutina(rutinaGenerada);
    alert("✅ Rutina personalizada creada según tus datos.");
});

function mostrarRutina(rutina, esPrevia = true) {
    rutinaContainer.innerHTML = `
    <h3>${esPrevia ? "Vista previa de tu rutina semanal" : "Tu rutina semanal activa"}</h3>
    ${Object.entries(rutina)
            .map(([dia, ejercicios]) => `
        <div class="dia-rutina">
          <h4>${dia.charAt(0).toUpperCase() + dia.slice(1)}</h4>
          <div class="ejercicios-dia">
            ${ejercicios.map(e => `
              <div class="ejercicio-card">
                <img src="${e.img}" alt="${e.nombre}" class="img-ejercicio" />
                <div>
                  <h5>${e.nombre}</h5>
                  <p><strong>Repeticiones:</strong> ${e.rep}</p>
                  <p><strong>Descanso:</strong> ${e.descanso}</p>
                  <p>${e.desc}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    ${esPrevia ? `
      <div class="botones-rutina">
        <button id="btnGenerarOtra" class="btn">🔁 Generar otra rutina</button>
        <button id="btnComenzarRutina" class="btn">🚀 Comenzar rutina</button>
      </div>
    ` : ""}
  `;

    if (esPrevia) {
        // Generar otra rutina: reutiliza el botón principal para generar una nueva preview (no sobrescribe inicio/progreso)
        const btnGen = document.getElementById("btnGenerarOtra");
        const btnCom = document.getElementById("btnComenzarRutina");
        if (btnGen) {
            btnGen.addEventListener("click", () => {
                // Simular click en crearRutinaBtn para generar otra (usa la misma lógica)
                if (crearRutinaBtn) crearRutinaBtn.click();
            });
        }
        if (btnCom) {
            btnCom.addEventListener("click", guardarRutinaFinal);
        }
    }
}

async function guardarRutinaFinal() {
    const user = auth.currentUser;
    if (!user) return;

    const rutinaRef = doc(db, "rutinas", user.uid);
    const rutinaSnap = await getDoc(rutinaRef);
    if (!rutinaSnap.exists()) return;

    const data = rutinaSnap.data();
    // Guardar inicio para saber cuándo se empezó (ISO) y reiniciar progreso
    data.inicio = new Date().toISOString();
    data.progreso = [];
    await setDoc(rutinaRef, data);

    // ocultar el botón principal por si aún era visible
    if (crearRutinaBtn) crearRutinaBtn.style.display = "none";

    alert("✅ Rutina guardada. ¡Listo para comenzar!");
    // recargamos datos y UI sin forzar reload completo
    await mostrarRutinaDiaActual(user.uid);
    await mostrarCalendario(user.uid);
}

// ===========================================================
// 📦 Cargar rutina desde Firestore al iniciar sesión
// ===========================================================
async function cargarRutina(user) {
    const rutinaRef = doc(db, "rutinas", user.uid);
    const rutinaSnap = await getDoc(rutinaRef);

    if (rutinaSnap.exists()) {
        const data = rutinaSnap.data();

        // Verifica si hay rutina y si no ha sido completada
        if (data.rutina) {
            mostrarRutina(data.rutina);
        } else {
            rutinaContainer.innerHTML = "<p>No tienes rutina activa actualmente.</p>";
        }
    } else {
        rutinaContainer.innerHTML = "<p>No has generado una rutina aún.</p>";
    }
}

async function mostrarRutinaDiaActual(uid) {
    const cont = document.getElementById("rutinaContainer");
    const rutinaSnap = await getDoc(doc(db, "rutinas", uid));

    if (!rutinaSnap.exists()) {
        cont.innerHTML = "<p>No tienes una rutina activa. Genera una nueva.</p>";
        // Si no hay rutina, el botón crear debe mostrarse
        if (crearRutinaBtn) crearRutinaBtn.style.display = "";
        return;
    }

    const data = rutinaSnap.data();
    const dias = Object.keys(data.rutina);

    // Si aún no se inició la rutina (no hay campo inicio), mostramos la vista previa con botones
    if (!data.inicio) {
        // Mostrar preview (esPrevia = true)
        mostrarRutina(data.rutina, true);
        // ocultar el botón global (porque la preview trae sus botones)
        if (crearRutinaBtn) crearRutinaBtn.style.display = "none";
        return;
    }

    // Si la rutina ya inició, determinamos el día actual en base al progreso (número de días completados)
    // de modo que al marcar un día, se mostrará inmediatamente el siguiente.
    const progreso = data.progreso || [];
    const pointer = progreso.length; // si completó 0 días -> pointer 0 => mostrar dias[0]
    const index = pointer % dias.length; // recorre lunes..viernes
    const diaActual = dias[index];

    const ejercicios = data.rutina[diaActual];
    // Comprobamos si hoy (fecha actual) ya está marcada en progreso; mantendremos visual si ya completado
    const hoyStr = new Date().toISOString().split("T")[0];
    const completadoHoy = progreso.includes(hoyStr);

    cont.innerHTML = `
    <h3>Rutina de hoy (${diaActual})</h3>
    ${ejercicios.map(e => `
      <div class="ejercicio-card">
        <img src="${e.img}" class="img-ejercicio" />
        <div>
          <h4>${e.nombre}</h4>
          <p><b>Repeticiones:</b> ${e.rep}</p>
          <p><b>Descanso:</b> ${e.descanso}</p>
          <p>${e.desc}</p>
        </div>
      </div>
    `).join("")}
    ${!completadoHoy ? `<button id="btnCompletarDia" class="btn">✅ Marcar día como completado</button>` : `<p>✔ Día completado</p>`}
  `;

    // Mostrar botón crearRutinaBtn oculto ya que rutina está activa
    if (crearRutinaBtn) crearRutinaBtn.style.display = "none";

    if (!completadoHoy) {
        const btn = document.getElementById("btnCompletarDia");
        if (btn) {
            btn.addEventListener("click", async () => {
                // Marcar con la fecha actual con formato YYYY-MM-DD
                const fechaHoy = new Date().toISOString().split("T")[0];
                await marcarDiaCompletado(uid, fechaHoy);
            });
        }
    }
}

async function marcarDiaCompletado(uid, fecha) {
    const rutinaRef = doc(db, "rutinas", uid);
    const snap = await getDoc(rutinaRef);
    if (!snap.exists()) return;

    const data = snap.data();
    data.progreso = data.progreso || [];
    // Evitamos duplicados
    if (!data.progreso.includes(fecha)) {
        data.progreso.push(fecha);
        await setDoc(rutinaRef, data);
    }

    alert("✅ Día marcado como completado.");

    // Actualizamos calendario y la vista de rutina al siguiente día en base al nuevo progreso
    await mostrarCalendario(uid);
    await mostrarRutinaDiaActual(uid);
}

// ===========================================================
// 💬 CHAT SIMULADO (tipo IA)
// ===========================================================
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// Diccionario de respuestas automáticas
const respuestasIA = [
    // 🏋️‍♂️ Entrenamientos y rutinas
    { keywords: ["rutina pecho", "pecho", "press banca"], response: "Te recomiendo una rutina de pecho con press de banca, aperturas y fondos. 4 series de 10 repeticiones cada una 💪." },
    { keywords: ["rutina pierna", "pierna", "sentadillas"], response: "El día de pierna no se salta 😎. Incluye sentadillas, peso muerto y extensiones. Enfócate en buena técnica." },
    { keywords: ["rutina abdomen", "abdomen", "abdominales"], response: "Para marcar el abdomen, combina planchas, crunches y elevaciones de piernas. La constancia es clave." },
    { keywords: ["entrenamiento en casa", "casa", "sin gym"], response: "Puedes entrenar en casa con ejercicios de peso corporal como flexiones, abdominales y sentadillas." },
    { keywords: ["calentamiento", "antes de entrenar"], response: "Antes de empezar, haz 5-10 minutos de calentamiento con movilidad articular y cardio ligero." },
    { keywords: ["estiramiento", "después de entrenar"], response: "Después de entrenar, haz estiramientos de los músculos trabajados para evitar lesiones." },
    { keywords: ["frecuencia", "cuántos días entrenar"], response: "La frecuencia ideal depende de tu nivel, pero 4 a 5 días por semana es un buen punto medio." },
    { keywords: ["descanso", "recuperación"], response: "El descanso es tan importante como el entrenamiento. Duerme al menos 7 horas para recuperarte bien." },

    // 🍎 Nutrición y dieta
    { keywords: ["dieta", "alimentación"], response: "Una dieta balanceada debe incluir proteínas, carbohidratos y grasas saludables. Todo en las porciones correctas." },
    { keywords: ["proteínas", "proteina"], response: "Incluye pollo, pescado, huevo o legumbres para asegurar una buena ingesta de proteínas." },
    { keywords: ["carbohidratos", "carbos"], response: "Los carbohidratos no son malos, solo elige los complejos: avena, arroz integral, camote, etc." },
    { keywords: ["grasas", "grasas saludables"], response: "Grasas saludables como aguacate, nueces o aceite de oliva te ayudarán a mantener energía." },
    { keywords: ["suplementos", "proteina whey"], response: "Los suplementos pueden ayudar, pero no reemplazan una buena alimentación. Prioriza comida real." },
    { keywords: ["agua", "hidratar"], response: "Mantente hidratado. Toma al menos 2 litros de agua al día, más si entrenas intensamente." },
    { keywords: ["ayuno", "ayuno intermitente"], response: "El ayuno puede funcionar para algunos, pero lo importante es el balance calórico total del día." },

    // 💡 Consejos generales y motivación
    { keywords: ["motivación", "motivame"], response: "Recuerda por qué empezaste 💪. La constancia vence al talento." },
    { keywords: ["cansancio", "fatiga"], response: "Si estás muy cansado, toma un día de descanso activo o reduce la intensidad." },
    { keywords: ["resultados", "no veo cambios"], response: "Los resultados tardan, pero llegan. No te desesperes, sigue con disciplina." },
    { keywords: ["principiantes", "empezar"], response: "Empieza con ejercicios básicos y enfócate en la técnica antes que en el peso." },
    { keywords: ["lesiones", "me duele"], response: "Si tienes molestias o lesiones, consulta a un especialista antes de seguir entrenando." },
    { keywords: ["progresar", "aumentar peso"], response: "Aumenta poco a poco la carga o las repeticiones para seguir progresando." },

    // 🧠 Conversaciones generales / estilo IA
    { keywords: ["hola", "buenas", "hey"], response: "¡Hola! 👋 ¿En qué puedo ayudarte con tu entrenamiento o dieta hoy?" },
    { keywords: ["gracias", "muchas gracias"], response: "¡De nada! Siempre es un placer ayudarte a mejorar tu rendimiento 💪." },
    { keywords: ["adiós", "adios", "chao", "nos vemos"], response: "¡Hasta luego! No olvides hidratarte y mantenerte activo 😎." },
    { keywords: ["quién eres", "que eres"], response: "Soy tu asistente virtual de entrenamiento, listo para ayudarte a cumplir tus metas." },
    { keywords: ["plan personalizado", "rutina personalizada"], response: "Por ahora no creo planes personalizados, pero puedo darte recomendaciones generales." }
];

// Función para agregar mensajes al chat
function agregarMensaje(texto, tipo = "usuario") {
    const mensaje = document.createElement("div");
    mensaje.classList.add("mensaje", tipo);
    mensaje.innerHTML = `<p>${texto}</p>`;
    chatMessages.appendChild(mensaje);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Buscar respuesta automática
function obtenerRespuesta(mensajeUsuario) {
    const texto = mensajeUsuario.toLowerCase();
    for (const item of respuestasIA) {
        if (item.keywords.some(k => texto.includes(k))) {
            return item.response;
        }
    }
    return "Lo siento 😅, aún no tengo una respuesta para eso. Pero puedo seguir aprendiendo contigo 💡.";
}

// Evento enviar mensaje
sendChatBtn.addEventListener("click", () => {
    const texto = chatInput.value.trim();
    if (texto === "") return;

    agregarMensaje(texto, "usuario");
    chatInput.value = "";

    // Simula "pensando..."
    setTimeout(() => {
        const respuesta = obtenerRespuesta(texto);
        agregarMensaje(respuesta, "ia");
    }, 800);
});


//-----------Calendario------------------------------
async function mostrarCalendario(uid) {
    const calDiv = document.getElementById("calendarContainer");
    const rutinaSnap = await getDoc(doc(db, "rutinas", uid));

    if (!rutinaSnap.exists()) {
        calDiv.innerHTML = "<p>No tienes rutina creada aún.</p>";
        return;
    }

    const data = rutinaSnap.data();
    const progreso = data.progreso || [];
    const rutina = data.rutina;

    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    const diasMes = new Date(anio, mes + 1, 0).getDate();

    // Calculamos el día de la semana del primer día del mes.
    // getDay: 0=domingo, 1=lunes, ... Para que la grilla empiece en lunes transformamos:
    const primerDia = new Date(anio, mes, 1).getDay(); // 0..6
    const offset = (primerDia + 6) % 7; // convierte domingo(0)->6, lunes(1)->0, etc.

    let html = `<div class="calendar-grid">`;

    // Añadimos casillas vacías al inicio para ajustar a lunes inicio de semana
    for (let i = 0; i < offset; i++) {
        html += `<div class="cal-dia empty"></div>`;
    }

    for (let d = 1; d <= diasMes; d++) {
        const fecha = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const hecho = progreso.includes(fecha);
        html += `
      <div class="cal-dia ${hecho ? "completado" : ""}" data-dia="${d}">
        <span>${d}</span>
      </div>`;
    }

    html += "</div><div id='previewDia' class='preview-box'></div>";
    calDiv.innerHTML = html;

    document.querySelectorAll(".cal-dia").forEach(diaEl => {
        // ignorar las casillas vacías (sin data-dia)
        if (!diaEl.dataset || !diaEl.dataset.dia) return;
        diaEl.addEventListener("click", e => {
            const diaNum = parseInt(e.currentTarget.dataset.dia);
            // Obtenemos el día de la semana real para ese día (0=domingo..6=sabado)
            const fechaObj = new Date(anio, mes, diaNum);
            const weekDay = fechaObj.getDay(); // 0..6 (domingo..sabado)
            // Convertimos a índice lunes=0, martes=1 ... domingo=6
            const mondayIndex = (weekDay + 6) % 7;

            const diasRutina = Object.keys(rutina); // ej: ["lunes","martes",...]
            let previewHtml = "";

            if (mondayIndex >= 0 && mondayIndex < diasRutina.length) {
                const diaRutina = diasRutina[mondayIndex];
                const ejercicios = rutina[diaRutina] || [];
                previewHtml += `<h4>${diaRutina.charAt(0).toUpperCase() + diaRutina.slice(1)}</h4>`;
                if (ejercicios.length === 0) previewHtml += `<p>Descanso / sin ejercicios</p>`;
                previewHtml += ejercicios.map(e => `<p>• ${e.nombre} (${e.rep})</p>`).join("");
            } else {
                // fin de semana o no hay rutina para ese día
                previewHtml += `<h4>Descanso</h4><p>No hay ejercicios planificados para este día.</p>`;
            }

            document.getElementById("previewDia").innerHTML = previewHtml;
        });
    });
}

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
