import express from 'express';
import jwt from 'jsonwebtoken';                          // ← AJOUT
import { getAllUsers } from '../services/userService.js';
import { getClassesByTeacher } from '../services/teacherClasseService.js';
import db from '../db/database.js';
import { logger } from '../utils/logger.js';
import { JWT_SECRET } from '../utils/authMiddleware.js';
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

  // ← AJOUT : génère le token une seule fois, avant de brancher selon le rôle
  const token = jwt.sign(
    { id: user.id, pseudo: user.pseudo, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  // ← AJOUT : on ne renvoie jamais le mot de passe, même dans la réponse de login
  const { password: _pwd, ...safeUser } = user;

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
      token,           // ← AJOUT
      user: safeUser,  // ← MODIF (était juste "user")
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
      token,           // ← AJOUT
      user: safeUser,  // ← MODIF
      teacher,
      classes
    });

  } else {
    logger.connexion(user.name, user.role);

    return res.json({
      message: `Bienvenue ${user.name} (${user.role}) !`,
      role: user.role,
      token,           // ← AJOUT
      user: safeUser   // ← MODIF
    });
  }
});

export default router;