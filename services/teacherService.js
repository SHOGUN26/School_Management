import db from "../db/database.js";
import Teacher from "../models/teacherModel.js";

//CREATION OU AJOUT DE PROFESSEUR

const createTeacher = (nom, matiere) => {
  //AJOUT DU PROF EN FONCTION DU MODEL TEACHER
  const addTeacher = new Teacher(nom, matiere);

  const insertTeachers = db.prepare(`
        INSERT OR IGNORE INTO teachers (nom, matiere)
        VALUES(?,?)
        `);

  return insertTeachers.run(
    addTeacher.nom,
    addTeacher.matiere,
    addTeacher.password,
  );
};

//MODIFIER UN PROFESSEUR
const updateTeacher = (id, data) => {
  const updateTeacherStmt = db.prepare(`
        UPDATE teachers SET nom = ?, matiere = ?
        WHERE id = ?

    `);

  return updateTeacherStmt.run(data.nom, data.matiere, id);
};

//SUPPRESSION D'UN PROFESSEUR

const deleteTeacher = (id) => {
  return db
    .prepare(
      `
            DELETE FROM teachers WHERE id = ?
        `,
    )
    .run(id);
};

//RECHERCHE ET AFFICHE D'UN PROFESSEUR

// afficher tout les professeurs
const getAllTeachers = () => {
  return db
    .prepare(
      `
            SELECT * FROM teachers
        `,
    )
    .all();
};

// afficher un professeur grâce à son id
const getTeacherById = (id) => {
  return db
    .prepare(
      `
            SELECT * FROM teachers
            WHERE id = ?
        `,
    )
    .get(id);
};

export {
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllTeachers,
  getTeacherById,
};
