import { getAllUsers } from "../services/userService.js";
import { question } from "../utils/interface.js";
import { logger } from "./logger.js";

export const session = { userConnected: null };

const seConnecter = async (role) => {
  const nom = await question("Nom : ");

  const users = getAllUsers();

  const user = users.find((u) => u.name === nom && u.role === role);

  if (!user) {
    logger.erreur(nom, `Tentative de connexion échouée — rôle : ${role}`);
    console.log("Utilisateur introuvable dans la base de données.");
    return false;
  }

  session.userConnected = user;
  logger.connexion(session.userConnected.name, session.userConnected.role);
  console.log(
    `Bienvenue ${session.userConnected.name} (${session.userConnected.role})`,
  );
  return true;
};

export { seConnecter };
