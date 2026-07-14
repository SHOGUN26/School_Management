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

if (!token || role !== "enseignant" || !profile?.teacher) {
  window.location.href = "index.html";
}

const teacherId = profile.teacher.id;

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
  classes: ["Mes classes", "Les classes qui vous sont assignées."],
  matieres: ["Matières", "Vue d'ensemble des matières de l'école."],
  absences: ["Absences", "Historique des absences par étudiant."],
  notes: ["Notes", "Ajout, modification et suppression des notes."],
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
    classes: renderClasses,
    matieres: renderMatieres,
    absences: renderAbsences,
    notes: renderNotes,
  };
  renderers[view]().catch((err) => {
    content.innerHTML = `<p class="loading-hint">${err.message}</p>`;
  });
};

// ─────────────────────────────────────────────────────────
// VUE — MES CLASSES (+ étudiants par classe)
// ─────────────────────────────────────────────────────────
const renderClasses = async () => {
  const classes = await request(`/api/teacher-classes/teacher/${teacherId}`);

  const options = classes.length
    ? classes.map((c) => `<option value="${c.classe}">${c.classe}</option>`).join("")
    : "";

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Vos classes assignées</p></div>
      ${classes.length
        ? `<div class="table-wrap"><table class="ledger">
             <thead><tr><th>Classe</th></tr></thead>
             <tbody>${classes.map((c) => `<tr><td>${c.classe}</td></tr>`).join("")}</tbody>
           </table></div>`
        : `<p class="loading-hint">Aucune classe ne vous est assignée pour le moment.</p>`}
    </div>

    ${classes.length ? `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Étudiants d'une classe</p></div>
      <form class="inline-form" id="formClasseStudents">
        <div class="field">
          <label>Classe</label>
          <select name="classe">${options}</select>
        </div>
        <button class="btn-small" type="submit">Afficher</button>
      </form>
      <div class="table-wrap" id="classeStudentsResult" style="margin-top:1rem;"></div>
    </div>
    ` : ""}
  `;

  if (!classes.length) return;

  document.getElementById("formClasseStudents").addEventListener("submit", async (e) => {
    e.preventDefault();
    const classe = new FormData(e.target).get("classe");
    const resultDiv = document.getElementById("classeStudentsResult");
    try {
      const students = await request(
        `/api/teacher-classes/teacher/${teacherId}/classe/${encodeURIComponent(classe)}/students`
      );

      const rows = students.length
        ? students.map((s) => `
            <tr>
              <td class="mono">${s.id}</td>
              <td class="mono">${s.matricule}</td>
              <td>${s.nom}</td>
              <td>${s.prenom}</td>
              <td>${s.age}</td>
            </tr>
          `).join("")
        : `<tr class="empty-row"><td colspan="5">Aucun étudiant dans cette classe.</td></tr>`;

      resultDiv.innerHTML = `
        <table class="ledger">
          <thead><tr><th>ID</th><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Âge</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } catch (err) {
      showBanner(err.message, "error");
    }
  });
};

// ─────────────────────────────────────────────────────────
// VUE — MATIÈRES (lecture seule)
// ─────────────────────────────────────────────────────────
const renderMatieres = async () => {
  const subjects = await request("/api/subjects");

  const rows = subjects.length
    ? subjects.map((s) => `
        <tr>
          <td class="mono">${s.id}</td>
          <td>${s.nom}</td>
          <td class="mono">${s.teacher_id ?? "—"}</td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="3">Aucune matière enregistrée.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Toutes les matières</p></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>ID</th><th>Nom</th><th>ID Prof</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
};

// ─────────────────────────────────────────────────────────
// VUE — ABSENCES (historique par étudiant)
// ─────────────────────────────────────────────────────────
const renderAbsences = async () => {
  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Historique des absences</p></div>
      <form class="inline-form" id="formSearchAbsence">
        <div class="field"><label>ID étudiant</label><input name="student_id" type="number" required /></div>
        <button class="btn-small" type="submit">Rechercher</button>
      </form>
      <div class="table-wrap" id="absencesResult" style="margin-top:1rem;"></div>
    </div>
  `;

  document.getElementById("formSearchAbsence").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = new FormData(e.target).get("student_id");
    const resultDiv = document.getElementById("absencesResult");
    try {
      const [absences, countData] = await Promise.all([
        request(`/api/absences/student/${studentId}`),
        request(`/api/absences/student/${studentId}/count-unjustified`),
      ]);

      const rows = absences.length
        ? absences.map((a) => `
            <tr>
              <td class="mono">${a.id}</td>
              <td>${a.date}</td>
              <td>${a.status}</td>
            </tr>
          `).join("")
        : `<tr class="empty-row"><td colspan="3">Aucune absence trouvée.</td></tr>`;

      resultDiv.innerHTML = `
        <p class="loading-hint">Non justifiées : ${countData.absences_non_justifiees}</p>
        <table class="ledger">
          <thead><tr><th>ID</th><th>Date</th><th>Statut</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } catch (err) {
      showBanner(err.message, "error");
    }
  });
};

// ─────────────────────────────────────────────────────────
// VUE — NOTES (ajouter / modifier / supprimer)
// ─────────────────────────────────────────────────────────
const renderNotes = async () => {
  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Ajouter une note</p></div>
      <form class="inline-form" id="formGrade">
        <div class="field"><label>ID étudiant</label><input name="student_id" type="number" required /></div>
        <div class="field"><label>ID matière</label><input name="subject_id" type="number" required /></div>
        <div class="field"><label>Note /20</label><input name="note" type="number" min="0" max="20" step="0.5" required /></div>
        <button class="btn-small" type="submit">Ajouter</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Modifier ou supprimer une note</p></div>
      <form class="inline-form" id="formEditGrade">
        <div class="field"><label>ID note</label><input name="id" type="number" required /></div>
        <div class="field"><label>Nouvelle note /20</label><input name="note" type="number" min="0" max="20" step="0.5" /></div>
        <button class="btn-small" type="submit" data-action="update">Modifier</button>
        <button class="icon-btn danger" type="submit" data-action="delete">Supprimer</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Notes d'un étudiant</p></div>
      <form class="inline-form" id="formSearchGrades">
        <div class="field"><label>ID étudiant</label><input name="student_id" type="number" required /></div>
        <button class="btn-small" type="submit">Rechercher</button>
      </form>
      <div class="table-wrap" id="gradesResult" style="margin-top:1rem;"></div>
    </div>
  `;

  document.getElementById("formGrade").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const note = Number(fd.get("note"));

    if (note < 0 || note > 20) {
      showBanner("La note doit être comprise entre 0 et 20.", "error");
      return;
    }

    try {
      await request("/api/grades", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(fd.get("student_id")),
          subject_id: Number(fd.get("subject_id")),
          note,
        }),
      });
      showBanner("Note ajoutée.");
      e.target.reset();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  document.getElementById("formEditGrade").addEventListener("submit", async (e) => {
    e.preventDefault();
    const action = e.submitter?.dataset.action || "update";
    const fd = new FormData(e.target);
    const id = fd.get("id");

    try {
      if (action === "delete") {
        if (!confirm("Supprimer cette note ?")) return;
        await request(`/api/grades/${id}`, { method: "DELETE" });
        showBanner("Note supprimée.");
      } else {
        const note = Number(fd.get("note"));
        if (note < 0 || note > 20) {
          showBanner("La note doit être comprise entre 0 et 20.", "error");
          return;
        }
        await request(`/api/grades/${id}`, {
          method: "PUT",
          body: JSON.stringify({ note }),
        });
        showBanner("Note modifiée.");
      }
      e.target.reset();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  document.getElementById("formSearchGrades").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = new FormData(e.target).get("student_id");
    const resultDiv = document.getElementById("gradesResult");
    try {
      const [grades, averageData] = await Promise.all([
        request(`/api/grades/student/${studentId}`),
        request(`/api/grades/student/${studentId}/average`),
      ]);

      const rows = grades.length
        ? grades.map((g) => `
            <tr>
              <td>${g.matiere}</td>
              <td class="mono">${g.note}/20</td>
            </tr>
          `).join("")
        : `<tr class="empty-row"><td colspan="2">Aucune note trouvée.</td></tr>`;

      const avgLabel = averageData.average !== null ? `${averageData.average.toFixed(2)}/20` : "N/A";

      resultDiv.innerHTML = `
        <p class="loading-hint">Moyenne générale : ${avgLabel}</p>
        <table class="ledger">
          <thead><tr><th>Matière</th><th>Note</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } catch (err) {
      showBanner(err.message, "error");
    }
  });
};

// ─────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────
document.getElementById("whoamiName").textContent = profile.teacher.nom;
document.getElementById("whoamiMatiere").textContent = profile.teacher.matiere;
renderView("classes");