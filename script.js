// ================================
// POCHACO - CALENDARIO
// ================================

// PIN inicial
let PIN = localStorage.getItem("pochacoPin") || "1234";

// Estado de la aplicación
let unlocked = false;

// Mes que estamos viendo
let current = new Date();

// Eventos guardados
let events = JSON.parse(
    localStorage.getItem("pochacoEvents") || "[]"
);

// Nombres de los meses
const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

// Contenedor principal
const app = document.getElementById("app");


// ================================
// GUARDAR DATOS
// ================================

function save() {
    localStorage.setItem(
        "pochacoEvents",
        JSON.stringify(events)
    );
}


// ================================
// SEGURIDAD PARA TEXTO HTML
// ================================

function esc(text) {
    return String(text).replace(
        /[&<>'"]/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[character])
    );
}


// ================================
// RENDERIZAR LA APP
// ================================

function render() {

    // Si está bloqueado mostramos el PIN
    if (!unlocked) {

        app.innerHTML = `
            <div
                class="shell"
                style="
                    min-height:100vh;
                    display:grid;
                    place-items:center;
                "
            >

                <div class="card modalbox pin">

                    <div class="logo">
                        P
                    </div>

                    <h2>
                        Pochaco
                    </h2>

                    <p style="color:#6b899b">
                        Ingresa tu PIN para abrir tu calendario.
                    </p>

                    <input
                        id="pin"
                        type="password"
                        inputmode="numeric"
                        maxlength="8"
                        placeholder="••••"
                    >

                    <div
                        id="err"
                        class="error"
                    ></div>

                    <button
                        class="btn primary"
                        onclick="unlock()"
                    >
                        Entrar
                    </button>

                </div>

            </div>
        `;

        setTimeout(() => {
            document
                .getElementById("pin")
                ?.focus();
        }, 50);

        return;
    }


    // ================================
    // DATOS DEL MES
    // ================================

    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    );

    // Convertimos domingo = 0 a lunes = 0
    const startDay =
        (firstDay.getDay() + 6) % 7;

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    // ================================
    // CREAR CELDAS DEL CALENDARIO
    // ================================

    let cells = "";

    for (let i = 0; i < 42; i++) {

        let day =
            i - startDay + 1;

        let displayYear = year;
        let displayMonth = month;

        let muted = false;


        // Días del mes anterior
        if (day < 1) {

            day =
                daysInPreviousMonth + day;

            displayMonth =
                month - 1;

            muted = true;

            if (displayMonth < 0) {

                displayMonth = 11;
                displayYear--;

            }
        }


        // Días del mes siguiente
        else if (day > daysInMonth) {

            day =
                day - daysInMonth;

            displayMonth =
                month + 1;

            muted = true;

            if (displayMonth > 11) {

                displayMonth = 0;
                displayYear++;

            }
        }


        // Fecha completa
        const key =
            `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        // Eventos de ese día
        const dayEvents =
            events.filter(
                event => event.date === key
            );


        // Fecha actual
        const today = new Date();

        const todayKey =
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;


        const isToday =
            key === todayKey;


        // Crear celda
        cells += `
            <div
                class="day ${muted ? "muted" : ""} ${isToday ? "today" : ""}"
                onclick="openAdd('${key}')"
            >

                <div class="num">
                    ${day}
                </div>

                ${
                    dayEvents
                        .map(event => `
                            <div
                                class="event ${event.reminder ? "reminder" : ""}"
                                title="${esc(event.title)}"
                            >
                                ${
                                    event.reminder
                                        ? "⏰ "
                                        : ""
                                }

                                ${esc(event.title)}
                            </div>
                        `)
                        .join("")
                }

            </div>
        `;
    }


    // ================================
    // PRÓXIMOS EVENTOS
    // ================================

    const todayDate =
        new Date()
            .toISOString()
            .slice(0, 10);

    const upcoming =
        events
            .filter(
                event =>
                    event.date >= todayDate
            )
            .sort(
                (a, b) =>
                    a.date.localeCompare(b.date)
            )
            .slice(0, 5);


    // ================================
    // HTML PRINCIPAL
    // ================================

    app.innerHTML = `

        <div class="shell">

            <!-- CABECERA -->

            <div class="topbar">

                <div class="brand">

                    <div class="logo">
                        P
                    </div>

                    <div>

                        <h1>
                            Pochaco
                        </h1>

                        <small>
                            Mi calendario personal
                        </small>

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        gap:8px;
                    "
                >

                    <button
                        class="btn"
                        onclick="openSettings()"
                    >
                        ⚙️ Ajustes
                    </button>

                    <button
                        class="btn"
                        onclick="lock()"
                    >
                        🔒 Bloquear
                    </button>

                </div>

            </div>


            <!-- CONTENIDO -->

            <div class="layout">


                <!-- CALENDARIO -->

                <section class="card">

                    <div class="calendar-head">

                        <div class="month">

                            <button
                                class="btn"
                                onclick="move(-1)"
                            >
                                ‹
                            </button>

                            <h2>
                                ${months[month]}
                                ${year}
                            </h2>

                            <button
                                class="btn"
                                onclick="move(1)"
                            >
                                ›
                            </button>

                        </div>


                        <button
                            class="btn primary"
                            onclick="openAdd()"
                        >
                            ＋ Nuevo
                        </button>

                    </div>


                    <!-- DÍAS -->

                    <div class="weekdays">

                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mié</div>
                        <div>Jue</div>
                        <div>Vie</div>
                        <div>Sáb</div>
                        <div>Dom</div>

                    </div>


                    <!-- CUADRÍCULA -->

                    <div class="grid">

                        ${cells}

                    </div>

                </section>


                <!-- PANEL LATERAL -->

                <aside class="card side">

                    <h3>
                        Próximos recordatorios
                    </h3>

                    <div class="upcoming">

                        ${
                            upcoming.length

                                ? upcoming
                                    .map(event => `
                                        <div class="item">

                                            <strong>
                                                ${
                                                    event.reminder
                                                        ? "⏰ "
                                                        : ""
                                                }

                                                ${esc(event.title)}
                                            </strong>

                                            <span>
                                                ${event.date}

                                                ${
                                                    event.time
                                                        ? " · " + event.time
                                                        : ""
                                                }
                                            </span>

                                            ${
                                                event.note
                                                    ? `
                                                        <span
                                                            style="
                                                                display:block;
                                                                margin-top:4px;
                                                            "
                                                        >
                                                            ${esc(event.note)}
                                                        </span>
                                                    `
                                                    : ""
                                            }

                                        </div>
                                    `)
                                    .join("")

                                : `
                                    <div class="empty">
                                        Todavía no tienes eventos.
                                    </div>
                                `
                        }

                    </div>

                </aside>

            </div>

        </div>


        <!-- ==========================
             MODAL NUEVO EVENTO
        =========================== -->

        <div
            id="modal"
            class="modal"
        >

            <div class="card modalbox">

                <h3 id="modalTitle">
                    Nuevo evento
                </h3>


                <label>
                    Fecha
                </label>

                <input
                    id="date"
                    type="date"
                >


                <label>
                    Título
                </label>

                <input
                    id="title"
                    placeholder="Ej. Entregar proyecto"
                >


                <label>
                    Hora (opcional)
                </label>

                <input
                    id="time"
                    type="time"
                >


                <label>
                    Nota (opcional)
                </label>

                <textarea
                    id="note"
                    placeholder="Escribe algo importante..."
                ></textarea>


                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        font-weight:700;
                    "
                >

                    <input
                        id="reminder"
                        type="checkbox"
                        style="width:auto"
                    >

                    Activar recordatorio

                </label>


                <div class="actions">

                    <button
                        class="btn"
                        onclick="closeModal()"
                    >
                        Cancelar
                    </button>

                    <button
                        class="btn primary"
                        onclick="addEvent()"
                    >
                        Guardar
                    </button>

                </div>

            </div>

        </div>


        <!-- ==========================
             AJUSTES
        =========================== -->

        <div
            id="settings"
            class="modal"
        >

            <div class="card settingsbox">

                <h3>
                    ⚙️ Ajustes de Pochaco
                </h3>


                <label>
                    Nuevo PIN
                </label>

                <input
                    id="newPin"
                    type="password"
                    inputmode="numeric"
                    maxlength="8"
                    placeholder="4 a 8 números"
                >


                <div class="hint">
                    El PIN se guarda solamente
                    en este navegador.
                </div>


                <div class="actions">

                    <button
                        class="btn"
                        onclick="closeSettings()"
                    >
                        Cancelar
                    </button>

                    <button
                        class="btn primary"
                        onclick="changePin()"
                    >
                        Guardar PIN
                    </button>

                </div>


                <hr
                    style="
                        border:0;
                        border-top:1px solid #d9eef7;
                        margin:20px 0;
                    "
                >


                <button
                    class="btn"
                    onclick="requestNotifications()"
                >
                    🔔 Activar notificaciones
                </button>


                <div class="hint">
                    Así el navegador podrá mostrar
                    avisos cuando abras el calendario.
                </div>

            </div>

        </div>

    `;


    // Revisar recordatorios
    checkReminders();
}


// ================================
// DESBLOQUEAR
// ================================

function unlock() {

    const pinInput =
        document.getElementById("pin");

    const error =
        document.getElementById("err");

    const value =
        pinInput.value;


    if (value === PIN) {

        unlocked = true;

        render();

    } else {

        error.textContent =
            "PIN incorrecto.";

        pinInput.value = "";

        pinInput.focus();
    }
}


// ================================
// BLOQUEAR
// ================================

function lock() {

    unlocked = false;

    render();
}


// ================================
// AJUSTES
// ================================

function openSettings() {

    document
        .getElementById("settings")
        .classList.add("open");
}


function closeSettings() {

    document
        .getElementById("settings")
        .classList.remove("open");
}


// ================================
// CAMBIAR PIN
// ================================

function changePin() {

    const input =
        document.getElementById("newPin");

    const value =
        input.value;


    if (!/^\d{4,8}$/.test(value)) {

        alert(
            "El PIN debe tener entre 4 y 8 números."
        );

        return;
    }


    PIN = value;

    localStorage.setItem(
        "pochacoPin",
        PIN
    );


    input.value = "";

    closeSettings();


    alert(
        "PIN actualizado correctamente."
    );
}


// ================================
// NOTIFICACIONES
// ================================

async function requestNotifications() {

    if (!("Notification" in window)) {

        alert(
            "Este navegador no permite notificaciones."
        );

        return;
    }


    const permission =
        await Notification.requestPermission();


    if (permission === "granted") {

        alert(
            "Notificaciones activadas."
        );

    } else {

        alert(
            "No se activaron las notificaciones."
        );
    }
}


// ================================
// COMPROBAR RECORDATORIOS
// ================================

function checkReminders() {

    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }


    const now = new Date();


    const today =
        now.toISOString().slice(0, 10);


    const currentHour =
        String(now.getHours()).padStart(2, "0");


    const currentMinute =
        String(now.getMinutes()).padStart(2, "0");


    const currentTime =
        currentHour + ":" + currentMinute;


    events
        .filter(event =>

            event.reminder &&
            event.date === today &&
            event.time &&
            event.time <= currentTime &&
            !event.notified

        )
        .forEach(event => {

            new Notification(
                "Pochaco — recordatorio",
                {
                    body: event.title
                }
            );


            event.notified = true;
        });


    save();
}


// ================================
// CAMBIAR MES
// ================================

function move(amount) {

    current.setMonth(
        current.getMonth() + amount
    );

    render();
}


// ================================
// ABRIR NUEVO EVENTO
// ================================

function openAdd(date) {

    if (!date) {

        date =
            new Date()
                .toISOString()
                .slice(0, 10);
    }


    const modal =
        document.getElementById("modal");


    modal.classList.add("open");


    document.getElementById("date").value =
        date;


    document.getElementById("title").value =
        "";


    document.getElementById("time").value =
        "";


    document.getElementById("note").value =
        "";


    document.getElementById("reminder").checked =
        false;


    document
        .getElementById("title")
        .focus();
}


// ================================
// CERRAR MODAL
// ================================

function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("open");
}


// ================================
// AGREGAR EVENTO
// ================================

function addEvent() {

    const title =
        document
            .getElementById("title")
            .value
            .trim();


    const date =
        document
            .getElementById("date")
            .value;


    const time =
        document
            .getElementById("time")
            .value;


    const note =
        document
            .getElementById("note")
            .value
            .trim();


    const reminder =
        document
            .getElementById("reminder")
            .checked;


    // Comprobar datos
    if (!title || !date) {

        alert(
            "Escribe un título y una fecha."
        );

        return;
    }


    // Crear evento
    const newEvent = {

        id: Date.now(),

        title: title,

        date: date,

        time: time,

        note: note,

        reminder: reminder,

        notified: false
    };


    // Guardar
    events.push(newEvent);

    save();


    // Cerrar ventana
    closeModal();


    // Actualizar calendario
    render();
}


// ================================
// REVISAR RECORDATORIOS CADA 30 SEG.
// ================================

setInterval(
    checkReminders,
    30000
);


// ================================
// INICIAR POCHACO
// ================================

render();