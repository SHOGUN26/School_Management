import { question } from "../utils/interface.js";
import { getAllUsers } from "../services/userService.js";
import db from "../db/database.js";
import { logger } from "./logger.js";

export const session = { userConnected: null, student: null };

const seConnecter = async (role) => {
  console.log("\n≈≈≈ CONNEXION ≈≈≈");

  const nom = await question("Nom : ");
  const motdepasse = await question("Mot de passe : ");

  const users = getAllUsers();
  const user = users.find(
    (u) => u.name === nom && u.password === motdepasse
  );

  if (!user) {
    console.log("Utilisateur introuvable. Vérifiez votre nom ou votre mot de passe.");
    logger.erreur(nom, `Tentative de connexion échouée — rôle : ${role}`);
    return false;
  }

  session.userConnected = user;

  if (user.role === "student") {
    const student = db
      .prepare(
        `SELECT * FROM students WHERE LOWER(nom) = LOWER(?) OR LOWER(prenom) = LOWER(?)`,
      )
      .get(user.name, user.prenom);

    if (!student) {
      console.log("Aucun étudiant trouvé correspondant à votre compte.");
      logger.erreur(nom, `Connexion étudiant sans correspondance`);
      session.userConnected = null;
      return false;
    }

    session.student = student;
    console.log(`Bienvenue ${student.nom} ${student.prenom} (${user.role}) !`);
    logger.connexion(`${student.nom} ${student.prenom}`, "étudiant");
  } else {
    console.log(`Bienvenue ${user.name} (${user.role}) !`);
    logger.connexion(user.name, user.role);
  }

  return true;
};

export { seConnecter };
