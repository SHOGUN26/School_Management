import { session, seConnecter } from "../utils/session.js";
import { menuAdmin } from "../configs/menuAdmin.js";
import { menuTeacher } from "../configs/menuTeacher.js";
import { menuStudent } from "../configs/menuStudent.js";
import { question, fermerInterface } from "../utils/interface.js";
import { logger } from "../utils/logger.js";

const menuPrincipal = async () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   BIENVENU SUR VOTRE APPLICATION       ║");
  console.log("║         DE GESTION D'ECOLE             ║");
  console.log("╚════════════════════════════════════════╝");

  logger.demarrage();

  let actif = true;

  while (actif) {
    console.log("\n〚=== GESTION SCOLAIRE ===〛");
    console.log("1. Connexion Admin");
    console.log("2. Connexion Professeur");
    console.log("3. Connexion Étudiant");
    console.log("0. Quitter");

    const choix = await question("Choix : ");

    switch (choix.trim()) {
      case "1": {
        const connected = await seConnecter("admin");
        if (connected) await menuAdmin();
        break;
      }

      case "2": {
        const connected = await seConnecter("enseignant");
        if (connected) await menuTeacher();
        break;
      }

      case "3": {
        const connected = await seConnecter("student");
        if (connected) await menuStudent();
        break;
      }

      case "0":
        actif = false;
        logger.arret();
        console.log("Au revoir !");
        fermerInterface();
        break;

      default:
        console.log("Choix invalide.");
    }
  }
};

export { menuPrincipal };
