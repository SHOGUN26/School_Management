import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  deleteSubject,
  getSubjectByName
} from "../services/subjectService.js";

const router = express.Router();

// GET /api/subjects -> lister toutes les matières
router.get('/', (req, res) => {
  try {
    const subjects = getAllSubjects();
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des matières' });
  }
});

// GET /api/subjects/name/:name -> une matière par son nom
// (placée AVANT /:id pour éviter qu'Express confonde "name" avec un id)
router.get('/name/:name', (req, res) => {
  try {
    const subject = getSubjectByName(req.params.name);
    if (!subject) {
      return res.status(404).json({ error: 'Matière introuvable' });
    }
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la matière' });
  }
});

// GET /api/subjects/:id -> une matière par id
router.get('/:id', (req, res) => {
  try {
    const subject = getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Matière introuvable' });
    }
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la matière' });
  }
});

// POST /api/subjects -> créer une matière
router.post('/', (req, res) => {
  try {
    const { nom, teacher_id } = req.body;

    if (!nom || !teacher_id) {
      return res.status(400).json({ error: 'Champs manquants (nom et teacher_id requis)' });
    }

    createSubject(nom, teacher_id);
    res.status(201).json({ message: 'Matière créée' });
  } catch (err) {
    // createSubject lance une erreur si le professeur n'existe pas
    if (err.message.includes('introuvable')) {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de la matière' });
  }
});

// DELETE /api/subjects/:id -> supprimer une matière
router.delete('/:id', (req, res) => {
  try {
    const existing = getSubjectById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Matière introuvable' });
    }

    deleteSubject(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la matière' });
  }
});

export default router;