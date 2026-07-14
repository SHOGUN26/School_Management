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

if (!token || role !== "admin") {
  window.location.href = "index.html";
}

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
  etudiants: ["Étudiants", "Liste, ajout et suppression des étudiants inscrits."],
  professeurs: ["Professeurs", "Liste, ajout, suppression et classes assignées."],
  absences: ["Absences", "Enregistrement et consultation par étudiant."],
  notes: ["Notes", "Ajout et consultation des notes par étudiant."],
  matieres: ["Matières", "Liste, ajout et suppression des matières."],
  utilisateurs: ["Utilisateurs", "Comptes de connexion, tous rôles confondus."],
  stats: ["Statistiques", "Moyennes et meilleurs résultats par matière."],
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
  window.location.href = "index.html";
});

const renderView = (view) => {
  content.innerHTML = `<p class="loading-hint">Chargement…</p>`;
  const renderers = {
    etudiants: renderEtudiants,
    professeurs: renderProfesseurs,
    absences: renderAbsences,
    notes: renderNotes,
    matieres: renderMatieres,
    utilisateurs: renderUtilisateurs,
    stats: renderStats,
  };
  renderers[view]().catch((err) => {
    content.innerHTML = `<p class="loading-hint">${err.message}</p>`;
  });
};

// ─────────────────────────────────────────────────────────
// VUE — ÉTUDIANTS
// ─────────────────────────────────────────────────────────
const renderEtudiants = async () => {
  const [students, users] = await Promise.all([
    request("/api/students"),
    request("/api/users"),
  ]);

  // Comptes "student" — utilisés pour lier un étudiant à son compte de connexion
  const studentUsers = users.filter((u) => u.role === "student");
  const userOptions = (selectedId) => `
    <option value="">— aucun —</option>
    ${studentUsers.map((u) => `
      <option value="${u.id}" ${Number(selectedId) === u.id ? "selected" : ""}>
        #${u.id} · ${u.name} (${u.pseudo})
      </option>
    `).join("")}
  `;

  const userLabel = (userId) => {
    if (!userId) return "—";
    const u = users.find((x) => x.id === userId);
    return u ? `#${u.id} · ${u.pseudo}` : `#${userId}`;
  };

  const rows = students.length
    ? students.map((s) => `
        <tr>
          <td class="mono">${s.id}</td>
          <td class="mono">${s.matricule}</td>
          <td>${s.nom}</td>
          <td>${s.prenom}</td>
          <td>${s.age}</td>
          <td>${s.classe}</td>
          <td class="mono">${userLabel(s.user_id)}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-action="edit-student" data-id="${s.id}">modifier</button>
              <button class="icon-btn danger" data-action="delete-student" data-id="${s.id}">supprimer</button>
            </div>
          </td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="8">Aucun étudiant enregistré.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head">
        <p class="panel-card__title">Ajouter un étudiant</p>
      </div>
      ${!studentUsers.length ? `
        <p class="loading-hint" style="margin-bottom:0.9rem;">
          Aucun compte de rôle « Étudiant » disponible pour l'instant — crée-le d'abord dans « Utilisateurs »,
          ou ajoute l'étudiant sans le lier et fais la liaison plus tard via « modifier ».
        </p>` : ""}
      <form class="inline-form" id="formStudent">
        <div class="field"><label>Matricule</label><input name="matricule" required /></div>
        <div class="field"><label>Nom</label><input name="nom" required /></div>
        <div class="field"><label>Prénom</label><input name="prenom" required /></div>
        <div class="field"><label>Âge</label><input name="age" type="number" min="1" required /></div>
        <div class="field"><label>Classe</label><input name="classe" placeholder="ex. 1er A1" required /></div>
        <div class="field">
          <label>Compte lié</label>
          <select name="user_id">${userOptions(null)}</select>
        </div>
        <button class="btn-small" type="submit">Ajouter</button>
      </form>
    </div>

    <div class="panel-card" id="editStudentCard" hidden>
      <div class="panel-card__head"><p class="panel-card__title">Modifier l'étudiant</p></div>
      <form class="inline-form" id="formEditStudent">
        <input type="hidden" name="id" />
        <div class="field"><label>Matricule</label><input name="matricule" required /></div>
        <div class="field"><label>Nom</label><input name="nom" required /></div>
        <div class="field"><label>Prénom</label><input name="prenom" required /></div>
        <div class="field"><label>Âge</label><input name="age" type="number" min="1" required /></div>
        <div class="field"><label>Classe</label><input name="classe" required /></div>
        <div class="field">
          <label>Compte lié</label>
          <select name="user_id" id="editStudentUserSelect"></select>
        </div>
        <button class="btn-small" type="submit">Enregistrer</button>
        <button class="icon-btn" type="button" id="cancelEditStudent">annuler</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Liste des étudiants</p></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>ID</th><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Âge</th><th>Classe</th><th>Compte lié</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("formStudent").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const userId = fd.get("user_id");
    try {
      await request("/api/students", {
        method: "POST",
        body: JSON.stringify({
          matricule: fd.get("matricule"),
          nom: fd.get("nom"),
          prenom: fd.get("prenom"),
          age: Number(fd.get("age")),
          classe: fd.get("classe"),
          user_id: userId ? Number(userId) : null,
        }),
      });
      showBanner("Étudiant ajouté.");
      renderEtudiants();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  const editCard = document.getElementById("editStudentCard");
  const editForm = document.getElementById("formEditStudent");

  content.querySelectorAll('[data-action="edit-student"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = students.find((x) => x.id === Number(btn.dataset.id));
      if (!s) return;

      editForm.id.value = s.id;
      editForm.matricule.value = s.matricule;
      editForm.nom.value = s.nom;
      editForm.prenom.value = s.prenom;
      editForm.age.value = s.age;
      editForm.classe.value = s.classe;
      document.getElementById("editStudentUserSelect").innerHTML = userOptions(s.user_id);

      editCard.hidden = false;
      editCard.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.getElementById("cancelEditStudent").addEventListener("click", () => {
    editCard.hidden = true;
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const userId = fd.get("user_id");
    try {
      await request(`/api/students/${fd.get("id")}`, {
        method: "PUT",
        body: JSON.stringify({
          matricule: fd.get("matricule"),
          nom: fd.get("nom"),
          prenom: fd.get("prenom"),
          age: Number(fd.get("age")),
          classe: fd.get("classe"),
          user_id: userId ? Number(userId) : null,
        }),
      });
      showBanner("Étudiant modifié.");
      renderEtudiants();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  content.querySelectorAll('[data-action="delete-student"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Supprimer cet étudiant et toutes ses données liées ?")) return;
      try {
        await request(`/api/students/${btn.dataset.id}`, { method: "DELETE" });
        showBanner("Étudiant supprimé.");
        renderEtudiants();
      } catch (err) {
        showBanner(err.message, "error");
      }
    });
  });
};

// ─────────────────────────────────────────────────────────
// VUE — PROFESSEURS
// ─────────────────────────────────────────────────────────
const renderProfesseurs = async () => {
  const [teachers, users] = await Promise.all([
    request("/api/teachers"),
    request("/api/users"),
  ]);

  const teacherUsers = users.filter((u) => u.role === "enseignant");
  const userOptions = (selectedId) => `
    <option value="">— aucun —</option>
    ${teacherUsers.map((u) => `
      <option value="${u.id}" ${Number(selectedId) === u.id ? "selected" : ""}>
        #${u.id} · ${u.name} (${u.pseudo})
      </option>
    `).join("")}
  `;

  const userLabel = (userId) => {
    if (!userId) return "—";
    const u = users.find((x) => x.id === userId);
    return u ? `#${u.id} · ${u.pseudo}` : `#${userId}`;
  };

  const rows = teachers.length
    ? teachers.map((t) => `
        <tr>
          <td class="mono">${t.id}</td>
          <td>${t.nom}</td>
          <td>${t.matiere}</td>
          <td class="mono">${userLabel(t.user_id)}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-action="edit-teacher" data-id="${t.id}">modifier</button>
              <button class="icon-btn danger" data-action="delete-teacher" data-id="${t.id}">supprimer</button>
            </div>
          </td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="5">Aucun professeur enregistré.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Ajouter un professeur</p></div>
      ${!teacherUsers.length ? `
        <p class="loading-hint" style="margin-bottom:0.9rem;">
          Aucun compte de rôle « Enseignant » disponible pour l'instant — crée-le d'abord dans « Utilisateurs »,
          ou ajoute le professeur sans le lier et fais la liaison plus tard via « modifier ».
        </p>` : ""}
      <form class="inline-form" id="formTeacher">
        <div class="field"><label>Nom</label><input name="nom" required /></div>
        <div class="field"><label>Matière</label><input name="matiere" required /></div>
        <div class="field">
          <label>Compte lié</label>
          <select name="user_id">${userOptions(null)}</select>
        </div>
        <button class="btn-small" type="submit">Ajouter</button>
      </form>
    </div>

    <div class="panel-card" id="editTeacherCard" hidden>
      <div class="panel-card__head"><p class="panel-card__title">Modifier le professeur</p></div>
      <form class="inline-form" id="formEditTeacher">
        <input type="hidden" name="id" />
        <div class="field"><label>Nom</label><input name="nom" required /></div>
        <div class="field"><label>Matière</label><input name="matiere" required /></div>
        <div class="field">
          <label>Compte lié</label>
          <select name="user_id" id="editTeacherUserSelect"></select>
        </div>
        <button class="btn-small" type="submit">Enregistrer</button>
        <button class="icon-btn" type="button" id="cancelEditTeacher">annuler</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Liste des professeurs</p></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>ID</th><th>Nom</th><th>Matière</th><th>Compte lié</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("formTeacher").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const userId = fd.get("user_id");
    try {
      await request("/api/teachers", {
        method: "POST",
        body: JSON.stringify({
          nom: fd.get("nom"),
          matiere: fd.get("matiere"),
          user_id: userId ? Number(userId) : null,
        }),
      });
      showBanner("Professeur ajouté.");
      renderProfesseurs();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  const editCard = document.getElementById("editTeacherCard");
  const editForm = document.getElementById("formEditTeacher");

  content.querySelectorAll('[data-action="edit-teacher"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = teachers.find((x) => x.id === Number(btn.dataset.id));
      if (!t) return;

      editForm.id.value = t.id;
      editForm.nom.value = t.nom;
      editForm.matiere.value = t.matiere;
      document.getElementById("editTeacherUserSelect").innerHTML = userOptions(t.user_id);

      editCard.hidden = false;
      editCard.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.getElementById("cancelEditTeacher").addEventListener("click", () => {
    editCard.hidden = true;
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const userId = fd.get("user_id");
    try {
      await request(`/api/teachers/${fd.get("id")}`, {
        method: "PUT",
        body: JSON.stringify({
          nom: fd.get("nom"),
          matiere: fd.get("matiere"),
          user_id: userId ? Number(userId) : null,
        }),
      });
      showBanner("Professeur modifié.");
      renderProfesseurs();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  content.querySelectorAll('[data-action="delete-teacher"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Supprimer ce professeur et ses matières/notes liées ?")) return;
      try {
        await request(`/api/teachers/${btn.dataset.id}`, { method: "DELETE" });
        showBanner("Professeur supprimé.");
        renderProfesseurs();
      } catch (err) {
        showBanner(err.message, "error");
      }
    });
  });
};

// ─────────────────────────────────────────────────────────
// VUE — ABSENCES
// ─────────────────────────────────────────────────────────
const renderAbsences = async () => {
  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Enregistrer une absence</p></div>
      <form class="inline-form" id="formAbsence">
        <div class="field"><label>ID étudiant</label><input name="student_id" type="number" required /></div>
        <div class="field">
          <label>Statut</label>
          <select name="status">
            <option value="non_justifiee">Non justifiée</option>
            <option value="justifiee">Justifiée</option>
          </select>
        </div>
        <button class="btn-small" type="submit">Enregistrer</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Consulter l'historique</p></div>
      <form class="inline-form" id="formSearchAbsence">
        <div class="field"><label>ID étudiant</label><input name="student_id" type="number" required /></div>
        <button class="btn-small" type="submit">Rechercher</button>
      </form>
      <div class="table-wrap" id="absencesResult" style="margin-top:1rem;"></div>
    </div>
  `;

  document.getElementById("formAbsence").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await request("/api/absences", {
        method: "POST",
        body: JSON.stringify({ student_id: Number(fd.get("student_id")), status: fd.get("status") }),
      });
      showBanner("Absence enregistrée.");
      e.target.reset();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

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
// VUE — NOTES
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
// VUE — MATIÈRES
// ─────────────────────────────────────────────────────────
const renderMatieres = async () => {
  const subjects = await request("/api/subjects");

  const rows = subjects.length
    ? subjects.map((s) => `
        <tr>
          <td class="mono">${s.id}</td>
          <td>${s.nom}</td>
          <td class="mono">${s.teacher_id ?? "—"}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn danger" data-action="delete-subject" data-id="${s.id}">supprimer</button>
            </div>
          </td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="4">Aucune matière enregistrée.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Ajouter une matière</p></div>
      <form class="inline-form" id="formSubject">
        <div class="field"><label>Nom</label><input name="nom" required /></div>
        <div class="field"><label>ID professeur</label><input name="teacher_id" type="number" required /></div>
        <button class="btn-small" type="submit">Ajouter</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Liste des matières</p></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>ID</th><th>Nom</th><th>ID Prof</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("formSubject").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await request("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ nom: fd.get("nom"), teacher_id: Number(fd.get("teacher_id")) }),
      });
      showBanner("Matière ajoutée.");
      renderMatieres();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  content.querySelectorAll('[data-action="delete-subject"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Supprimer cette matière ?")) return;
      try {
        await request(`/api/subjects/${btn.dataset.id}`, { method: "DELETE" });
        showBanner("Matière supprimée.");
        renderMatieres();
      } catch (err) {
        showBanner(err.message, "error");
      }
    });
  });
};

// ─────────────────────────────────────────────────────────
// VUE — UTILISATEURS
// ─────────────────────────────────────────────────────────
const renderUtilisateurs = async () => {
  const users = await request("/api/users");

  const rows = users.length
    ? users.map((u) => `
        <tr>
          <td class="mono">${u.id}</td>
          <td>${u.name}</td>
          <td>${u.pseudo}</td>
          <td>${u.role}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn danger" data-action="delete-user" data-id="${u.id}">supprimer</button>
            </div>
          </td>
        </tr>
      `).join("")
    : `<tr class="empty-row"><td colspan="5">Aucun utilisateur enregistré.</td></tr>`;

  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Ajouter un utilisateur</p></div>
      <form class="inline-form" id="formUser" autocomplete="off">
        <div class="field"><label>Nom</label><input name="name" autocomplete="off" required /></div>
        <div class="field"><label>Pseudo</label><input name="pseudo" autocomplete="new-password" required /></div>
        <div class="field"><label>Mot de passe</label><input name="password" type="password" autocomplete="new-password" required /></div>
        <div class="field">
          <label>Rôle</label>
          <select name="role" autocomplete="off">
            <option value="admin">Admin</option>
            <option value="enseignant">Enseignant</option>
            <option value="student">Étudiant</option>
          </select>
        </div>
        <button class="btn-small" type="submit">Ajouter</button>
      </form>
    </div>

    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Liste des utilisateurs</p></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>ID</th><th>Nom</th><th>Pseudo</th><th>Rôle</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="loading-hint" style="margin-top:0.75rem;">
        Créer le compte ne suffit pas : lie-le ensuite depuis « Étudiants » ou « Professeurs ».
      </p>
    </div>
  `;

  document.getElementById("formUser").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await request("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: fd.get("name"),
          pseudo: fd.get("pseudo"),
          password: fd.get("password"),
          role: fd.get("role"),
        }),
      });
      showBanner("Utilisateur ajouté.");
      renderUtilisateurs();
    } catch (err) {
      showBanner(err.message, "error");
    }
  });

  content.querySelectorAll('[data-action="delete-user"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Supprimer cet utilisateur ?")) return;
      try {
        await request(`/api/users/${btn.dataset.id}`, { method: "DELETE" });
        showBanner("Utilisateur supprimé.");
        renderUtilisateurs();
      } catch (err) {
        showBanner(err.message, "error");
      }
    });
  });
};

// ─────────────────────────────────────────────────────────
// VUE — STATISTIQUES
// ─────────────────────────────────────────────────────────
const renderStats = async () => {
  content.innerHTML = `
    <div class="panel-card">
      <div class="panel-card__head"><p class="panel-card__title">Meilleur étudiant d'une matière</p></div>
      <form class="inline-form" id="formBest">
        <div class="field"><label>ID matière</label><input name="subject_id" type="number" required /></div>
        <button class="btn-small" type="submit">Voir</button>
      </form>
      <div id="bestResult" style="margin-top:1rem;"></div>
    </div>
  `;

  document.getElementById("formBest").addEventListener("submit", async (e) => {
    e.preventDefault();
    const subjectId = new FormData(e.target).get("subject_id");
    const resultDiv = document.getElementById("bestResult");
    try {
      const best = await request(`/api/grades/subject/${subjectId}/best-student`);
      resultDiv.innerHTML = best.student_id
        ? `<p class="loading-hint">Étudiant ID ${best.student_id} — moyenne ${best.average.toFixed(2)}/20</p>`
        : `<p class="loading-hint">Aucune note enregistrée pour cette matière.</p>`;
    } catch (err) {
      showBanner(err.message, "error");
    }
  });
};

// ─────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────
document.getElementById("whoamiName").textContent = "Administrateur";
renderView("etudiants");