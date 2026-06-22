import { session } from "../utils/session.js";
import { question, fermerInterface } from "../utils/interface.js";
import { logger } from "../utils/logger.js";

import { getAllStudents, getStudentById } from "../services/studentService.js";

import {
  getAbsencesByStudent,
  countUnjustifiedAbsences,
} from "../services/absenceService.js";

import {
  addMultipleGrades,
  updateGrades,
  deleteGrades,
} from "../services/gradeService.js";

import { getAllSubjects, getSubjectById } from "../services/subjectService.js";

const teacher = () => session.userConnected.name;

// ─── MENU PRINCIPAL TEACHER ────────────────────────────────
export const menuTeacher = async () => {
  while (true) {
    console.log(`\n══ TEACHER [${session.userConnected.role}] ══`);
    console.log("1. Consulter la liste des étudiants");
    console.log("2. Consulter la liste des matières");
    console.log("3. Consulter les absences");
    console.log("4. Gérer les Notes");
    console.log("0. Quitter");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1":
        await sousMenuEtudiants();
        break;

      case "2":
        await sousMenuSubjects();
        break;

      case "3":
        await sousMenuAbsences();
        break;

      case "4":
        await sousMenuGrades();
        break;

      case "0":
        logger.deconnexion(teacher());
        console.log("Au revoir !");
        fermerInterface();
        process.exit(0);

      default:
        console.log("Choix invalide");
    }
  }
};

// ─── SOUS-MENU ÉTUDIANTS ──
const sousMenuEtudiants = async () => {
  while (true) {
    console.log("\n── ÉTUDIANTS ──");
    console.log("1. Lister tous les étudiants");
    console.log("2. Afficher un étudiant");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const students = getAllStudents();
        logger.action(teacher(), "Lister tous les étudiants");
        console.table(students);
        await question("\nAppuie sur Entrée pour continuer...");
        break;
      }

      case "2": {
        const id = await question("ID de l'étudiant : ");
        const student = getStudentById(Number(id));

        if (!student) {
          logger.erreur(teacher(), `Étudiant introuvable — ID : ${id}`);
          console.log("Aucun étudiant trouvé.");
        } else {
          logger.action(teacher(), `Afficher étudiant — ID : ${id}`);
          console.table([student]);
        }

        await question("\nAppuie sur Entrée pour continuer...");
        break;
      }

      case "0":
        return;

      default:
        console.log("Choix invalide.");
    }
  }
};

// ─── SOUS-MENU ABSENCE ──
const sousMenuAbsences = async () => {
  while (true) {
    console.log("\n── ABSENCES ──");
    console.log("1. Historique");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const student_id = await question("ID étudiant : ");

        const absences = getAbsencesByStudent(Number(student_id));
        const unjustified = countUnjustifiedAbsences(Number(student_id));

        logger.action(
          teacher(),
          `Historique absences — étudiant ID : ${student_id}`,
        );
        console.log(`\n Absences non justifiées : ${unjustified}`);

        if (!absences || absences.length === 0) {
          console.log("Aucune absence.");
        } else {
          absences.forEach((a) =>
            console.log(`[${a.id}] ${a.date} - ${a.status}`),
          );
        }

        break;
      }

      case "0":
        return;

      default:
        console.log("Choix invalide");
    }
  }
};

// ─── SOUS-MENU GRADES ──
const sousMenuGrades = async () => {
  while (true) {
    console.log("\n── GESTION DES NOTES ──");
    console.log("1. Ajouter une note");
    console.log("2. Modifier une note");
    console.log("3. Supprimer une note");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const student_id = await question("ID étudiant : ");
        const subject_id = await question("ID matière : ");
        const note = await question("Note : ");

        addMultipleGrades(Number(student_id), Number(subject_id), Number(note));
        logger.action(
          teacher(),
          `Note ajoutée — étudiant ID : ${student_id}, matière ID : ${subject_id}, note : ${note}`,
        );
        console.log("✓ Note ajoutée");
        break;
      }

      case "2": {
        const id = await question("ID note : ");
        const note = await question("Nouvelle note : ");

        const result = updateGrades(Number(id), { note: Number(note) });

        if (result.changes) {
          logger.action(
            teacher(),
            `Note modifiée — ID : ${id}, nouvelle note : ${note}`,
          );
          console.log("✓ Note modifiée");
        } else {
          logger.erreur(teacher(), `Échec modification note — ID : ${id}`);
          console.log("✗ ID introuvable");
        }
        break;
      }

      case "3": {
        const id = await question("ID note à supprimer : ");

        const result = deleteGrades(Number(id));

        if (result.changes) {
          logger.action(teacher(), `Note supprimée — ID : ${id}`);
          console.log("✓ Note supprimée");
        } else {
          logger.erreur(teacher(), `Échec suppression note — ID : ${id}`);
          console.log("✗ ID introuvable");
        }
        break;
      }

      case "0":
        return;

      default:
        console.log("Choix invalide");
    }
  }
};

// ─── SOUS-MENU SUBJECT ──
const sousMenuSubjects = async () => {
  while (true) {
    console.log("\n── MATIÈRES ──");
    console.log("1. Lister");
    console.log("2. Afficher une matière");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const subjects = getAllSubjects();
        logger.action(teacher(), "Lister toutes les matières");
        console.table(subjects);
        await question("\nAppuie sur Entrée...");
        break;
      }

      case "2": {
        const id = await question("ID de la matière à afficher: ");
        const result = getSubjectById(Number(id));

        if (!result) {
          logger.erreur(teacher(), `Matière introuvable — ID : ${id}`);
          console.log("Aucune matière trouvée.");
        } else {
          logger.action(teacher(), `Afficher matière — ID : ${id}`);
          console.table([result]);
        }

        await question("\nAppuie sur Entrée pour continuer...");
        break;
      }

      case "0":
        return;

      default:
        console.log("Choix invalide");
    }
  }
};
