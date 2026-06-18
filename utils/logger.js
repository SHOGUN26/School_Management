// utils/logger.js
import fs from 'fs';
import path from 'path';

// Crée le dossier logs/ à la racine du projet s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logsDir, { recursive: true });

// Fichier unique qui regroupe tous les logs de l'application
const logFile = path.join(logsDir, 'app.log');

// Fonction de base : formate et écrit une ligne dans app.log
const ecrire = (niveau, message) => {
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const ligne = `[${date}] [${niveau}] ${message}\n`;
  fs.appendFileSync(logFile, ligne, 'utf8'); // appendFileSync ajoute à la suite sans écraser
};

// Raccourcis exportés — à appeler depuis les menus et la session
export const logger = {

  // Événements système — démarrage et arrêt de l'application
  demarrage   : ()           => ecrire('SYSTEME',     'Application démarrée'),
  arret       : ()           => ecrire('SYSTEME',     'Application arrêtée'),

  // Événements d'authentification — connexion et déconnexion d'un utilisateur
  connexion   : (nom, role)  => ecrire('CONNEXION',   `${nom} (${role}) connecté`),
  deconnexion : (nom)        => ecrire('DECONNEXION', `${nom} déconnecté`),

  // Actions utilisateur — toute opération réussie (ajout, modification, consultation...)
  action      : (nom, acte)  => ecrire('ACTION',      `${nom} → ${acte}`),

  // Erreurs — opération échouée ou donnée introuvable
  erreur      : (nom, msg)   => ecrire('ERREUR',      `${nom} : ${msg}`),

  // Accès refusé — tentative d'accès à une ressource non autorisée
  accesRefuse : (nom, msg)   => ecrire('ACCES_REFUSE',`${nom} : ${msg}`),
};