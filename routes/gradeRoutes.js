import express from 'express';
import {
  addMultipleGrades,
  updateGrades,
  deleteGrades,
  getStudentGrades,
  calculateAverage,
  getAverageBySubject,
  getBestStudentInSubject
} from "../services/gradeService.js";

const router = express.Router();

// POST /api/grades -> ajouter une note
router.post('/', (req, res) => {
  try {
    const { student_id, subject_id, note } = req.body;

    if (!student_id || !subject_id || note === undefined) {
      return res.status(400).json({ error: 'Champs manquants (student_id, subject_id, note requis)' });
    }

    const result = addMultipleGrades(student_id, subject_id, note);
    res.status(201).json({ message: 'Note ajoutée', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la note' });
  }
});

// PUT /api/grades/:id -> modifier une note
router.put('/:id', (req, res) => {
  try {
    const { note } = req.body;

    if (note === undefined) {
      return res.status(400).json({ error: 'Le champ note est requis' });
    }

    updateGrades(req.params.id, { note });
    res.json({ message: 'Note mise à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la note' });
  }
});

// DELETE /api/grades/:id -> supprimer une note
router.delete('/:id', (req, res) => {
  try {
    deleteGrades(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la note' });
  }
});

// GET /api/grades/student/:studentId -> toutes les notes d'un étudiant
router.get('/student/:studentId', (req, res) => {
  try {
    const grades = getStudentGrades(req.params.studentId);
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
  }
});

// GET /api/grades/student/:studentId/average -> moyenne générale de l'étudiant
router.get('/student/:studentId/average', (req, res) => {
  try {
    const average = calculateAverage(req.params.studentId);
    res.json({ student_id: req.params.studentId, average });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du calcul de la moyenne' });
  }
});

// GET /api/grades/student/:studentId/subject/:subjectId/average -> moyenne dans une matière
router.get('/student/:studentId/subject/:subjectId/average', (req, res) => {
  try {
    const average = getAverageBySubject(req.params.studentId, req.params.subjectId);
    res.json({ student_id: req.params.studentId, subject_id: req.params.subjectId, average });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du calcul de la moyenne par matière' });
  }
});

// GET /api/grades/subject/:subjectId/best-student -> meilleur étudiant dans une matière
router.get('/subject/:subjectId/best-student', (req, res) => {
  try {
    const best = getBestStudentInSubject(req.params.subjectId);
    res.json(best);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la recherche du meilleur étudiant' });
  }
});

export default router;