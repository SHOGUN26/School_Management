import express from 'express';
import {
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllTeachers,
  getTeacherById
} from "../services/teacherService.js";

const router = express.Router();

// GET /api/teachers -> lister tous les professeurs
router.get('/', (req, res) => {
  try {
    const teachers = getAllTeachers();
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des professeurs' });
  }
});

// GET /api/teachers/:id -> un professeur précis
router.get('/:id', (req, res) => {
  try {
    const teacher = getTeacherById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Professeur introuvable' });
    }
    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du professeur' });
  }
});

// POST /api/teachers -> créer un professeur
router.post('/', (req, res) => {
  try {
    const { nom, matiere, user_id } = req.body;

    if (!nom || !matiere) {
      return res.status(400).json({ error: 'Champs manquants (nom et matiere requis)' });
    }

    const result = createTeacher(nom, matiere, user_id ?? null);
    res.status(201).json({ message: 'Professeur créé', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du professeur' });
  }
});

// PUT /api/teachers/:id -> modifier un professeur
router.put('/:id', (req, res) => {
  try {
    const existing = getTeacherById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Professeur introuvable' });
    }

    updateTeacher(req.params.id, req.body);
    res.json({ message: 'Professeur mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du professeur' });
  }
});

// DELETE /api/teachers/:id -> supprimer un professeur (+ matières et notes liées)
router.delete('/:id', (req, res) => {
  try {
    const existing = getTeacherById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Professeur introuvable' });
    }

    deleteTeacher(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du professeur' });
  }
});

export default router;