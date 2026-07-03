import express from 'express';
import { getAllUsers } from '../services/userService.js';
import { getClassesByTeacher } from '../services/teacherClasseService.js';
import db from '../db/database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
  }

  const users = getAllUsers();
  const user = users.find(
    (u) => u.pseudo === pseudo && u.password === password
  );

  if (!user) {
    logger.erreur(pseudo, 'Tentative de connexion échouée');
    return res.status(401).json({ error: 'Pseudo ou mot de passe incorrect' });
  }

  // On construit la réponse selon le rôle, comme dans ton CLI
  if (user.role === 'student') {
    const student = db.prepare(`SELECT * FROM students WHERE user_id = ?`).get(user.id);

    if (!student) {
      logger.erreur(pseudo, 'Connexion étudiant sans correspondance');
      return res.status(404).json({ error: 'Aucun étudiant trouvé correspondant à votre compte' });
    }

    logger.connexion(`${student.nom} ${student.prenom}`, 'étudiant');

    return res.json({
      message: `Bienvenue ${student.nom} ${student.prenom} !`,
      role: 'student',
      user,
      student
    });

  } else if (user.role === 'enseignant') {
    const teacher = db.prepare(`SELECT * FROM teachers WHERE user_id = ?`).get(user.id);

    if (!teacher) {
      logger.erreur(pseudo, 'Connexion enseignant sans correspondance');
      return res.status(404).json({ error: 'Aucun enseignant trouvé correspondant à votre compte' });
    }

    const classes = getClassesByTeacher(teacher.id);

    logger.connexion(teacher.nom, 'enseignant');

    return res.json({
      message: `Bienvenue ${teacher.nom} !`,
      role: 'enseignant',
      user,
      teacher,
      classes
    });

  } else {
    logger.connexion(user.name, user.role);

    return res.json({
      message: `Bienvenue ${user.name} (${user.role}) !`,
      role: user.role,
      user
    });
  }
});

export default router;