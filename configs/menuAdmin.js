import { session } from "../utils/session.js";
import { question, fermerInterface } from "../utils/interface.js";
import { logger } from "../utils/logger.js";
import {
  getAllStudents,
  createStudent,
  deleteStudent,
  updateStudent,
  getStudentById,
} from "../services/studentService.js";
import {
  createTeacher,
  deleteTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
} from "../services/teacherService.js";
import {
  createAbsence,
  marquerAbsence,
  getAbsencesByStudent,
  countUnjustifiedAbsences,
} from "../services/absenceService.js";
import {
  addMultipleGrades,
  calculateAverage,
  getBestStudentInSubject,
  updateGrades,
  deleteGrades,
  getStudentGrades,
} from "../services/gradeService.js";
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  deleteSubject,
} from "../services/subjectService.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../services/userService.js";

const admin = () => session.userConnected.name;

// ─── MENU PRINCIPAL ADMIN ────────────────────────────────
export const menuAdmin = async () => {
  while (true) {
    console.log(`\n══ ADMIN [${session.userConnected.role}] ══`);
    console.log("1. Gérer les étudiants");
    console.log("2. Gérer les Professeurs");
    console.log("3. Gérer les Absences");
    console.log("4. Gérer les Notes");
    console.log("5. Gérer les Matières");
    console.log("6. Gérer les utilisateurs");
    console.log("7. Statistiques");
    console.log("0. Quitter");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1":
        await sousMenuEtudiants();
        break;
      case "2":
        await sousMenuProfesseurs();
        break;
      case "3":
        await sousMenuAbsences();
        break;
      case "4":
        await sousMenuGrades();
        break;
      case "5":
        await sousMenuSubjects();
        break;
      case "6":
        await sousMenuUser();
        break;
      case "7":
        await sousMenuStats();
        break;
      case "0":
        logger.deconnexion(admin());
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
  console.log("\n── ÉTUDIANTS ──");
  console.log("1. Lister");
  console.log("2. Ajouter");
  console.log("3. Afficher un étudiant");
  console.log("4. Supprimer");
  console.log("5. Modifier");
  console.log("0. Retour");

  const choix = await question("\nVotre choix : ");

  switch (choix.trim()) {
    case "1": {
      const students = getAllStudents();
      logger.action(admin(), "Lister tous les étudiants");
      console.table(students);
      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "2": {
      const matricule = await question("Matricule : ");
      const nom = await question("Nom : ");
      const prenom = await question("Prénom : ");
      const age = await question("Âge : ");
      const classe = await question("Classe : ");

      const result = createStudent(matricule, nom, prenom, age, classe);
      console.log("DEBUG INSERT :", result);

      if (result.changes === 0) {
        logger.erreur(
          admin(),
          `Échec ajout étudiant — matricule : ${matricule}`,
        );
        console.log("❌ Échec de l'insertion (doublon ou erreur)");
      } else {
        logger.action(
          admin(),
          `Étudiant ajouté — ${prenom} ${nom} (${matricule})`,
        );
        console.log("✅ Étudiant ajouté avec succès !");
      }

      await question("\nAppuie sur Entrée...");
      break;
    }

    case "3": {
      const id = await question("ID de l'étudiant : ");
      const student = getStudentById(Number(id));

      if (!student) {
        logger.erreur(admin(), `Étudiant introuvable — ID : ${id}`);
        console.log("Aucun étudiant trouvé.");
      } else {
        logger.action(admin(), `Afficher étudiant — ID : ${id}`);
        console.table([student]);
      }

      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "4": {
      const id = await question("ID étudiant à supprimer : ");
      const result = deleteStudent(id);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec suppression étudiant — ID : ${id}`);
        console.log("❌ Aucun étudiant trouvé");
      } else {
        logger.action(admin(), `Étudiant supprimé — ID : ${id}`);
        console.log("🗑️ Étudiant supprimé !");
      }
      break;
    }

    case "5": {
      const id = await question("ID étudiant à modifier : ");
      const matricule = await question("Matricule : ");
      const nom = await question("Nom : ");
      const prenom = await question("Prénom : ");
      const age = await question("Âge : ");
      const classe = await question("Classe : ");

      const result = updateStudent(Number(id), {
        matricule,
        nom,
        prenom,
        age: Number(age),
        classe,
      });

      console.log("DEBUG UPDATE :", result);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec modification étudiant — ID : ${id}`);
        console.log("ID introuvable");
      } else {
        logger.action(admin(), `Étudiant modifié — ID : ${id}`);
        console.log("Étudiant modifié !");
      }
      break;
    }

    case "0":
      return;

    default:
      console.log("Choix invalide.");
  }

  await sousMenuEtudiants();
};

// ─── SOUS-MENU PROFESSEURS ──
const sousMenuProfesseurs = async () => {
  console.log("\n── PROFESSEURS ──");
  console.log("1. Lister");
  console.log("2. Ajouter");
  console.log("3. Supprimer");
  console.log("4. Modifier");
  console.log("5. Afficher un professeur");
  console.log("0. Retour");

  const choix = await question("\nVotre choix : ");

  switch (choix.trim()) {
    case "1": {
      const teachers = getAllTeachers();
      logger.action(admin(), "Lister tous les professeurs");
      console.table(teachers);
      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "2": {
      const nom = await question("Nom : ");
      const matiere = await question("Matière : ");

      const result = createTeacher(nom, matiere);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec ajout professeur — ${nom}`);
        console.log("Échec de l'ajout.");
      } else {
        logger.action(admin(), `Professeur ajouté — ${nom} (${matiere})`);
        console.log("Professeur ajouté avec succès !");
      }

      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "3": {
      const id = await question("ID Professeur à supprimer : ");
      const result = deleteTeacher(id);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec suppression professeur — ID : ${id}`);
        console.log("❌ Aucun Professeur trouvé");
      } else {
        logger.action(admin(), `Professeur supprimé — ID : ${id}`);
        console.log("🗑️ Professeur supprimé !");
      }
      break;
    }

    case "4": {
      const id = await question("ID Professeur à modifier : ");
      const nom = await question("Nom : ");
      const matiere = await question("Matière : ");

      const result = updateTeacher(Number(id), { nom, matiere });
      console.log("DEBUG UPDATE :", result);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec modification professeur — ID : ${id}`);
        console.log("ID introuvable");
      } else {
        logger.action(admin(), `Professeur modifié — ID : ${id}`);
        console.log("Information du professeur modifiée !");
      }
      break;
    }

    case "5": {
      const id = await question("ID du professeur : ");
      const teacher = getTeacherById(Number(id));

      if (!teacher) {
        logger.erreur(admin(), `Professeur introuvable — ID : ${id}`);
        console.log("Aucun professeur trouvé.");
      } else {
        logger.action(admin(), `Afficher professeur — ID : ${id}`);
        console.table([teacher]);
      }

      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "0":
      return;

    default:
      console.log("Choix invalide.");
  }
};

// ─── SOUS-MENU ABSENCE ──
const sousMenuAbsences = async () => {
  while (true) {
    console.log("\n── ABSENCES ──");
    console.log("1. Enregistrer");
    console.log("2. Marquer");
    console.log("3. Historique");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const student_id = await question("ID étudiant : ");
        const result = createAbsence(Number(student_id), "non_justifiee");

        console.log("DEBUG:", result);
        logger.action(
          admin(),
          `Absence enregistrée — étudiant ID : ${student_id}`,
        );
        console.log(`✓ Ajouté (id: ${result.lastInsertRowid})`);
        break;
      }

      case "2": {
        const id = await question("ID absence : ");
        console.log("1. Justifiée");
        console.log("2. Non justifiée");
        const choixStatus = await question("Choix : ");

        const status =
          choixStatus.trim() === "1" ? "justifiee" : "non_justifiee";
        const result = marquerAbsence(Number(id), status);

        if (result.changes) {
          logger.action(admin(), `Absence ID ${id} marquée : ${status}`);
          console.log("✓ Mise à jour OK");
        } else {
          logger.erreur(admin(), `Absence introuvable — ID : ${id}`);
          console.log("✗ ID introuvable");
        }
        break;
      }

      case "3": {
        const student_id = await question("ID étudiant : ");
        const absences = getAbsencesByStudent(Number(student_id));
        const unjustified = countUnjustifiedAbsences(Number(student_id));

        logger.action(
          admin(),
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
    console.log("4. Moyenne d'un étudiant");
    console.log("5. Meilleur étudiant par matière");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const student_id = await question("ID étudiant : ");
        const subject_id = await question("ID matière : ");
        const note = await question("Note : ");

        addMultipleGrades(Number(student_id), Number(subject_id), Number(note));
        logger.action(
          admin(),
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
            admin(),
            `Note modifiée — ID : ${id}, nouvelle note : ${note}`,
          );
          console.log("✓ Note modifiée");
        } else {
          logger.erreur(admin(), `Échec modification note — ID : ${id}`);
          console.log("✗ ID introuvable");
        }
        break;
      }

      case "3": {
        const id = await question("ID note à supprimer : ");
        const result = deleteGrades(Number(id));

        if (result.changes) {
          logger.action(admin(), `Note supprimée — ID : ${id}`);
          console.log("✓ Note supprimée");
        } else {
          logger.erreur(admin(), `Échec suppression note — ID : ${id}`);
          console.log("✗ ID introuvable");
        }
        break;
      }

      case "4": {
        const student_id = await question("ID étudiant : ");
        const subject_id = await question("ID matière : ");

        const average = calculateAverage(
          Number(student_id),
          Number(subject_id),
        );
        logger.action(
          admin(),
          `Moyenne calculée — étudiant ID : ${student_id}, matière ID : ${subject_id} → ${average.toFixed(2)}`,
        );
        console.log(`Moyenne : ${average.toFixed(2)}`);
        break;
      }

      case "5": {
        const subject_id = await question("ID matière : ");
        const best = getBestStudentInSubject(Number(subject_id));

        logger.action(
          admin(),
          `Meilleur étudiant matière ID : ${subject_id} → étudiant ID : ${best.student_id} (${best.average.toFixed(2)})`,
        );
        console.log("\nMeilleur étudiant :");
        console.log(`ID: ${best.student_id}`);
        console.log(`Moyenne: ${best.average.toFixed(2)}`);
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
    console.log("2. Ajouter");
    console.log("3. Supprimer");
    console.log("4. Afficher une matière");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const subjects = getAllSubjects();
        logger.action(admin(), "Lister toutes les matières");
        console.table(subjects);
        await question("\nAppuie sur Entrée...");
        break;
      }

      case "2": {
        const nom = await question("Nom matière : ");
        const teacher_id = await question("ID professeur : ");

        if (!nom || !teacher_id) {
          console.log("Champs obligatoires");
          break;
        }

        try {
          createSubject(nom, Number(teacher_id));
          logger.action(
            admin(),
            `Matière ajoutée — ${nom} (prof ID : ${teacher_id})`,
          );
          console.log("✓ Matière ajoutée");
        } catch (err) {
          logger.erreur(
            admin(),
            `Échec ajout matière — ${nom} : ${err.message}`,
          );
          console.log("Échec", err.message);
        }

        await question("\nAppuie sur Entrée...");
        break;
      }

      case "3": {
        const id = await question("ID matière à supprimer : ");
        const result = deleteSubject(Number(id));

        if (result.changes === 0) {
          logger.erreur(admin(), `Matière introuvable — ID : ${id}`);
          console.log("Matière introuvable");
        } else {
          logger.action(admin(), `Matière supprimée — ID : ${id}`);
          console.log("Matière supprimée");
        }
        break;
      }

      case "4": {
        const id = await question("ID de la matière à afficher: ");
        const result = getSubjectById(Number(id));

        if (!result) {
          logger.erreur(admin(), `Matière introuvable — ID : ${id}`);
          console.log("Aucune matière trouvée.");
        } else {
          logger.action(admin(), `Afficher matière — ID : ${id}`);
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

// ─── SOUS-MENU UTILISATEUR ──
const sousMenuUser = async () => {
  console.log("\n── UTILISATEUR ──");
  console.log("1. Lister");
  console.log("2. Ajouter");
  console.log("3. Afficher un utilisateur");
  console.log("4. Supprimer");
  console.log("0. Retour");

  const choix = await question("\nVotre choix : ");

  switch (choix.trim()) {
    case "1": {
      const users = getAllUsers();
      logger.action(admin(), "Lister tous les utilisateurs");
      console.table(users);
      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "2": {
      const name = await question("Nom : ");
      const role = await question("Rôle : ");

      const result = createUser(name, role);
      console.log("DEBUG INSERT :", result);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec ajout utilisateur — ${name} (${role})`);
        console.log("Échec de l'insertion (doublon ou erreur)");
      } else {
        logger.action(admin(), `Utilisateur ajouté — ${name} (${role})`);
        console.log("Utilisateur ajouté avec succès !");
      }

      await question("\nAppuie sur Entrée...");
      break;
    }

    case "3": {
      const id = await question("ID de l'utilisateur : ");
      const user = getUserById(Number(id));

      if (!user) {
        logger.erreur(admin(), `Utilisateur introuvable — ID : ${id}`);
        console.log("Aucun utilisateur trouvé.");
      } else {
        logger.action(admin(), `Afficher utilisateur — ID : ${id}`);
        console.table([user]);
      }

      await question("\nAppuie sur Entrée pour continuer...");
      break;
    }

    case "4": {
      const id = await question("ID de l'utilisateur à supprimer : ");
      const result = deleteUser(id);

      if (result.changes === 0) {
        logger.erreur(admin(), `Échec suppression utilisateur — ID : ${id}`);
        console.log("Aucun utilisateur trouvé");
      } else {
        logger.action(admin(), `Utilisateur supprimé — ID : ${id}`);
        console.log("Utilisateur supprimé !");
      }
      break;
    }

    case "0":
      return;

    default:
      console.log("Choix invalide.");
  }

  await sousMenuUser();
};

// ─── SOUS-MENU STATISTIQUES ──
const sousMenuStats = async () => {
  while (true) {
    console.log("\n── STATISTIQUES ──");
    console.log("1. Meilleur étudiant par matière");
    console.log("2. Moyenne d'un étudiant");
    console.log("3. Absences d'un étudiant");
    console.log("0. Retour");

    const choix = await question("\nVotre choix : ");

    switch (choix.trim()) {
      case "1": {
        const subject_id = await question("ID matière : ");
        const best = getBestStudentInSubject(Number(subject_id));

        logger.action(
          admin(),
          `Stats — meilleur étudiant matière ID : ${subject_id}`,
        );
        console.log("\n══ MEILLEUR ÉTUDIANT ══");

        if (!best.student_id) {
          console.log("Aucune note enregistrée pour cette matière.");
        } else {
          const student = getStudentById(best.student_id);
          console.log(
            `Étudiant : ${student.prenom} ${student.nom} (${student.classe})`,
          );
          console.log(`Moyenne  : ${best.average.toFixed(2)}/20`);
        }

        await question("\nEntrée pour continuer...");
        break;
      }

      case "2": {
        const student_id = await question("ID étudiant : ");
        const moyenne = calculateAverage(Number(student_id));
        const notes = getStudentGrades(Number(student_id));

        logger.action(admin(), `Stats — moyenne étudiant ID : ${student_id}`);
        console.log("\n══ MOYENNE ÉTUDIANT ══");

        if (!notes || notes.length === 0) {
          console.log("Aucune note trouvée pour cet étudiant.");
        } else {
          const student = getStudentById(Number(student_id));
          console.log(`Étudiant : ${student.prenom} ${student.nom}`);
          console.table(notes);
          console.log(`Moyenne générale : ${moyenne.toFixed(2)}/20`);
        }

        await question("\nEntrée pour continuer...");
        break;
      }

      case "3": {
        const student_id = await question("ID étudiant : ");
        const absences = getAbsencesByStudent(Number(student_id));
        const unjustified = countUnjustifiedAbsences(Number(student_id));

        logger.action(admin(), `Stats — absences étudiant ID : ${student_id}`);
        console.log("\n══ ABSENCES ÉTUDIANT ══");

        if (!absences || absences.length === 0) {
          console.log("Aucune absence enregistrée.");
        } else {
          const student = getStudentById(Number(student_id));
          console.log(`Étudiant        : ${student.prenom} ${student.nom}`);
          console.log(`Total absences  : ${absences.length}`);
          console.log(`Non justifiées  : ${unjustified}`);
          console.log(`Justifiées      : ${absences.length - unjustified}`);
          console.table(absences);
        }

        await question("\nEntrée pour continuer...");
        break;
      }

      case "0":
        return;

      default:
        console.log("Choix invalide.");
    }
  }
};
