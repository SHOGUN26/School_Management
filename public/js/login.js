// ─────────────────────────────────────────────────────────
// CONFIG
// À adapter selon l'endroit où tourne ton API Express.
// Si le front et l'API sont servis par le même serveur (Express
// qui sert public/ en statique), tu peux mettre une chaîne vide "".
// ─────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3000";
const LOGIN_ENDPOINT = `${API_BASE}/api/auth/login`;

// Pages de redirection après connexion, par rôle.
// À adapter aux noms réels de tes fichiers dans public/html/.
const REDIRECTS = {
  admin: "admin.html",
  enseignant: "teacher.html",
  student: "student.html",
};

// ─────────────────────────────────────────────────────────
// ÉLÉMENTS DU DOM
// ─────────────────────────────────────────────────────────
const form = document.getElementById("loginForm");
const pseudoInput = document.getElementById("pseudo");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const submitBtn = document.getElementById("submitBtn");
const formError = document.getElementById("formError");
const statusStamp = document.getElementById("statusStamp");
const panelDesc = document.getElementById("panelDesc");
const tabs = document.querySelectorAll(".tab");

// Petites descriptions affichées quand on survole/active un onglet de rôle.
// Purement informatif : le rôle réel vient de la réponse de l'API, pas de cet onglet.
const ROLE_DESCRIPTIONS = {
  admin:
    "Vue d'ensemble des classes, des professeurs et des matières — ajouts, corrections et suppressions centralisés.",
  professeur:
    "Les classes confiées, les notes à saisir et les absences à consulter, réunies au même endroit.",
  etudiant:
    "Les notes, la moyenne et les absences de l'élève, disponibles en un coup d'œil.",
};

// ─────────────────────────────────────────────────────────
// ONGLETS DE RÔLE — interaction purement informative
// ─────────────────────────────────────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");
    panelDesc.textContent = ROLE_DESCRIPTIONS[tab.dataset.role];
  });
});

// ─────────────────────────────────────────────────────────
// AFFICHER / MASQUER LE MOT DE PASSE
// ─────────────────────────────────────────────────────────
togglePasswordBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePasswordBtn.textContent = isHidden ? "masquer" : "voir";
  togglePasswordBtn.setAttribute(
    "aria-label",
    isHidden ? "Masquer le mot de passe" : "Afficher le mot de passe"
  );
});

// ─────────────────────────────────────────────────────────
// GESTION DES ERREURS AFFICHÉES
// ─────────────────────────────────────────────────────────
const showError = (message) => {
  formError.textContent = message;
  formError.hidden = false;
  statusStamp.textContent = "Échec de connexion";
  statusStamp.className = "fiche__stamp is-error";
};

const clearError = () => {
  formError.hidden = true;
  formError.textContent = "";
};

const setLoading = (isLoading) => {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
  statusStamp.textContent = isLoading ? "Connexion en cours..." : "Non connecté";
  statusStamp.className = "fiche__stamp";
};

// ─────────────────────────────────────────────────────────
// SOUMISSION DU FORMULAIRE
// ─────────────────────────────────────────────────────────
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const pseudo = pseudoInput.value.trim();
  const password = passwordInput.value;

  if (!pseudo || !password) {
    showError("Merci de renseigner le pseudo et le mot de passe.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Pseudo ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Le token doit être renvoyé par la route /login une fois le middleware JWT en place.
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    localStorage.setItem("auth_role", data.role);

    // On garde aussi le profil complet (teacher/student/user) pour les dashboards,
    // ça évite de refaire un appel réseau juste pour connaître l'id du prof/étudiant connecté.
    localStorage.setItem("auth_profile", JSON.stringify(data));

    statusStamp.textContent = "Connecté";
    statusStamp.className = "fiche__stamp is-ok";

    const destination = REDIRECTS[data.role] || "index.html";
    window.location.href = destination;

  } catch (err) {
    console.error(err);
    showError("Impossible de contacter le serveur. Réessaie dans un instant.");
    setLoading(false);
  }
});