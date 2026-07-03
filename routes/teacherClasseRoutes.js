import express from 'express';
import {
  assignerClasse,
  getClassesByTeacher,
  getStudentsByClasseAndTeacher,
  retirerClasse
} from "../services/teacherClasseService.js";

const router = express.Router();

// POST /api/teacher-classes -> assigner une classe à un professeur
router.post('/', (req, res) => {
  try {
    const { teacher_id, classe } = req.body;

    if (!teacher_id || !classe) {
      return res.status(400).json({ error: 'Champs manquants (teacher_id et classe requis)' });
    }

    assignerClasse(teacher_id, classe);
    res.status(201).json({ message: 'Classe assignée au professeur' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de la classe' });
  }
});

// GET /api/teacher-classes/teacher/:teacherId -> classes d'un professeur
router.get('/teacher/:teacherId', (req, res) => {
  try {
    const classes = getClassesByTeacher(req.params.teacherId);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des classes' });
  }
});

// GET /api/teacher-classes/teacher/:teacherId/classe/:classe/students -> étudiants d'une classe pour ce prof
router.get('/teacher/:teacherId/classe/:classe/students', (req, res) => {
  try {
    const students = getStudentsByClasseAndTeacher(req.params.teacherId, req.params.classe);
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des étudiants' });
  }
});

// DELETE /api/teacher-classes -> retirer une classe d'un professeur
router.delete('/', (req, res) => {
  try {
    const { teacher_id, classe } = req.body;

    if (!teacher_id || !classe) {
      return res.status(400).json({ error: 'Champs manquants (teacher_id et classe requis)' });
    }

    retirerClasse(teacher_id, classe);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la classe' });
  }
});

export default router;