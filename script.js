let PIN = localStorage.getItem('pochacoPin') || "1234";
let unlocked = false;
let current = new Date();

let events = JSON.parse(
    localStorage.getItem('pochacoEvents') || '[]'
);

const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];

const app = document.getElementById('app');

function save() {
    localStorage.setItem(
        'pochacoEvents',
        JSON.stringify(events)
    );
}

function esc(s) {
    return String(s).replace(
        /[&<>'"]/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[c])
    );
}

function getGreeting() {

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return {
            title: "Buenos días, Luuu",
            message: "Esperamos que tengas un día bonito 😊"
        };
    }

    if (hour >= 12 && hour < 19) {
        return {
            title: "Buenas tardes, Luuu",
            message: "¿Cómo va tu día? 😊"
        };
    }

    return {
        title: "Buenas noches, Luuu",
        message: "Te extrañaremos 😊"
    };
}

function render() {

    if (!unlocked) {

        app.innerHTML = `
            <div
                class="shell"
                style="min-height:100vh;display:grid;place-items:center"
            >
                <div class="card modalbox pin">

                    <div class="logo">P</div>

                    <h2>Pochaco</h2>

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

                    <div id="err" class="error"></div>

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
            document.getElementById('pin')?.focus();
        }, 50);

        return;
    }

    const y = current.getFullYear();
    const m = current.getMonth();

    const greeting = getGreeting();

    const first = new Date(y, m, 1);
    const start = (first.getDay() + 6) % 7;

    const days = new Date(
        y,
        m + 1,
        0
    ).getDate();

    const prevDays = new Date(
        y,
        m,
        0
    ).getDate();

    let cells = '';

    for (let i = 0; i < 42; i++) {

        let d = i - start + 1;
        let yy = y;
        let mm = m;
        let muted = false;

        if (d < 1) {

            d = prevDays + d;
            mm = m - 1;
            muted = true;

            if (mm < 0) {
                mm = 11;
                yy--;
            }

        } else if (d > days) {

            d = d - days;
            mm = m + 1;
            muted = true;

            if (mm > 11) {
                mm = 0;
                yy++;
            }
        }

        const key =
            `${yy}-${String(mm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const ev = events.filter(
            e => e.date === key
        );

        const today = new Date();

        const istoday =
            key ===
            `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, '0')}-${String(
                today.getDate()
            ).padStart(2, '0')}`;

        cells += `
            <div
                class="day ${muted ? 'muted' : ''} ${istoday ? 'today' : ''}"
                onclick="openAdd('${key}')"
            >

                <div class="num">${d}</div>

                ${ev.map(e => `
                    <div
                        class="event ${e.reminder ? 'reminder' : ''}"
                        title="${esc(e.title)}"
                    >
                        ${e.reminder ? '⏰ ' : ''}
                        ${esc(e.title)}
                    </div>
                `).join('')}

            </div>
        `;
    }

    const todayString =
        new Date().toISOString().slice(0, 10);

    const upcoming = events
        .filter(e => e.date >= todayString)
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        )
        .slice(0, 5);

    app.innerHTML = `

        <div class="shell">

            <div class="topbar">

                <div class="brand">

                    <div class="logo">P</div>

                    <div>
                        <h1>Pochaco</h1>
                        <small>Mi calendario personal</small>
                    </div>

                </div>

                <div style="display:flex;gap:8px">

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

            <div
                class="card"
                style="
                    padding:20px;
                    margin-bottom:18px;
                    background:linear-gradient(
                        135deg,
                        #fff7fb,
                        #f2fbff
                    )
                "
            >

                <h2
                    style="
                        margin:0 0 6px;
                        color:#687b91
                    "
                >
                    ${greeting.title}
                </h2>

                <p
                    style="
                        margin:0;
                        color:#8796a5
                    "
                >
                    ${greeting.message}
                </p>

            </div>

            <div class="layout">

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
                                ${months[m]} ${y}
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

                    <div class="weekdays">

                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mié</div>
                        <div>Jue</div>
                        <div>Vie</div>
                        <div>Sáb</div>
                        <div>Dom</div>

                    </div>

                    <div class="grid">
                        ${cells}
                    </div>

                </section>

                <aside class="card side">

                    <h3>
                        Próximos recordatorios
                    </h3>

                    <div class="upcoming">

                        ${
                            upcoming.length
                                ? upcoming.map(e => `
                                    <div class="item">

                                        <strong>
                                            ${e.reminder ? '⏰ ' : ''}
                                            ${esc(e.title)}
                                        </strong>

                                        <span>
                                            ${e.date}
                                            ${e.time ? ' · ' + e.time : ''}
                                        </span>

                                        ${
                                            e.note
                                                ? `
                                                    <span
                                                        style="
                                                            display:block;
                                                            margin-top:4px
                                                        "
                                                    >
                                                        ${esc(e.note)}
                                                    </span>
                                                `
                                                : ''
                                        }

                                    </div>
                                `).join('')
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

        <div id="modal" class="modal">

            <div class="card modalbox">

                <h3 id="modalTitle">
                    Nuevo evento
                </h3>

                <label>Fecha</label>

                <input
                    id="date"
                    type="date"
                >

                <label>Título</label>

                <input
                    id="title"
                    placeholder="Ej. Entregar proyecto"
                >

                <label>Hora (opcional)</label>

                <input
                    id="time"
                    type="time"
                >

                <label>Nota (opcional)</label>

                <textarea
                    id="note"
                    placeholder="Escribe algo importante..."
                ></textarea>

                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        font-weight:700
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

        <div id="settings" class="modal">

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
                    El PIN se guarda solamente en este navegador.
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
                        margin:20px 0
                    "
                >

                <button
                    class="btn"
                    onclick="requestNotifications()"
                >
                    🔔 Activar notificaciones
                </button>

                <div class="hint">
                    Así el navegador podrá mostrar avisos
                    cuando abras el calendario.
                </div>

            </div>

        </div>
    `;

    checkReminders();
}

function unlock() {

    const v =
        document.getElementById('pin').value;

    if (v === PIN) {

        unlocked = true;
        render();

    } else {

        document.getElementById('err').textContent =
            'PIN incorrecto.';

        document.getElementById('pin').value = '';
    }
}

function lock() {

    unlocked = false;
    render();
}

function openSettings() {

    document
        .getElementById('settings')
        .classList.add('open');
}

function closeSettings() {

    document
        .getElementById('settings')
        .classList.remove('open');
}

function changePin() {

    const v =
        document.getElementById('newPin').value;

    if (!/^\d{4,8}$/.test(v)) {

        return alert(
            'El PIN debe tener entre 4 y 8 números.'
        );
    }

    PIN = v;

    localStorage.setItem(
        'pochacoPin',
        PIN
    );

    closeSettings();

    alert(
        'PIN actualizado correctamente.'
    );
}

async function requestNotifications() {

    if (!('Notification' in window)) {

        return alert(
            'Este navegador no permite notificaciones.'
        );
    }

    const p =
        await Notification.requestPermission();

    alert(
        p === 'granted'
            ? 'Notificaciones activadas.'
            : 'No se activaron las notificaciones.'
    );
}

function checkReminders() {

    if (
        !('Notification' in window) ||
        Notification.permission !== 'granted'
    ) {
        return;
    }

    const now = new Date();

    const today =
        now.toISOString().slice(0, 10);

    const hm =
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0');

    events
        .filter(
            e =>
                e.reminder &&
                e.date === today &&
                e.time &&
                e.time <= hm &&
                !e.notified
        )
        .forEach(e => {

            new Notification(
                'Pochaco — recordatorio',
                {
                    body: e.title
                }
            );

            e.notified = true;
        });

    save();
}

function move(n) {

    current.setMonth(
        current.getMonth() + n
    );

    render();
}

function openAdd(date) {

    if (!date) {

        date =
            new Date()
                .toISOString()
                .slice(0, 10);
    }

    document
        .getElementById('modal')
        .classList.add('open');

    document
        .getElementById('date')
        .value = date;

    document
        .getElementById('title')
        .focus();
}

function closeModal() {

    document
        .getElementById('modal')
        .classList.remove('open');
}

function addEvent() {

    const title =
        document
            .getElementById('title')
            .value
            .trim();

    const date =
        document
            .getElementById('date')
            .value;

    if (!title || !date) {

        return alert(
            'Escribe un título y una fecha.'
        );
    }

    events.push({

        id: Date.now(),

        title: title,

        date: date,

        time:
            document
                .getElementById('time')
                .value,

        note:
            document
                .getElementById('note')
                .value,

        reminder:
            document
                .getElementById('reminder')
                .checked,

        notified: false

    });

    save();

    closeModal();

    render();
}

setInterval(
    checkReminders,
    30000
);

render();