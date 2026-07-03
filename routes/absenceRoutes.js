import express from 'express';
import {
  createAbsence,
  marquerAbsence,
  getAbsencesByStudent,
  countUnjustifiedAbsences
} from "../services/absenceService.js";

const router = express.Router();

// POST /api/absences -> enregistrer une absence
router.post('/', (req, res) => {
  try {
    const { student_id, status } = req.body;

    if (!student_id || !status) {
      return res.status(400).json({ error: 'Champs manquants (student_id et status requis)' });
    }

    const result = createAbsence(student_id, status);
    res.status(201).json({ message: 'Absence enregistrée', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'absence' });
  }
});

// PUT /api/absences/:id -> marquer justifiée / non justifiée
router.put('/:id', (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Le champ status est requis (ex: "justifiee" ou "non_justifiee")' });
    }

    marquerAbsence(req.params.id, status);
    res.json({ message: 'Statut de l\'absence mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'absence' });
  }
});

// GET /api/absences/student/:studentId -> historique des absences d'un étudiant
router.get('/student/:studentId', (req, res) => {
  try {
    const absences = getAbsencesByStudent(req.params.studentId);
    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des absences' });
  }
});

// GET /api/absences/student/:studentId/count-unjustified -> compter les absences non justifiées
router.get('/student/:studentId/count-unjustified', (req, res) => {
  try {
    const total = countUnjustifiedAbsences(req.params.studentId);
    res.json({ student_id: req.params.studentId, absences_non_justifiees: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du comptage des absences' });
  }
});

export default router;