import db from "../db/database.js";
import TeacherClasse from "../models/teacherClasseModel.js";

// Assigner une classe à un professeur
const assignerClasse = (teacher_id, classe) => {
  const newClasse = new TeacherClasse(teacher_id, classe);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO teacher_classes(teacher_id, classe)
    VALUES(?, ?)
  `);

  return insert.run(newClasse.teacher_id, newClasse.classe);
};

// Récupérer toutes les classes d'un professeur
const getClassesByTeacher = (teacher_id) => {
  return db.prepare(`
    SELECT * FROM teacher_classes
    WHERE teacher_id = ?
  `).all(teacher_id);
};

// Récupérer les étudiants d'une classe d'un professeur
const getStudentsByClasseAndTeacher = (teacher_id, classe) => {
  return db.prepare(`
    SELECT students.*
    FROM students
    JOIN teacher_classes ON students.classe = teacher_classes.classe
    WHERE teacher_classes.teacher_id = ?
    AND teacher_classes.classe = ?
  `).all(teacher_id, classe);
};

// Supprimer une classe d'un professeur
const retirerClasse = (teacher_id, classe) => {
  return db.prepare(`
    DELETE FROM teacher_classes
    WHERE teacher_id = ? AND classe = ?
  `).run(teacher_id, classe);
};

export { assignerClasse, getClassesByTeacher, getStudentsByClasseAndTeacher, retirerClasse };