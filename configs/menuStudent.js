import { session } from "../utils/session.js";
import { question, fermerInterface } from "../utils/interface.js";
import { logger } from "../utils/logger.js";

import {
  getAbsencesByStudent,
  countUnjustifiedAbsences,
} from "../services/absenceService.js";

import {
  getStudentGrades,
  calculateAverage,
} from "../services/gradeService.js";

import db from "../db/database.js";

const student_session = () => session.userConnected.name;

// Fonction utilitaire : vérifie que le matricule existe dans students
const getStudentByMatricule = (matricule) => {
  return db
    .prepare(
      `
    SELECT * FROM students WHERE matricule = ?
  `,
    )
    .get(matricule);
};

// ─── MENU PRINCIPAL STUDENT ────────────────────────────────
export const menuStudent = async () => {
  while (true) {
    console.log(`\n══ STUDENT [${session.userConnected.name}] ══`);
    console.log("1. Consulter mes notes");
    console.log("2. Consulter mes absences");
    console.log("3. Consulter ma moyenne");
    console.log("0. Quitter");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1":
        await sousMenuGrades();
        break;

      case "2":
        await sousMenuAbsences();
        break;

      case "3":
        await sousMenuMoyenne();
        break;

      case "0":
        logger.deconnexion(student_session());
        console.log("Au revoir !");
        fermerInterface();
        process.exit(0);

      default:
        console.log("Choix invalide");
    }
  }
};

// ─── SAISIE ET VÉRIFICATION DU MATRICULE ──
const demanderMatricule = async () => {
  const matricule = await question("Entrez votre matricule : ");

  const student = getStudentByMatricule(matricule.trim());

  if (!student) {
    logger.erreur(
      student_session(),
      `Matricule introuvable : ${matricule.trim()}`,
    );
    console.log("Matricule introuvable. Veuillez réessayer.");
    return null;
  }

  logger.action(
    student_session(),
    `Matricule vérifié — ${student.prenom} ${student.nom} (${student.matricule})`,
  );
  console.log(
    `Étudiant identifié : ${student.prenom} ${student.nom} — ${student.classe}`,
  );
  return student;
};

// ─── SOUS-MENU GRADES ──
const sousMenuGrades = async () => {
  const student = await demanderMatricule();
  if (!student) return;

  const notes = getStudentGrades(student.id);

  if (!notes || notes.length === 0) {
    logger.action(
      student_session(),
      `Consulter notes — aucune note (${student.matricule})`,
    );
    console.log("\n══ MES NOTES ══");
    console.log("Aucune note trouvée.");
  } else {
    logger.action(
      student_session(),
      `Consulter notes — ${notes.length} note(s) (${student.matricule})`,
    );
    console.log("\n══ MES NOTES ══");
    console.table(notes);
  }

  await question("\nEntrée pour continuer...");
};

// ─── SOUS-MENU ABSENCES ──
const sousMenuAbsences = async () => {
  const student = await demanderMatricule();
  if (!student) return;

  const absences = getAbsencesByStudent(student.id);
  const unjustified = countUnjustifiedAbsences(student.id);

  logger.action(
    student_session(),
    `Consulter absences — ${absences.length} absence(s), ${unjustified} non justifiée(s) (${student.matricule})`,
  );

  console.log("\n══ MES ABSENCES ══");
  console.log("Non justifiées :", unjustified);

  if (!absences || absences.length === 0) {
    console.log("Aucune absence.");
  } else {
    console.table(absences);
  }

  await question("\nEntrée pour continuer...");
};

// ─── SOUS-MENU MOYENNE ──
const sousMenuMoyenne = async () => {
  const student = await demanderMatricule();
  if (!student) return;

  const moyenne = calculateAverage(student.id);

  logger.action(
    student_session(),
    `Consulter moyenne — ${moyenne.toFixed(2)} (${student.matricule})`,
  );

  console.log("\n══ MA MOYENNE ══");
  console.log(`Moyenne générale : ${moyenne.toFixed(2)}`);

  await question("\nEntrée pour continuer...");
};
