import { question } from "../utils/interface.js";
import { getAllUsers } from "../services/userService.js";
import { getClassesByTeacher } from "../services/teacherClasseService.js";
import db from "../db/database.js";
import { logger } from "./logger.js";

export const session = {
  userConnected: null,
  student:       null,
  teacher:       null,
  classes:       [], // ✅ classes du prof connecté
};

const seConnecter = async () => {
  console.log("\n≈≈≈ CONNEXION ≈≈≈");

  const pseudo     = await question("Pseudo : ");
  const motdepasse = await question("Mot de passe : ");

  const users = getAllUsers();
  const user  = users.find(
    (u) => u.pseudo === pseudo && u.password === motdepasse
  );

  if (!user) {
    console.log("Pseudo ou mot de passe incorrect.");
    logger.erreur(pseudo, `Tentative de connexion échouée`);
    return false;
  }

  session.userConnected = user;

  if (user.role === "student") {
    const student = db
      .prepare(`SELECT * FROM students WHERE user_id = ?`)
      .get(user.id);

    if (!student) {
      console.log("Aucun étudiant trouvé correspondant à votre compte.");
      logger.erreur(pseudo, `Connexion étudiant sans correspondance`);
      session.userConnected = null;
      return false;
    }

    session.student = student;
    console.log(`\nBienvenue ${student.nom} ${student.prenom} !`);
    console.log(`Classe    : ${student.classe}`);
    console.log(`Matricule : ${student.matricule}`);
    logger.connexion(`${student.nom} ${student.prenom}`, "étudiant");

  } else if (user.role === "enseignant") {
    const teacher = db
      .prepare(`SELECT * FROM teachers WHERE user_id = ?`)
      .get(user.id);

    if (!teacher) {
      console.log("Aucun enseignant trouvé correspondant à votre compte.");
      logger.erreur(pseudo, `Connexion enseignant sans correspondance`);
      session.userConnected = null;
      return false;
    }

    // Charger les classes du prof depuis teacher_classes
    const classes = getClassesByTeacher(teacher.id);

    session.teacher = teacher;
    session.classes = classes;

    console.log(`\nBienvenue ${teacher.nom} !`);
    console.log(`Matière   : ${teacher.matiere}`);

    // Afficher les classes du prof à la connexion
    if (classes.length === 0) {
      console.log(`Classes   : Aucune classe assignée`);
    } else {
      console.log(`Classes   : ${classes.map((c) => c.classe).join(", ")}`);
    }

    logger.connexion(teacher.nom, "enseignant");

  } else {
    console.log(`\nBienvenue ${user.name} (${user.role}) !`);
    logger.connexion(user.name, user.role);
  }

  return true;
};

export { seConnecter };