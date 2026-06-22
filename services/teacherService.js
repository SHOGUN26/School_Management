import db from "../db/database.js";
import Teacher from "../models/teacherModel.js";

// CREATION OU AJOUT DE PROFESSEUR
const createTeacher = (nom, matiere) => {
  const addTeacher = new Teacher(nom, matiere);
  const insertTeachers = db.prepare(`
    INSERT OR IGNORE INTO teachers (nom, matiere)
    VALUES(?, ?)
  `);
  return insertTeachers.run(addTeacher.nom, addTeacher.matiere);
};

// MODIFIER UN PROFESSEUR
const updateTeacher = (id, data) => {
  const updateTeacherStmt = db.prepare(`
    UPDATE teachers SET nom = ?, matiere = ?
    WHERE id = ?
  `);
  return updateTeacherStmt.run(data.nom, data.matiere, id);
};

// SUPPRIMER UN PROFESSEUR ET TOUT CE QUI LUI EST LIÉ
const deleteTeacher = (id) => {
  const transaction = db.transaction(() => {
    // Récupérer les matières liées au prof
    const subjects = db.prepare(`SELECT id FROM subjects WHERE teacher_id = ?`).all(id);

    // Pour chaque matière, supprimer les notes associées
    for (const subject of subjects) {
      db.prepare(`DELETE FROM grades WHERE subject_id = ?`).run(subject.id);
    }

    // Supprimer les matières du prof
    db.prepare(`DELETE FROM subjects WHERE teacher_id = ?`).run(id);

    // Supprimer le prof
    return db.prepare(`DELETE FROM teachers WHERE id = ?`).run(id);
  });

  return transaction();
};

// AFFICHER TOUS LES PROFESSEURS
const getAllTeachers = () => {
  return db.prepare(`SELECT * FROM teachers`).all();
};

// AFFICHER UN PROFESSEUR PAR ID
const getTeacherById = (id) => {
  return db.prepare(`SELECT * FROM teachers WHERE id = ?`).get(id);
};

export { createTeacher, updateTeacher, deleteTeacher, getAllTeachers, getTeacherById };