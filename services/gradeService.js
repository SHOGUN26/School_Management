import db from "../db/database.js";
import Grades from "../models/gardeModel.js";


// ─────────────────────────────
// AJOUT NOTE
// ─────────────────────────────
const addMultipleGrades = (student_id, subject_id, note) => {
  const addGrade = new Grades(student_id, subject_id, note);

  return db.prepare(`
    INSERT INTO grades(student_id, subject_id, note)
    VALUES (?, ?, ?)
  `).run(
    addGrade.student_id,
    addGrade.subject_id,
    addGrade.note
  );
};


// ─────────────────────────────
// MODIFIER NOTE
// ─────────────────────────────
const updateGrades = (id, data) => {
  return db.prepare(`
    UPDATE grades 
    SET note = ?
    WHERE id = ?
  `).run(data.note, id);
};


// ─────────────────────────────
// SUPPRIMER NOTE
// ─────────────────────────────
const deleteGrades = (id) => {
  return db.prepare(`
    DELETE FROM grades 
    WHERE id = ?
  `).run(id);
};


// ─────────────────────────────
// NOTES D'UN ÉTUDIANT (TOUTES MATIÈRES)
// ─────────────────────────────
const getStudentGrades = (studentId) => {
  return db.prepare(`
    SELECT 
      subjects.nom AS matiere,
      grades.note,
      grades.subject_id
    FROM grades
    JOIN subjects ON grades.subject_id = subjects.id
    WHERE grades.student_id = ?
  `).all(studentId);
};


// ─────────────────────────────
// MOYENNE PAR MATIÈRE
// ─────────────────────────────
const getAverageBySubject = (student_id, subject_id) => {
  const grades = db.prepare(`
    SELECT note
    FROM grades
    WHERE student_id = ? AND subject_id = ?
  `).all(student_id, subject_id);

  if (grades.length === 0) return null;

  const sum = grades.reduce((acc, g) => acc + g.note, 0);

  return sum / grades.length;
};


// ─────────────────────────────
// MOYENNE GLOBALE ÉTUDIANT
// ─────────────────────────────
const calculateAverage = (student_id) => {
  const grades = db.prepare(`
    SELECT note
    FROM grades
    WHERE student_id = ?
  `).all(student_id);

  if (grades.length === 0) return null;

  const sum = grades.reduce((acc, g) => acc + g.note, 0);

  return sum / grades.length;
};


// ─────────────────────────────
// MEILLEUR ÉTUDIANT PAR MATIÈRE
// ─────────────────────────────
const getBestStudentInSubject = (subject_id) => {
  const students = db.prepare(`
    SELECT DISTINCT student_id
    FROM grades
    WHERE subject_id = ?
  `).all(subject_id);

  let bestStudent = null;
  let bestAverage = null;

  for (const s of students) {
    const avg = getAverageBySubject(s.student_id, subject_id);

    if (avg !== null && (bestAverage === null || avg > bestAverage)) {
      bestAverage = avg;
      bestStudent = s.student_id;
    }
  }

  if (bestStudent === null) {
    return { student_id: null, average: null };
  }

  return {
    student_id: bestStudent,
    average: bestAverage
  };
};


// ─────────────────────────────
// EXPORTS
// ─────────────────────────────
export {
  addMultipleGrades,
  updateGrades,
  deleteGrades,
  getStudentGrades,
  calculateAverage,
  getAverageBySubject,
  getBestStudentInSubject
};