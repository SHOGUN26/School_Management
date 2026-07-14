// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3000";
const api = (path) => `${API_BASE}${path}`;

// ─────────────────────────────────────────────────────────
// GARDE D'ACCÈS — redirige vers la connexion si pas de token
// ─────────────────────────────────────────────────────────
const token = localStorage.getItem("auth_token");
const role = localStorage.getItem("auth_role");
const profile = JSON.parse(localStorage.getItem("auth_profile") || "null");

if (!token || role !== "student" || !profile?.student) {
  window.location.href = "index.html";
}

const studentId = profile.student.id;

// ─────────────────────────────────────────────────────────
// APPEL API AVEC AUTHENTIFICATION
// ─────────────────────────────────────────────────────────
const request = async (path, options = {}) => {
  const response = await fetch(api(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_profile");
    window.location.href = "index.html";
    return null;
  }

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Une erreur est survenue.");
  }

  return data;
};

// ─────────────────────────────────────────────────────────
// ÉLÉMENTS PARTAGÉS
// ─────────────────────────────────────────────────────────
const content = document.getElementById("content");
const viewTitle = document.getElementById("viewTitle");
const viewSub = document.getElementById("viewSub");
const banner = document.getElementById("banner");
const nav = document.getElementById("dashNav");

const VIEW_META = {
  notes: ["Mes notes", "Toutes vos notes, matière par matière."],
  "moyenne-generale": ["Moyenne générale", "Votre moyenne toutes matières confondues."],
  "moyenne-matiere": ["Moyenne par matière", "Votre moyenne dans une matière précise."],
  absences: ["Mes absences", "L'historique complet de vos absences."],
};

const showBanner = (message, type = "ok") => {
  banner.textContent = message;
  banner.className = `dash__banner ${type}`;
  banner.hidden = false;
  setTimeout(() => { banner.hidden = true; }, 4000);
};

// ─────────────────────────────────────────────────────────
// NAVIGATION ENTRE VUES
// ─────────────────────────────────────────────────────────
nav.addEventListener("click", (e) => {
  const btn = e.target.closest(".navitem");
  if (!btn) return;

  nav.querySelectorAll(".navitem").forEach((n) => n.classList.remove("is-active"));
  btn.classList.add("is-active");

  const view = btn.dataset.view;
  const [title, sub] = VIEW_META[view];
  viewTitle.textContent = title;
  viewSub.textContent = sub;

  renderView(view);
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_profile");
  window.location.href = "index.html";
});

const renderView = (view) => {
  content.innerHTML = `<p class="loading-hint">Chargement…</p>`;
  const renderers = {
    notes: renderNotes,
    "moyenne-generale": renderMoyenneGenerale,
    "moyenne-matiere": renderMoyenneMatiere,
    absences: renderAbsences,
  };
  renderers[view]().catch((err) => {
    content.innerHTML = `<p class="loading-hint">${err.message}</p>`;
  });
};

// ─────────────────────────────────────────────────────────
// VUE — MES NOTES
// ─────────────────────────────────────────────────────────
const renderNotes = async () => {
  const grades = await request(`/api/grades/student/${studentId}`);

  const rows = grades.length
    ? grades.map((g) => `
        <tr>
          <td>${g.matiere}</td>
          <td class="mono">${g.note}/20</td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="2">Aucune note enregistrée pour le moment.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Mes notes</p></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>Matière</th><th>Note</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
};

// ─────────────────────────────────────────────────────────
// VUE — MOYENNE GÉNÉRALE
// ─────────────────────────────────────────────────────────
const renderMoyenneGenerale = async () => {
  const data = await request(`/api/grades/student/${studentId}/average`);

  const label = data.average !== null
    ? `${data.average.toFixed(2)}/20`
    : "Aucune note enregistrée pour le moment.";

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Moyenne générale</p></div>
      <p style="font-family: var(--font-display); font-size: 2.4rem; margin: 0.2rem 0 0;">${label}</p>
    </div>
  `;
};

// ─────────────────────────────────────────────────────────
// VUE — MOYENNE PAR MATIÈRE
// ─────────────────────────────────────────────────────────
const renderMoyenneMatiere = async () => {
  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Moyenne dans une matière</p></div>
      <form class="inline-form" id="formMatiere">
        <div class="field"><label>Nom de la matière</label><input name="nom" placeholder="ex. Mathématiques" required /></div>
        <button class="btn-small" type="submit">Voir</button>
      </form>
      <div id="matiereResult" style="margin-top:1rem;"></div>
    </div>
  `;

  document.getElementById("formMatiere").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = new FormData(e.target).get("nom").trim();
    const resultDiv = document.getElementById("matiereResult");

    try {
      const subject = await request(`/api/subjects/name/${encodeURIComponent(nom)}`);
      const data = await request(`/api/grades/student/${studentId}/subject/${subject.id}/average`);

      resultDiv.innerHTML = data.average !== null
        ? `<p style="font-family: var(--font-display); font-size: 2.2rem; margin: 0.2rem 0 0;">${data.average.toFixed(2)}/20</p>`
        : `<p class="loading-hint">Aucune note pour cette matière.</p>`;
    } catch (err) {
      resultDiv.innerHTML = `<p class="loading-hint">Matière introuvable : "${nom}".</p>`;
    }
  });
};

// ─────────────────────────────────────────────────────────
// VUE — MES ABSENCES
// ─────────────────────────────────────────────────────────
const renderAbsences = async () => {
  const [absences, countData] = await Promise.all([
    request(`/api/absences/student/${studentId}`),
    request(`/api/absences/student/${studentId}/count-unjustified`),
  ]);

  const rows = absences.length
    ? absences.map((a) => `
        <tr>
          <td>${a.date}</td>
          <td>${a.status}</td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="2">Aucune absence enregistrée.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Mes absences</p></div>
      <p class="loading-hint">
        Total : ${absences.length} — Non justifiées : ${countData.absences_non_justifiees}
      </p>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>Date</th><th>Statut</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
};

// ─────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────
document.getElementById("whoamiName").textContent = `${profile.student.nom} ${profile.student.prenom}`;
document.getElementById("whoamiClasse").textContent = profile.student.classe;
renderView("notes");