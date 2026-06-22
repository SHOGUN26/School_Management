import { question, fermerInterface } from "../utils/interface.js";
import { session } from "../utils/session.js";
import { logger } from "../utils/logger.js";

import {
  getStudentGrades,
  calculateAverage,
  getAverageBySubject,
} from "../services/gradeService.js";

import { getAbsencesByStudent } from "../services/absenceService.js";
import { getSubjectByName } from "../services/subjectService.js";

// ─── MENU PRINCIPAL STUDENT ─────────────────────────────────
export const menuStudent = async () => {
  const student = session.student;

  let actif = true;
  while (actif) {
    console.log("\n〚=== MENU ETUDIANT ===〛");
    console.log(`Connecté en tant que : ${student.nom} ${student.prenom} | Classe : ${student.classe}`);
    console.log("1. Voir mes notes");
    console.log("2. Voir ma moyenne générale");
    console.log("3. Voir ma moyenne par matière");
    console.log("4. Consulter mes absences");
    console.log("0. Déconnexion");

    const choix = await question("Choix: ");

    switch (choix.trim()) {
      case "1": await sousMenuNotes(student); break;
      case "2": await sousMenuMoyenneGenerale(student); break;
      case "3": await sousMenuMoyenneParMatiere(student); break;
      case "4": await sousMenuAbsences(student); break;
      case "0":
        logger.deconnexion(session.userConnected.name);
        console.log("Déconnexion.");
        session.userConnected = null;
        session.student = null;
        actif = false;
        break;
      default:
        console.log("Choix invalide.");
    }
  }
};

// ─── SOUS-MENU NOTES ────────────────────────────────────────
const sousMenuNotes = async (student) => {
  const grades = getStudentGrades(student.id);

  logger.action(
    session.userConnected.name,
    `Consulter notes — ${grades.length} note(s) (${student.matricule})`
  );

  if (!grades || grades.length === 0) {
    console.log("Aucune note enregistrée.");
  } else {
    console.log("╔════════════════════════════════════════╗");
    console.log("║              MES NOTES                 ║");
    console.log("╚════════════════════════════════════════╝\n");
    grades.forEach((grade) => {
      console.log("┌─────────────────────────────────────┐");
      console.log(`│ Matière : ${grade.matiere}`);
      console.log(`│ Note    : ${grade.note}/20`);
      console.log("└─────────────────────────────────────┘");
    });
  }

  await question("\nEntrée pour continuer...");
};

// ─── SOUS-MENU MOYENNE GÉNÉRALE ─────────────────────────────
const sousMenuMoyenneGenerale = async (student) => {
  const moyenne = calculateAverage(student.id);

  logger.action(
    session.userConnected.name,
    `Consulter moyenne générale — ${moyenne !== null ? moyenne.toFixed(2) : "N/A"} (${student.matricule})`
  );

  if (moyenne === null) {
    console.log("Aucune note enregistrée.");
  } else {
    console.log("┌─────────────────────────────────────┐");
    console.log(`│ Moyenne générale : ${moyenne.toFixed(2)}/20`);
    console.log("└─────────────────────────────────────┘");
  }

  await question("\nEntrée pour continuer...");
};

// ─── SOUS-MENU MOYENNE PAR MATIÈRE ──────────────────────────
const sousMenuMoyenneParMatiere = async (student) => {
  const nom_matiere = await question("Nom de la matière : ");
  const subject = getSubjectByName(nom_matiere);

  if (!subject) {
    logger.erreur(session.userConnected.name, `Matière introuvable : ${nom_matiere}`);
    console.log(`Matière "${nom_matiere}" introuvable.`);
    return;
  }

  const moyenne = getAverageBySubject(student.id, subject.id);

  logger.action(
    session.userConnected.name,
    `Consulter moyenne par matière — ${nom_matiere} : ${moyenne !== null ? moyenne.toFixed(2) : "N/A"} (${student.matricule})`
  );

  if (moyenne === null) {
    console.log("Aucune note pour cette matière.");
  } else {
    console.log("┌─────────────────────────────────────┐");
    console.log(`│ Matière : ${nom_matiere}`);
    console.log(`│ Moyenne : ${moyenne.toFixed(2)}/20`);
    console.log("└─────────────────────────────────────┘");
  }

  await question("\nEntrée pour continuer...");
};

// ─── SOUS-MENU ABSENCES ─────────────────────────────────────
const sousMenuAbsences = async (student) => {
  const absences = getAbsencesByStudent(student.id);

  logger.action(
    session.userConnected.name,
    `Consulter absences — ${absences.length} absence(s) (${student.matricule})`
  );

  if (!absences || absences.length === 0) {
    console.log("Aucune absence enregistrée.");
  } else {
    console.log("╔════════════════════════════════════════╗");
    console.log("║            MES ABSENCES                ║");
    console.log("╚════════════════════════════════════════╝\n");
    absences.forEach((absence) => {
      console.log("┌─────────────────────────────────────┐");
      console.log(`│ Date   : ${absence.date}`);
      console.log(`│ Status : ${absence.status}`);
      console.log("└─────────────────────────────────────┘");
    });
  }

  await question("\nEntrée pour continuer...");
};