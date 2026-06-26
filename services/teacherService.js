import db from "../db/database.js";
import Teacher from "../models/teacherModel.js";

// Créer un professeur
const createTeacher = (nom, matiere, user_id = null) => {
  const addTeacher = new Teacher(nom, matiere, user_id);

  const insertTeachers = db.prepare(`
    INSERT OR IGNORE INTO teachers(nom, matiere, user_id)
    VALUES(?, ?, ?)
  `);

  return insertTeachers.run(
    addTeacher.nom,
    addTeacher.matiere,
    addTeacher.user_id
  );
};

// Modifier un professeur
const updateTeacher = (id, data) => {
  const updateTeacherStmt = db.prepare(`
    UPDATE teachers
    SET nom = ?, matiere = ?, user_id = ?
    WHERE id = ?
  `);

  return updateTeacherStmt.run(
    data.nom,
    data.matiere,
    data.user_id ?? null,
    id
  );
};

// Supprimer un professeur et tout ce qui lui est lié
const deleteTeacher = (id) => {
  const transaction = db.transaction(() => {
    const subjects = db.prepare(`SELECT id FROM subjects WHERE teacher_id = ?`).all(id);

    for (const subject of subjects) {
      db.prepare(`DELETE FROM grades WHERE subject_id = ?`).run(subject.id);
    }

    db.prepare(`DELETE FROM subjects WHERE teacher_id = ?`).run(id);
    return db.prepare(`DELETE FROM teachers WHERE id = ?`).run(id);
  });

  return transaction();
};

// Afficher tous les professeurs
const getAllTeachers = () => {
  return db.prepare(`SELECT * FROM teachers`).all();
};

// Afficher un professeur par id
const getTeacherById = (id) => {
  return db.prepare(`SELECT * FROM teachers WHERE id = ?`).get(id);
};

export { createTeacher, updateTeacher, deleteTeacher, getAllTeachers, getTeacherById };