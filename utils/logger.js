// utils/logger.js
import fs from 'fs';
import path from 'path';

// Crée le dossier logs/ s'il n'existe pas encore
const logsDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logsDir, { recursive: true });

// Les 3 fichiers de logs
const fichiers = {
  actions : path.join(logsDir, 'actions.log'),
  erreurs : path.join(logsDir, 'erreurs.log'),
  systeme : path.join(logsDir, 'systeme.log'),
};

// Fonction d'écriture de base
const ecrire = (fichier, niveau, message) => {
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const ligne = `[${date}] [${niveau}] ${message}\n`;
  fs.appendFileSync(fichier, ligne, 'utf8');
};

export const logger = {
  // systeme.log
  demarrage   : ()           => ecrire(fichiers.systeme, 'SYSTEME',     'Application démarrée'),
  arret       : ()           => ecrire(fichiers.systeme, 'SYSTEME',     'Application arrêtée'),
  connexion   : (nom, role)  => ecrire(fichiers.systeme, 'CONNEXION',   `${nom} (${role}) connecté`),
  deconnexion : (nom)        => ecrire(fichiers.systeme, 'DECONNEXION', `${nom} déconnecté`),

  // actions.log
  action      : (nom, acte)  => ecrire(fichiers.actions, 'ACTION',      `${nom} → ${acte}`),

  // erreurs.log
  erreur      : (nom, msg)   => ecrire(fichiers.erreurs, 'ERREUR',      `${nom} : ${msg}`),
  accesRefuse : (nom, msg)   => ecrire(fichiers.erreurs, 'ACCES_REFUSE',`${nom} : ${msg}`),
};