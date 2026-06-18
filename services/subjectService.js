import db from "../db/database.js";
import Subject from "../models/subjectModel.js";

//AJOUTER UNE MATIERE

const createSubject = (nom, teacher_id) => {
  // Vérifier que le professeur existe afin d'éviter les ajouts de matières sans enseignant
  const teacher = db
    .prepare(
      `
        SELECT id FROM teachers 
        WHERE id = ?`,
    )
    .get(teacher_id);
  if (!teacher) {
    throw new Error(`Professeur avec l'id ${teacher_id} introuvable.`);
  }
  //AJOUT D'UNE MATTIERE EN FONCTION DU MODEL SUBJECT
  const addSubject = new Subject(nom, teacher_id);

  const insertSubjects = db.prepare(`
        INSERT OR IGNORE INTO subjects (nom, teacher_id)
        VALUES(?,?)
        `);

  insertSubjects.run(addSubject.nom, addSubject.teacher_id);
};

//LISTE DES MATIERES

//affichage de toutes les matières
const getAllSubjects = () => {
  return db
    .prepare(
      `
            SELECT * FROM subjects
        `,
    )
    .all();
};

//affichage d'une matière à partir de son id
const getSubjectById = (id) => {
  return db
    .prepare(
      `
            SELECT * FROM subjects
            WHERE id = ?
        `,
    )
    .get(id);
};

// //AFFECTATION D'UNE MATIERE A UN PROFESSEUR
// const affectTeacherSubject = (subjectId, teacherId) => {
//     const assign = db.prepare(`
//         UPDATE subjects
//         SET teacher_id = ?
//         WHERE id = ?
//     `);

//     return assign.run(teacherId, subjectId);
// };

//SUPPRESSION D'UNE MATIERE

const deleteSubject = (id) => {
  return db
    .prepare(
      `
            DELETE FROM subjects WHERE id = ?
        `,
    )
    .run(id);
};

export  {
  createSubject,
  getAllSubjects,
  getSubjectById,
  // affectTeacherSubject,
  deleteSubject,
};
