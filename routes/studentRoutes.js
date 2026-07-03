import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../services/studentService.js';

const router = express.Router();

// GET /api/students -> lister tous les étudiants
router.get('/', (req, res) => {
  try {
    const students = getAllStudents();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des étudiants' });
  }
});

// GET /api/students/:id -> un étudiant précis
router.get('/:id', (req, res) => {
  try {
    const student = getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Étudiant introuvable' });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'étudiant' });
  }
});

// POST /api/students -> créer un étudiant
router.post('/', (req, res) => {
  try {
    const { matricule, nom, prenom, age, classe, user_id } = req.body;

    if (!matricule || !nom || !prenom || !age || !classe) {
      return res.status(400).json({ error: 'Champs manquants (matricule, nom, prenom, age, classe requis)' });
    }

    const result = createStudent(matricule, nom, prenom, age, classe, user_id ?? null);
    res.status(201).json({ message: 'Étudiant créé', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'étudiant' });
  }
});

// PUT /api/students/:id -> modifier un étudiant
router.put('/:id', (req, res) => {
  try {
    const existing = getStudentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Étudiant introuvable' });
    }

    updateStudent(req.params.id, req.body);
    res.json({ message: 'Étudiant mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'étudiant' });
  }
});

// DELETE /api/students/:id -> supprimer un étudiant
router.delete('/:id', (req, res) => {
  try {
    const existing = getStudentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Étudiant introuvable' });
    }

    deleteStudent(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'étudiant' });
  }
});

export default router;